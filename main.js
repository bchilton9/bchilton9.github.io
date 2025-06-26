const colorThemes = [
  'blue', 'green', 'purple', 'red', 'orange', 'gray', 'yellow', 'pink',
  'cyan', 'lime', 'teal', 'indigo', 'brown', 'amber', 'deeporange'
];

let currentPage = 1;
const articlesPerPage = 4;
let allArticles = [];
let filteredArticles = [];

function initHeaderScripts() {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }

  createColorSelector();
  loadColorTheme();
}

function createColorSelector() {
  if (document.getElementById('colorSelectorContainer')) return; // avoid duplicates

  const menuIcons = document.querySelector('.menu-icons');
  if (!menuIcons) return;

  const container = document.createElement('div');
  container.id = 'colorSelectorContainer';
  container.style.marginLeft = '1rem';

  const label = document.createElement('label');
  label.htmlFor = 'colorSelector';
  label.textContent = 'Theme: ';
  label.style.color = 'var(--foreground)';
  label.style.fontSize = '0.9rem';
  label.style.userSelect = 'none';

  const select = document.createElement('select');
  select.id = 'colorSelector';
  select.style.padding = '0.2rem 0.5rem';
  select.style.borderRadius = '6px';
  select.style.border = 'none';
  select.style.cursor = 'pointer';
  select.style.fontSize = '1rem';

  colorThemes.forEach(theme => {
    const option = document.createElement('option');
    option.value = theme;
    option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    select.appendChild(option);
  });

  select.addEventListener('change', () => {
    setColorTheme(select.value);
  });

  container.appendChild(label);
  container.appendChild(select);
  menuIcons.appendChild(container);
}

function setColorTheme(theme) {
  colorThemes.forEach(t => document.body.classList.remove(`theme-${t}`));
  if (theme && colorThemes.includes(theme)) {
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('colorTheme', theme);
  }
}

function loadColorTheme() {
  const savedTheme = localStorage.getItem('colorTheme') || 'blue';
  const selector = document.getElementById('colorSelector');
  if (selector) {
    selector.value = savedTheme;
  }
  setColorTheme(savedTheme);
}

fetch('header.html').then(res => res.text()).then(html => {
  document.getElementById('header-placeholder').innerHTML = html;
  initHeaderScripts();
  loadArticles();
});

fetch('footer.html').then(res => res.text()).then(html => {
  document.getElementById('footer-placeholder').innerHTML = html;
});

function renderCategories(categories) {
  const menuList = document.getElementById('articleList');
  menuList.innerHTML = '';

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'nav-cat-btn';
    btn.textContent = cat;
    btn.type = 'button';
    btn.addEventListener('click', () => {
      currentPage = 1;
      filterArticlesByCategory(cat);
      document.getElementById('navLinks').classList.remove('open');
    });
    menuList.appendChild(btn);
  });
}

function filterArticlesByCategory(category) {
  if (category === 'All') {
    filteredArticles = allArticles.slice();
  } else {
    filteredArticles = allArticles.filter(article => article.categories.includes(category));
  }
  currentPage = 1;
  renderArticlesPage(filteredArticles, currentPage);
  renderPagination(filteredArticles.length);
}

function renderArticlesPage(data, page) {
  const container = document.getElementById('articles');
  container.innerHTML = '';
  const start = (page - 1) * articlesPerPage;
  const pagedArticles = data.slice(start, start + articlesPerPage);

  pagedArticles.forEach(article => {
    const card = document.createElement('article');
    card.setAttribute('data-categories', article.categories.join(','));

    card.innerHTML = `
      <h2>${article.title}</h2>
      ${article.image ? `<img src="${article.image}" alt="${article.title}" />` : ""}
      <p>${article.summary}</p>
      <div class="card-buttons">
        <button data-id="${article.id}" class="readMore" type="button">Read more →</button>
        <button data-id="${article.id}" class="shareLink" type="button">🔗 Share</button>
      </div>
    `;
    container.appendChild(card);
  });

  attachArticleButtons();
}

function attachArticleButtons() {
  document.querySelectorAll('.readMore').forEach(btn => {
    btn.onclick = () => loadMarkdown(btn.dataset.id);
  });

  document.querySelectorAll('.shareLink').forEach(btn => {
    btn.onclick = (e) => {
      const btn = e.target;
      const link = `${window.location.origin}${window.location.pathname}#${btn.dataset.id}`;
      navigator.clipboard.writeText(link).then(() => {
        btn.textContent = "✅ Copied!";
        setTimeout(() => btn.textContent = "🔗 Share", 1500);
      }).catch(() => {
        alert('Failed to copy link. Please copy manually:\n' + link);
      });
    };
  });
}

