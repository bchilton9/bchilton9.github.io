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
  initColorSelector();
  loadColorTheme();
}

function initColorSelector() {
  const select = document.getElementById('colorSelector');
  if (!select) return;

  select.onchange = () => {
    setColorTheme(select.value);
  };
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

fetch('header.html')
  .then(res => {
    if (!res.ok) throw new Error('Failed to load header.html');
    return res.text();
  })
  .then(html => {
    document.getElementById('header-placeholder').innerHTML = html;
    initHeaderScripts();
    loadArticles();
  })
  .catch(err => console.error(err));

fetch('footer.html')
  .then(res => {
    if (!res.ok) throw new Error('Failed to load footer.html');
    return res.text();
  })
  .then(html => {
    document.getElementById('footer-placeholder').innerHTML = html;
  })
  .catch(err => console.error(err));

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
      if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
          btn.textContent = "✅ Copied!";
          setTimeout(() => btn.textContent = "🔗 Share", 1500);
        }).catch(() => alert('Failed to copy. Please copy manually:\n' + link));
      } else {
        alert('Clipboard not supported. Copy manually:\n' + link);
      }
    };
  });
}

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
    .then(res => {
      if (!res.ok) throw new Error('Failed to load articles.json');
      return res.json();
    })
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
    })
    .catch(err => console.error(err));
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
    .then(res => {
      if (!res.ok) throw new Error('Failed to load markdown article');
      return res.text();
    })
    .then(markdown => {
      document.getElementById('articles').style.display = 'none';
      document.getElementById('searchBox').style.display = 'none';
      document.getElementById('categoryFilters').style.display = 'none';

      let viewer = document.getElementById('articleContent');
      if (!viewer) {
        viewer = document.createElement('div');
        viewer.id = 'articleContent';
        viewer.className = 'article-viewer';
        document.querySelector('main').appendChild(viewer);
      }
      viewer.innerHTML = marked.parse(markdown);

      // Share button below article
      const share = document.createElement('button');
      share.textContent = '🔗 Share';
      share.onclick = () => {
        const link = `${window.location.origin}${window.location.pathname}#${id}`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(link).then(() => {
            share.textContent = '✅ Copied!';
            setTimeout(() => (share.textContent = '🔗 Share'), 1500);
          }).catch(() => alert('Failed to copy. Please copy manually:\n' + link));
        } else {
          alert('Clipboard not supported. Copy manually:\n' + link);
        }
      };
      share.style.marginTop = '1rem';
      viewer.appendChild(share);

      viewer.style.display = 'block';
      document.getElementById('backButton').style.display = 'inline-block';
      document.getElementById('navLinks').classList.remove('open');
    })
    .catch(err => {
      alert("Failed to load article content.");
      console.error(err);
    });
}

// Back button returns to main list
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

  // Load article from hash on load
  const hash = window.location.hash.slice(1);
  if (hash) {
    setTimeout(() => loadMarkdown(hash), 300);
  }
});