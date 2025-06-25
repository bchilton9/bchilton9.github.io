window.onload = () => {
  // Load header and footer
  fetch('header.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('header-placeholder').innerHTML = data;
      initHeaderScripts();
      loadArticlesListIntoDropdown();
    });
  fetch('footer.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    });

  // Elements
  const articlesEl = document.getElementById('articles');
  const articleDropdown = document.getElementById('articleDropdown');
  const searchInput = document.getElementById('searchInput');
  const paginationEl = document.getElementById('pagination');
  const articleView = document.getElementById('articleView');
  const backToListBtn = document.getElementById('backToList');
  const articleTitle = document.getElementById('articleTitle');
  const articleImage = document.getElementById('articleImage');
  const articleBody = document.getElementById('articleBody');

  let articles = [];
  let filteredArticles = [];
  let currentPage = 1;
  const articlesPerPage = 4;

  function renderArticlesList() {
    articlesEl.innerHTML = '';
    const start = (currentPage - 1) * articlesPerPage;
    const end = start + articlesPerPage;
    const pageArticles = filteredArticles.slice(start, end);

    pageArticles.forEach(article => {
      const card = document.createElement('div');
      card.className = 'article-card';
      card.tabIndex = 0;
      card.innerHTML = `
        <img src="${article.image}" alt="${article.title}" />
        <h3>${article.title}</h3>
        <p>${article.summary}</p>
      `;
      card.onclick = () => showArticle(article);
      card.onkeypress = e => { if (e.key === 'Enter') showArticle(article); };
      articlesEl.appendChild(card);
    });

    renderPagination();
  }

  function renderPagination() {
    paginationEl.innerHTML = '';
    const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = 'page-btn';
      if (i === currentPage) btn.classList.add('active');
      btn.onclick = () => {
        currentPage = i;
        renderArticlesList();
      };
      paginationEl.appendChild(btn);
    }
  }

  function showArticle(article) {
    articleTitle.textContent = article.title;
    articleImage.src = article.image;
    articleImage.alt = article.title;
    articleBody.innerHTML = '';
    fetch(`data/${article.id}.md`)
      .then(res => res.text())
      .then(md => {
        articleBody.innerHTML = marked.parse(md);
      });
    articleView.style.display = 'block';
    articlesEl.style.display = 'grid';
    paginationEl.style.display = 'flex';
    searchInput.style.display = 'block';

    // Hide main list and controls when viewing article
    articlesEl.style.display = 'none';
    paginationEl.style.display = 'none';
    searchInput.style.display = 'none';

    // Hide dropdown on article view (optional)
    if(articleDropdown) articleDropdown.style.display = 'none';
  }

  backToListBtn.onclick = () => {
    articleView.style.display = 'none';
    articlesEl.style.display = 'grid';
    paginationEl.style.display = 'flex';
    searchInput.style.display = 'block';
    if(articleDropdown) articleDropdown.style.display = 'inline-block';
  };

  function updateDropdown() {
    articleDropdown.innerHTML = '';
    filteredArticles.forEach(article => {
      const option = document.createElement('option');
      option.value = article.id;
      option.textContent = article.title;
      articleDropdown.appendChild(option);
    });
  }

  articleDropdown.onchange = () => {
    const id = articleDropdown.value;
    const selected = articles.find(a => a.id === id);
    if (selected) showArticle(selected);
  };

  searchInput.oninput = () => {
    const term = searchInput.value.toLowerCase();
    filteredArticles = articles.filter(article =>
      article.title.toLowerCase().includes(term) ||
      article.summary.toLowerCase().includes(term));
    currentPage = 1;
    updateDropdown();
    renderArticlesList();
  };

  // Fetch articles list
  fetch('data/articles.json')
    .then(res => res.json())
    .then(data => {
      articles = data;
      filteredArticles = articles;
      updateDropdown();
      renderArticlesList();
    });

  // Header scripts (hamburger and theme toggle)
  function initHeaderScripts() {
    const modeToggle = document.getElementById('modeToggle');
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      if (modeToggle) modeToggle.textContent = '🌞';
    }

    if (modeToggle) {
      modeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        modeToggle.textContent = isLight ? '🌞' : '🌙';
      });
    }

    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
      });
    }
  }

  // Also call this after header loads to fill dropdown in nav
  function loadArticlesListIntoDropdown() {
    if(!articleDropdown) return;
    fetch('data/articles.json')
      .then(res => res.json())
      .then(list => {
        articleDropdown.innerHTML = '';
        list.forEach(a => {
          const o = document.createElement('option');
          o.value = a.id;
          o.textContent = a.title;
          articleDropdown.appendChild(o);
        });
      });
  }
};
