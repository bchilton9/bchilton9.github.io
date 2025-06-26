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

  createColorSelector();
  loadColorTheme();
}

function createColorSelector() {
  if (document.getElementById('colorSelectorContainer')?.dataset.initialized) return;
  const selector = document.getElementById('colorSelector');
  if (!selector) return;

  selector.dataset.initialized = true;
  selector.addEventListener('change', () => setColorTheme(selector.value));
}

function setColorTheme(theme) {
  colorThemes.forEach(t => document.body.classList.remove(`theme-${t}`));
  if (theme && colorThemes.includes(theme)) {
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('colorTheme', theme);
  }
}

function loadColorTheme() {
  const saved = localStorage.getItem('colorTheme') || 'blue';
  document.body.classList.add(`theme-${saved}`);
  const selector = document.getElementById('colorSelector');
  if (selector) selector.value = saved;
}

// Load header/footer, then articles
fetch('header.html').then(res => res.text()).then(html => {
  document.getElementById('header-placeholder').innerHTML = html;
  initHeaderScripts();
  loadArticles();
});
fetch('footer.html').then(res => res.text()).then(html => {
  document.getElementById('footer-placeholder').innerHTML = html;
});

function loadArticles() {
  fetch('articles.json')
    .then(res => res.json())
    .then(data => {
      allArticles = data;
      filteredArticles = allArticles.slice();

      const categories = ['All', ...new Set(data.flatMap(a => a.categories))];
      renderCategories(categories);
      setupCategoryFilters(categories);
      renderArticlesPage(currentPage);
      renderPagination();
      setupSearch();
    });
}

function renderCategories(categories) {
  const menu = document.getElementById('articleList');
  if (!menu) return;
  menu.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'nav-cat-btn';
    btn.textContent = cat;
    btn.onclick = () => {
      filterArticlesByCategory(cat);
      currentPage = 1;
      renderArticlesPage(currentPage);
      renderPagination();
      document.getElementById('navLinks')?.classList.remove('open');
    };
    menu.appendChild(btn);
  });
}

function filterArticlesByCategory(cat) {
  if (cat === 'All') {
    filteredArticles = allArticles.slice();
  } else {
    filteredArticles = allArticles.filter(a => a.categories.includes(cat));
  }
}

function setupCategoryFilters(categories) {
  const container = document.getElementById('categoryFilters');
  container.innerHTML = '';
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
      renderArticlesPage(currentPage);
      renderPagination();
    };
    container.appendChild(btn);
  });
}

function renderArticlesPage(page) {
  const container = document.getElementById('articles');
  container.innerHTML = '';
  const start = (page - 1) * articlesPerPage;
  const list = filteredArticles.slice(start, start + articlesPerPage);

  list.forEach(article => {
    const card = document.createElement('article');
    card.innerHTML = `
      <h2>${article.title}</h2>
      ${article.image ? `<img src="${article.image}" alt="${article.title}" />` : ''}
      <p>${article.summary}</p>
      <div class="card-buttons">
        <button class="readMore" data-id="${article.id}">Read more →</button>
        <button class="shareLink" data-id="${article.id}">🔗 Share</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Show pagination unless in article view
  document.querySelector('.pagination')?.classList.remove('hide');

  attachArticleButtons();
}

function attachArticleButtons() {
  document.querySelectorAll('.readMore').forEach(btn => {
    btn.onclick = () => loadMarkdown(btn.dataset.id);
  });

  document.querySelectorAll('.shareLink').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const link = `${window.location.origin}${window.location.pathname}#${id}`;
      if (navigator.share) {
        navigator.share({ title: document.title, url: link }).catch(console.warn);
      } else {
        navigator.clipboard.writeText(link).then(() => {
          btn.textContent = '✅ Copied!';
          setTimeout(() => btn.textContent = '🔗 Share', 1500);
        });
      }
    };
  });
}

function renderPagination() {
  let pagination = document.querySelector('.pagination');
  if (!pagination) {
    pagination = document.createElement('div');
    pagination.className = 'pagination';
    pagination.innerHTML = `
      <button id="prevPage">← Previous</button>
      <button id="nextPage">Next →</button>
    `;
    document.getElementById('articles').after(pagination);
  }

  document.getElementById('prevPage').onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderArticlesPage(currentPage);
    }
  };
  document.getElementById('nextPage').onclick = () => {
    if (currentPage * articlesPerPage < filteredArticles.length) {
      currentPage++;
      renderArticlesPage(currentPage);
    }
  };

  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage * articlesPerPage >= filteredArticles.length;
}

function loadMarkdown(id) {
  fetch(`articles/${id}.md`)
    .then(res => res.text())
    .then(markdown => {
      document.getElementById('articles').style.display = 'none';
      document.getElementById('searchBox').style.display = 'none';
      document.getElementById('categoryFilters').style.display = 'none';
      document.querySelector('.pagination')?.classList.add('hide');

      const viewer = document.getElementById('articleContent');
      viewer.innerHTML = marked.parse(markdown);

      const share = document.createElement('button');
      share.textContent = '🔗 Share';
      share.onclick = () => {
        const link = `${window.location.origin}${window.location.pathname}#${id}`;
        if (navigator.share) {
          navigator.share({ title: document.title, url: link }).catch(console.warn);
        } else {
          navigator.clipboard.writeText(link).then(() => {
            share.textContent = '✅ Copied!';
            setTimeout(() => share.textContent = '🔗 Share', 1500);
          });
        }
      };
      viewer.appendChild(share);
      viewer.style.display = 'block';
      document.getElementById('backButton').style.display = 'inline-block';
    });
}

document.getElementById('backButton').addEventListener('click', () => {
  document.getElementById('articles').style.display = 'block';
  document.getElementById('searchBox').style.display = 'block';
  document.getElementById('categoryFilters').style.display = 'flex';
  document.getElementById('articleContent').style.display = 'none';
  document.getElementById('backButton').style.display = 'none';
  document.querySelector('.pagination')?.classList.remove('hide');
  window.location.hash = '';
});

function setupSearch() {
  document.getElementById('searchBox').addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    filteredArticles = allArticles.filter(article =>
      article.title.toLowerCase().includes(term) ||
      article.summary.toLowerCase().includes(term) ||
      article.categories.some(cat => cat.toLowerCase().includes(term))
    );
    currentPage = 1;
    renderArticlesPage(currentPage);
    renderPagination();
  });
}

window.addEventListener('load', () => {
  const hash = window.location.hash.slice(1);
  if (hash) setTimeout(() => loadMarkdown(hash), 300);
});