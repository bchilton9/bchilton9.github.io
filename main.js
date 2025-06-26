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
}

// Theme selector
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

        // Collect categories for filtering and menu
        article.categories.forEach(cat => allCategories.add(cat));
      });

      // Populate menu with categories
      const sortedCats = Array.from(allCategories).sort();
      sortedCats.forEach(cat => {
        const link = document.createElement('a');
        link.href = `?cat=${encodeURIComponent(cat)}`;
        link.textContent = cat;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          filterByCategory(cat);
          history.replaceState(null, '', `?cat=${encodeURIComponent(cat)}`);
        });
        menuList.appendChild(link);
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

      // Read more
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

      // Check URL for category
      const urlParams = new URLSearchParams(window.location.search);
      const initialCat = urlParams.get('cat');
      if (initialCat) {
        filterByCategory(initialCat);
        const activeBtn = [...document.querySelectorAll('.category-filters button')].find(btn =>
          btn.dataset.cat === initialCat
        );
        if (activeBtn) {
          document.querySelectorAll('.category-filters button').forEach(btn => btn.classList.remove('active'));
          activeBtn.classList.add('active');
        }
      }
    });
}

// Filter articles by category
function filterByCategory(selected) {
  document.querySelectorAll('#articles article').forEach(article => {
    const cats = article.dataset.categories.split(',');
    const visible = selected === 'all' || cats.includes(selected);
    article.style.display = visible ? 'block' : 'none';
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

      // Add share button below article
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

// Back button returns to main article list
document.getElementById('backButton').addEventListener('click', () => {
  document.getElementById('articles').style.display = 'block';
  document.getElementById('searchBox').style.display = 'block';
  document.getElementById('categoryFilters').style.display = 'flex';
  document.getElementById('articleContent').style.display = 'none';
  document.getElementById('backButton').style.display = 'none';
  window.location.hash = '';
});

// Search filter
document.addEventListener('input', e => {
  if (e.target.id === 'searchBox') {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('#articles article').forEach(article => {
      const text = article.innerText.toLowerCase();
      article.style.display = text.includes(term) ? 'block' : 'none';
    });
  }
});

// Load article by URL hash (if present)
window.addEventListener('load', () => {
  const hash = window.location.hash.slice(1);
  if (hash) {
    setTimeout(() => loadMarkdown(hash), 300);
  }
});