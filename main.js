let allArticles = [];
let currentPage = 1;
const articlesPerPage = 5;

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
}

function initThemeSelector() {
  const saved = localStorage.getItem('themeColor') || 'blue';
  document.body.classList.add(`theme-${saved}`);
  const selector = document.getElementById('themeSelector');
  if (selector) selector.value = saved;

  if (selector) {
    selector.addEventListener('change', () => {
      document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
      const theme = selector.value;
      document.body.classList.add(`theme-${theme}`);
      localStorage.setItem('themeColor', theme);
    });
  }
}

// Load header and footer
fetch('header.html').then(res => res.text()).then(html => {
  document.getElementById('header-placeholder').innerHTML = html;
  initHeaderScripts();
  initThemeSelector();
  loadArticles();
});

fetch('footer.html').then(res => res.text()).then(html => {
  document.getElementById('footer-placeholder').innerHTML = html;
});

// Load and display articles
function loadArticles() {
  fetch('articles.json')
    .then(res => res.json())
    .then(data => {
      allArticles = data;
      const menuList = document.getElementById('articleList');
      const filterContainer = document.getElementById('categoryFilters');

      const allCategories = new Set();
      data.forEach(article => article.categories.forEach(cat => allCategories.add(cat)));
      const sortedCats = Array.from(allCategories).sort();

      // Render side menu as buttons for iOS compatibility
      menuList.innerHTML = '';
      sortedCats.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'nav-cat-btn';
        btn.textContent = cat;
        btn.addEventListener('click', () => {
          filterByCategory(cat);
          history.replaceState(null, '', `?cat=${encodeURIComponent(cat)}`);
          document.getElementById('navLinks').classList.remove('open');
        });
        btn.addEventListener('touchstart', (e) => {
          e.preventDefault();
          filterByCategory(cat);
        });
        menuList.appendChild(btn);
      });

      // Filter buttons
      filterContainer.innerHTML = `<button class="active" data-cat="all">All</button>`;
      sortedCats.forEach(cat => {
        const btn = document.createElement('button');
        btn.textContent = cat;
        btn.dataset.cat = cat;
        filterContainer.appendChild(btn);
      });

      filterContainer.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') return;
        const selected = e.target.dataset.cat;
        document.querySelectorAll('.category-filters button').forEach(btn =>
          btn.classList.remove('active')
        );
        e.target.classList.add('active');
        filterByCategory(selected);
      });

      // Load category from URL
      const urlParams = new URLSearchParams(window.location.search);
      const initialCat = urlParams.get('cat') || 'all';
      filterByCategory(initialCat);

      // Load hash-based article if present
      const hash = window.location.hash.slice(1);
      if (hash) {
        setTimeout(() => loadMarkdown(hash), 300);
      }
    });
}

function renderArticles(articles) {
  const container = document.getElementById('articles');
  container.innerHTML = '';

  const start = (currentPage - 1) * articlesPerPage;
  const end = start + articlesPerPage;
  const pageArticles = articles.slice(start, end);

  pageArticles.forEach(article => {
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

  renderPagination(articles.length);

  document.querySelectorAll('.readMore').forEach(btn => {
    btn.addEventListener('click', () => loadMarkdown(btn.dataset.id));
  });

  document.querySelectorAll('.shareLink').forEach(btn => {
    btn.addEventListener('click', () => {
      const link = `${window.location.origin}${window.location.pathname}#${btn.dataset.id}`;
      navigator.clipboard.writeText(link).then(() => {
        btn.textContent = "✅ Copied!";
        setTimeout(() => {
          btn.textContent = "🔗 Share";
        }, 1500);
      });
    });
  });
}

function renderPagination(totalCount) {
  const container = document.getElementById('articles');
  const totalPages = Math.ceil(totalCount / articlesPerPage);

  const nav = document.createElement('div');
  nav.className = 'pagination';

  const prev = document.createElement('button');
  prev.textContent = '← Previous';
  prev.disabled = currentPage === 1;
  prev.onclick = () => {
    currentPage--;
    setTimeout(updateView, 0); // ensures iOS applies changes
  };

  const next = document.createElement('button');
  next.textContent = 'Next →';
  next.disabled = currentPage === totalPages;
  next.onclick = () => {
    currentPage++;
    setTimeout(updateView, 0);
  };

  nav.appendChild(prev);
  nav.appendChild(next);
  container.appendChild(nav);
}

function updateView() {
  const selected = document.querySelector('.category-filters button.active')?.dataset.cat || 'all';
  filterByCategory(selected);
}

function filterByCategory(cat) {
  currentPage = 1;
  let filtered = allArticles;

  if (cat !== 'all') {
    filtered = allArticles.filter(article => article.categories.includes(cat));
  }

  renderArticles(filtered);
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

      const share = document.createElement('button');
      share.textContent = '🔗 Share';
      share.onclick = () => {
        const link = `${window.location.origin}${window.location.pathname}#${id}`;
        navigator.clipboard.writeText(link).then(() => {
          share.textContent = '✅ Copied!';
          setTimeout(() => (share.textContent = '🔗 Share'), 1500);
        });
      };
      share.style.marginTop = '1rem';
      viewer.appendChild(share);

      viewer.style.display = 'block';
      document.getElementById('backButton').style.display = 'inline-block';
      document.getElementById('navLinks').classList.remove('open');
    });
}

document.getElementById('backButton').addEventListener('click', () => {
  document.getElementById('articles').style.display = 'block';
  document.getElementById('searchBox').style.display = 'block';
  document.getElementById('categoryFilters').style.display = 'flex';
  document.getElementById('articleContent').style.display = 'none';
  document.getElementById('backButton').style.display = 'none';
  window.location.hash = '';
  updateView();
});

document.addEventListener('input', e => {
  if (e.target.id === 'searchBox') {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('#articles article').forEach(article => {
      const text = article.innerText.toLowerCase();
      article.style.display = text.includes(term) ? 'block' : 'none';
    });
  }
});