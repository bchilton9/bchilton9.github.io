let currentPage = 1;
const articlesPerPage = 4;
let allArticles = [];
let filteredArticles = [];

const colorThemes = [
  'blue', 'green', 'purple', 'red', 'orange', 'gray', 'yellow', 'pink',
  'cyan', 'lime', 'teal', 'indigo', 'brown', 'amber', 'deeporange'
];

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

  // Initialize color theme selector UI
  createColorSelector();
  loadColorTheme();
}

// Create the color theme selector dropdown and add it to header
function createColorSelector() {
  const header = document.querySelector('header');
  if (!header) return;

  const container = document.createElement('div');
  container.id = 'colorSelectorContainer';
  container.style.marginLeft = '1rem';
  container.style.position = 'relative';
  container.style.display = 'inline-block';

  const label = document.createElement('label');
  label.htmlFor = 'colorSelector';
  label.textContent = 'Theme: ';
  label.style.color = 'var(--foreground)';
  label.style.fontSize = '0.9rem';
  label.style.userSelect = 'none';

  const select = document.createElement('select');
  select.id = 'colorSelector';
  select.style.padding = '0.3rem 0.8rem';
  select.style.borderRadius = '8px';
  select.style.border = 'none';
  select.style.cursor = 'pointer';
  select.style.fontSize = '1.2rem';
  select.style.fontFamily = 'inherit';
  select.style.backgroundColor = 'var(--background)';
  select.style.color = 'var(--foreground)';
  select.style.appearance = 'none';
  select.style.WebkitAppearance = 'none';
  select.style.MozAppearance = 'none';
  select.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  select.style.paddingRight = '2rem'; // space for custom arrow

  colorThemes.forEach(theme => {
    const option = document.createElement('option');
    option.value = theme;
    option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    select.appendChild(option);
  });

  select.onchange = () => {
    setColorTheme(select.value);
  };

  container.appendChild(label);
  container.appendChild(select);
  header.querySelector('.menu-icons').appendChild(container);
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

// Load header and footer
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
    btn.onclick = () => {
      currentPage = 1;
      filterArticlesByCategory(cat);
      document.getElementById('navLinks').classList.remove('open');
    };
    menuList.appendChild(btn);
  });
}

function filterArticlesByCategory(category) {
  if (category === 'All') {
    filteredArticles = allArticles.slice();
  } else {
    filteredArticles = allArticles.filter(article => article.categories.includes(category));
  }
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
        <button data-id="${article.id}" class="readMore">Read more →</button>
        <button data-id="${article.id}" class="shareLink">🔗 Share</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Use event delegation to fix button issues
document.getElementById('articles').addEventListener('click', e => {
  if (e.target.classList.contains('readMore')) {
    loadMarkdown(e.target.dataset.id);
  }
  if (e.target.classList.contains('shareLink')) {
    const link = `${window.location.origin}${window.location.pathname}#${e.target.dataset.id}`;
    navigator.clipboard.writeText(link).then(() => {
      const btn = e.target;
      btn.textContent = "✅ Copied!";
      setTimeout(() => btn.textContent = "🔗 Share", 1500);
    }).catch(() => {
      alert('Failed to copy link. Please copy manually:\n' + link);
    });
  }
});

function renderPagination(totalArticles) {
  let pagination = document.querySelector('.pagination');
  if (!pagination) {
    pagination = document.createElement('div');
    pagination.className = 'pagination';
    pagination.innerHTML = `
      <button id="prevPage">← Previous</button>
      <button id="nextPage">Next →</button>
    `;
    document.getElementById('articles').after(pagination);

    document.getElementById('prevPage').onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        renderArticlesPage(filteredArticles, currentPage);
        updatePaginationButtons(totalArticles);
      }
    };

    document.getElementById('nextPage').onclick = () => {
      if (currentPage * articlesPerPage < totalArticles) {
        currentPage++;
        renderArticlesPage(filteredArticles, currentPage);
        updatePaginationButtons(totalArticles);
      }
    };
  }
  updatePaginationButtons(totalArticles);
}

function updatePaginationButtons(totalArticles) {
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage * articlesPerPage >= totalArticles;
}

function loadArticles() {
  fetch('articles.json')
    .then(res => res.json())
    .then(data => {
      allArticles = data;
      filteredArticles = allArticles.slice();

      // Extract categories + "All"
      const allCategoriesSet = new Set();
      allArticles.forEach(a => a.categories.forEach(c => allCategoriesSet.add(c)));
      const categories = ['All', ...Array.from(allCategoriesSet).sort()];
      renderCategories(categories);

      renderArticlesPage(filteredArticles, currentPage);
      renderPagination(filteredArticles.length);

      setupSearch();
      setupCategoryFilters(categories);
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

      // Share button below article
      const share = document.createElement('button');
      share.textContent = '🔗 Share';
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
    });
}

// Back button returns to main list
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('backButton').addEventListener('click', () => {
    document.getElementById('articles').style.display = 'block';
    document.getElementById('searchBox').style.display = 'block';
    document.getElementById('categoryFilters').style.display = 'flex';
    document.getElementById('articleContent').style.display = 'none';
    document.getElementById('backButton').style.display = 'none';
    window.location.hash = '';
  });

  // Load article from hash on load
  const hash = window.location.hash.slice(1);
  if (hash) {
    setTimeout(() => loadMarkdown(hash), 300);
  }
});