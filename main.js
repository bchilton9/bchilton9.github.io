// Initialize header behavior
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

  const modeToggle = document.getElementById('modeToggle');
  const siteLogo = document.getElementById('siteLogo');

  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    if (modeToggle) modeToggle.textContent = '🌞';
    if (siteLogo) siteLogo.src = 'images/logo-light.png';
  }

  if (modeToggle) {
    modeToggle.onclick = () => {
      const isLight = document.body.classList.toggle('light-mode');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      modeToggle.textContent = isLight ? '🌞' : '🌙';
      if (siteLogo) {
        siteLogo.src = isLight ? 'images/logo-light.png' : 'images/logo-dark.png';
      }
    };
  }
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

// Load and display articles
function loadArticles() {
  fetch('articles.json')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('articles');
      const menuList = document.getElementById('articleList');
      const filterContainer = document.getElementById('categoryFilters');

      container.innerHTML = '';
      menuList.innerHTML = '';
      filterContainer.innerHTML = '';

      const allCategories = new Set();

      data.forEach(article => {
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

        // Add link to hamburger menu
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = article.title;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          loadMarkdown(article.id);
        });
        menuList.appendChild(link);

        article.categories.forEach(cat => allCategories.add(cat));
      });

      // Category filters
      const sortedCats = Array.from(allCategories).sort();
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

        document.querySelectorAll('#articles article').forEach(article => {
          const cats = article.dataset.categories.split(',');
          const visible = selected === 'all' || cats.includes(selected);
          article.style.display = visible ? 'block' : 'none';
        });
      });

      // Read more buttons
      document.querySelectorAll('.readMore').forEach(btn => {
        btn.addEventListener('click', () => loadMarkdown(btn.dataset.id));
      });

      // Share buttons
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

      // Load article from hash if present
      const hash = window.location.hash.slice(1);
      if (hash) {
        setTimeout(() => loadMarkdown(hash), 300);
      }
    });
}

// Load markdown article into page
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
      const nav = document.getElementById('navLinks');
      if (nav) nav.classList.remove('open');
    });
}

// Safe back button hookup
window.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backButton');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      document.getElementById('articles').style.display = 'block';
      document.getElementById('searchBox').style.display = 'block';
      document.getElementById('categoryFilters').style.display = 'flex';
      document.getElementById('articleContent').style.display = 'none';
      backBtn.style.display = 'none';
      window.location.hash = '';
    });
  }

  // Search
  const searchBox = document.getElementById('searchBox');
  if (searchBox) {
    searchBox.addEventListener('input', () => {
      const term = searchBox.value.toLowerCase();
      document.querySelectorAll('#articles article').forEach(article => {
        const text = article.innerText.toLowerCase();
        article.style.display = text.includes(term) ? 'block' : 'none';
      });
    });
  }
});