function renderPagination(totalArticles) {
  let pagination = document.querySelector('.pagination');
  if (!pagination) {
    pagination = document.createElement('div');
    pagination.className = 'pagination';
    pagination.innerHTML = `
      <button id="prevPage" type="button">← Previous</button>
      <button id="nextPage" type="button">Next →</button>
    `;
    document.getElementById('articles').after(pagination);

    // Attach event listeners to pagination buttons once
    document.getElementById('prevPage').addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderArticlesPage(filteredArticles, currentPage);
        updatePaginationButtons(totalArticles);
        scrollToTopArticles();
      }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
      if (currentPage * articlesPerPage < totalArticles) {
        currentPage++;
        renderArticlesPage(filteredArticles, currentPage);
        updatePaginationButtons(totalArticles);
        scrollToTopArticles();
      }
    });
  }
  updatePaginationButtons(totalArticles);
}

function updatePaginationButtons(totalArticles) {
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  if (!prevBtn || !nextBtn) return;

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage * articlesPerPage >= totalArticles;
}

// Scroll back to top of articles list on pagination
function scrollToTopArticles() {
  const articlesContainer = document.getElementById('articles');
  if (articlesContainer) articlesContainer.scrollIntoView({ behavior: 'smooth' });
}

function loadArticles() {
  fetch('articles.json')
    .then(res => res.json())
    .then(data => {
      allArticles = data;
      filteredArticles = allArticles.slice();

      const allCategoriesSet = new Set();
      allArticles.forEach(a => a.categories.forEach(c => allCategoriesSet.add(c)));
      const categories = ['All', ...Array.from(allCategoriesSet).sort()];
      renderCategories(categories);

      renderArticlesPage(filteredArticles, currentPage);
      renderPagination(filteredArticles.length);

      setupSearch();
      setupCategoryFilters(categories);
    })
    .catch(e => {
      console.error('Failed to load articles:', e);
    });
}

function setupSearch() {
  const searchBox = document.getElementById('searchBox');
  searchBox.oninput = () => {
    const term = searchBox.value.toLowerCase();
    filteredArticles = allArticles.filter(article => {
      return article.title.toLowerCase().includes(term) ||
             article.summary.toLowerCase().includes(term) ||
             article.categories.some(cat => cat.toLowerCase().includes(term));
    });
    currentPage = 1;
    renderArticlesPage(filteredArticles, currentPage);
    renderPagination(filteredArticles.length);
  };
}

function setupCategoryFilters(categories) {
  const filterContainer = document.getElementById('categoryFilters');
  filterContainer.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.dataset.cat = cat;
    if (cat === 'All') btn.classList.add('active');
    btn.onclick = () => {
      document.querySelectorAll('#categoryFilters button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterArticlesByCategory(cat);
      currentPage = 1;
      renderPagination(filteredArticles.length);
    };
    filterContainer.appendChild(btn);
  });
}

function loadMarkdown(id) {
  fetch(`articles/${id}.md`)
    .then(res => res.text())
    .then(markdown => {
      document.getElementById('articles').style.display = 'none';
      document.getElementById('searchBox').style.display = 'none';
      document.getElementById('categoryFilters').style.display = 'none';

      const viewer = document.getElementById('articleContent');
      viewer.innerHTML = marked.parse(markdown);

      // Add share button below article content
      const share = document.createElement('button');
      share.textContent = '🔗 Share';
      share.type = 'button';
      share.onclick = () => {
        const link = `${window.location.origin}${window.location.pathname}#${id}`;
        navigator.clipboard.writeText(link).then(() => {
          share.textContent = '✅ Copied!';
          setTimeout(() => (share.textContent = '🔗 Share'), 1500);
        }).catch(() => {
          alert('Failed to copy link. Please copy manually:\n' + link);
        });
      };
      share.style.marginTop = '1rem';
      viewer.appendChild(share);

      viewer.style.display = 'block';
      document.getElementById('backButton').style.display = 'inline-block';
      document.getElementById('navLinks').classList.remove('open');
    })
    .catch(err => {
      alert('Failed to load article content.');
      console.error(err);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backButton');
  backBtn.addEventListener('click', () => {
    document.getElementById('articles').style.display = 'block';
    document.getElementById('searchBox').style.display = 'block';
    document.getElementById('categoryFilters').style.display = 'flex';
    const articleContent = document.getElementById('articleContent');
    if(articleContent) articleContent.style.display = 'none';
    backBtn.style.display = 'none';
    window.location.hash = '';
  });

  const hash = window.location.hash.slice(1);
  if (hash) {
    setTimeout(() => loadMarkdown(hash), 300);
  }
});