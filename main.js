let currentPage = 1;
const articlesPerPage = 4;
let allArticles = [];
let filteredArticles = [];

const colorThemes = [
  'blue', 'green', 'purple', 'red', 'orange', 'gray', 'yellow', 'pink',
  'cyan', 'lime', 'teal', 'indigo', 'brown', 'amber', 'deeporange'
];

// Initialize header interactions and theme selector
function initHeaderScripts() {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const colorSelector = document.getElementById('colorSelector');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    document.addEventListener('click', e => {
      if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }

  // Load saved theme and apply
  const savedTheme = localStorage.getItem('colorTheme') || 'blue';
  applyColorTheme(savedTheme);
  if (colorSelector) {
    colorSelector.value = savedTheme;
    colorSelector.addEventListener('change', e => {
      applyColorTheme(e.target.value);
    });
  }
}

function applyColorTheme(theme) {
  const body = document.body;
  colorThemes.forEach(t => body.classList.remove(`theme-${t}`));
  if (colorThemes.includes(theme)) {
    body.classList.add(`theme-${theme}`);
    localStorage.setItem('colorTheme', theme);
  }
}

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
  highlightActiveCategoryButtons(category);
}

function highlightActiveCategoryButtons(category) {
  document.querySelectorAll('#articleList button').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === category);
  });
}

function renderArticlesPage(data, page) {
  const container = document.getElementById('articles');
  container.innerHTML = '';
  const start = (page - 1) * articlesPerPage;
  const pageItems = data.slice(start, start + articlesPerPage);

  pageItems.forEach(article => {
    const card = document.createElement('article');
    card.setAttribute('data-categories', article.categories.join(','));
    card.innerHTML = `
      <h2>${article.title}</h2>
      ${article.image ? `<img src="${article.image}" alt="${article.title}" />` : ''}
      <p>${article.summary}</p>
      <div class="card-buttons">
        <button data-id="${article.id}" class="readMore">Read more →</button>
        <button data-id="${article.id}" class="shareLink">🔗 Share</button>
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
    btn.onclick = e => {
      const btn = e.target;
      const link = `${window.location.origin}${window.location.pathname}#${btn.dataset.id}`;
      navigator.clipboard.writeText(link).then(() => {
        btn.textContent = "✅ Copied!";
        setTimeout(() => btn.textContent = "🔗 Share", 1500);
      }).catch(() => {
        alert('Copy failed. Link:\n' + link);
      });
    };
  });
}

function renderPagination(totalItems) {
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
        renderPaginationButtons(totalItems);
      }
    };

    document.getElementById('nextPage').onclick = () => {
      if (currentPage * articlesPerPage < totalItems) {
        currentPage++;
        renderArticlesPage(filteredArticles, currentPage);
        renderPaginationButtons(totalItems);
      }
    };
  }
  renderPaginationButtons(totalItems);
}

function renderPaginationButtons(totalItems) {
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage * articlesPerPage >= totalItems;
}

function loadArticles() {
  fetch('articles.json')
    .then(res => res.json())
    .then(data => {
      allArticles = data;
      filteredArticles = allArticles.slice();

      // Categories + 'All'
      const allCategoriesSet = new Set();
      allArticles.forEach(a => a.categories.forEach(c => allCategoriesSet.add(c)));
      const categories = ['All', ...Array.from(allCategoriesSet).sort()];

      renderCategories(categories);
      filterArticlesByCategory('All');

      setupSearch();
      setupCategoryFilters(categories);
    })
    .catch(err => console.error('Error loading articles:', err));
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
    highlightActiveCategoryButtons('All');
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
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load article: ${id}.md`);
      return res.text();
    })
    .then(markdown => {
      document.getElementById('articles').style.display = 'none';
      document.getElementById('searchBox').style.display = 'none';
      document.getElementById('categoryFilters').style.display = 'none';

      const viewer = document.getElementById('articleContent') || createArticleViewer();
      viewer.innerHTML = marked.parse(markdown);

      const share = document.createElement('button');
      share.textContent = '🔗 Share';
      share.style.marginTop = '1rem';
      share.onclick = () => {
        const link = `${window.location.origin}${window.location.pathname}#${id}`;
        navigator.clipboard.writeText(link).then(() => {
          share.textContent = '✅ Copied!';
          setTimeout(() => (share.textContent = '🔗 Share'), 1500);
        }).catch(() => alert('Copy failed. Link:\n' + link));
      };
      viewer.appendChild(share);

      viewer.style.display = 'block';
      document.getElementById('backButton').style.display = 'inline-block';
      document.getElementById('navLinks').classList.remove('open');
    })
    .catch(err => {
      alert(err.message);
      console.error(err);
    });
}

function createArticleViewer() {
  const viewer = document.createElement('div');
  viewer.id = 'articleContent';
  viewer.className = 'article-viewer';
  document.querySelector('main').appendChild(viewer);
  return viewer;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('backButton').addEventListener('click', () => {
    document.getElementById('articles').style.display = 'block';
    document.getElementById('searchBox').style.display = 'block';
    document.getElementById('categoryFilters').style.display = 'flex';
    const viewer = document.getElementById('articleContent');
    if (viewer) viewer.style.display = 'none';
    document.getElementById('backButton').style.display = 'none';
    window.location.hash = '';
  });

  // Load article from URL hash on page load
  const hash = window.location.hash.slice(1);
  if (hash) setTimeout(() => loadMarkdown(hash), 300);
});

fetch('header.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('header-placeholder').innerHTML = html;
    initHeaderScripts();
    loadArticles();
  })
  .catch(err => console.error('Error loading header:', err));

fetch('footer.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('footer-placeholder').innerHTML = html;
  })
  .catch(err => console.error('Error loading footer:', err));