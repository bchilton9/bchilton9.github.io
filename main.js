let currentPage = 1;
const articlesPerPage = 4;
let allArticles = [];
let filteredArticles = [];

const colorThemes = [
  'blue', 'green', 'purple', 'red', 'orange', 'gray',
  'yellow', 'pink', 'cyan', 'lime', 'teal',
  'indigo', 'brown', 'amber', 'deeporange'
];

function initHeaderScripts() {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const colorSelector = document.getElementById('colorSelector');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    document.addEventListener('click', e => {
      if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }

  if (colorSelector) {
    colorSelector.addEventListener('change', e => {
      setColorTheme(e.target.value);
    });
    loadColorTheme();
  }
}

function setColorTheme(theme) {
  colorThemes.forEach(t => document.body.classList.remove(`theme-${t}`));
  if (colorThemes.includes(theme)) {
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('colorTheme', theme);
  }
}

function loadColorTheme() {
  const saved = localStorage.getItem('colorTheme') || 'blue';
  setColorTheme(saved);
  const sel = document.getElementById('colorSelector');
  if (sel) sel.value = saved;
}

fetch('header.html')
  .then(r => r.text())
  .then(html => {
    document.getElementById('header-placeholder').innerHTML = html;
    initHeaderScripts();
    loadArticles();
  });

fetch('footer.html')
  .then(r => r.text())
  .then(html => {
    document.getElementById('footer-placeholder').innerHTML = html;
  });

function renderCategories(categories) {
  const menu = document.getElementById('articleList');
  menu.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'nav-cat-btn';
    btn.textContent = cat;
    btn.onclick = () => {
      currentPage = 1;
      filterArticlesByCategory(cat);
      document.getElementById('navLinks').classList.remove('open');
    };
    menu.appendChild(btn);
  });
}

function filterArticlesByCategory(category) {
  filteredArticles = category === 'All'
    ? allArticles.slice()
    : allArticles.filter(a => a.categories.includes(category));
  renderArticlesPage(filteredArticles, currentPage);
}

function renderArticlesPage(articles, page) {
  const container = document.getElementById('articles');
  container.innerHTML = '';
  const start = (page - 1) * articlesPerPage;
  const pageItems = articles.slice(start, start + articlesPerPage);

  pageItems.forEach(a => {
    const card = document.createElement('article');
    card.innerHTML = `
      <h2>${a.title}</h2>
      ${a.image ? `<img src="${a.image}" alt="${a.title}" onclick="openImage(this)" />` : ''}
      <p>${a.summary}</p>
      <div class="card-buttons">
        <button class="readMore" data-id="${a.id}">Read more →</button>
        <button class="shareLink" data-id="${a.id}">🔗 Share</button>
      </div>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll('.readMore').forEach(btn =>
    btn.onclick = () => loadMarkdown(btn.dataset.id)
  );
  document.querySelectorAll('.shareLink').forEach(btn =>
    btn.onclick = () => {
      const url = `${location.origin}${location.pathname}#${btn.dataset.id}`;
      navigator.clipboard.writeText(url).then(() => {
        btn.textContent = '✅ Copied!';
        setTimeout(() => btn.textContent = '🔗 Share', 1500);
      });
    }
  );
}

function loadArticles() {
  fetch('articles.json')
    .then(res => res.json())
    .then(data => {
      allArticles = data;
      const cats = new Set();
      data.forEach(a => a.categories.forEach(c => cats.add(c)));
      renderCategories(['All', ...Array.from(cats)]);
      filterArticlesByCategory('All');
    })
    .catch(e => {
      document.getElementById('articles').innerHTML = '<p style="color:red;">Failed to load articles.</p>';
      console.error(e);
    });
}

function loadMarkdown(id) {
  fetch(`articles/${id}.md`)
    .then(res => {
      if (!res.ok) throw new Error('Load failed');
      return res.text();
    })
    .then(md => {
      document.getElementById('articles').style.display = 'none';
      document.getElementById('searchBox').style.display = 'none';
      document.getElementById('categoryFilters').style.display = 'none';

      const vw = document.getElementById('articleContent');
      vw.innerHTML = marked.parse(md);
      vw.querySelectorAll('img').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.onclick = () => openImage(img);
      });
      vw.style.display = 'block';
      document.getElementById('backButton').style.display = 'inline-block';
    })
    .catch(() => alert('Failed to load article content.'));
}

function openImage(img) {
  const overlay = document.createElement('div');
  overlay.className = 'image-overlay';
  overlay.innerHTML = `<img src="${img.src}" /><button>✕</button>`;
  overlay.querySelector('button').onclick = () => overlay.remove();
  document.body.appendChild(overlay);
}

document.getElementById('backButton').onclick = () => {
  document.getElementById('articles').style.display = 'block';
  document.getElementById('searchBox').style.display = 'block';
  document.getElementById('categoryFilters').style.display = 'flex';
  document.getElementById('articleContent').style.display = 'none';
  document.getElementById('backButton').style.display = 'none';
  window.location.hash = '';
};

window.addEventListener('load', () => {
  const hash = location.hash.slice(1);
  if (hash) loadMarkdown(hash);
});