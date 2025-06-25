window.onload = () => {
  fetch('header.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('header-placeholder').innerHTML = data;
      initHeaderScripts();
      loadArticleLinks();
    });

  fetch('footer.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    });

  const articlesEl = document.getElementById('articles');
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
      card.innerHTML = `
        <img src="${article.image}" alt="${article.title}" />
        <h3>${article.title}</h3>
        <p>${article.summary}</p>
      `;
      card.onclick = () => showArticle(article);
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
    fetch(`data/${article.id}.md`)
      .then(res => res.text())
      .then(md => {
        articleBody.innerHTML = marked.parse(md);
        articleView.style.display = 'block';
        articlesEl.style.display = 'none';
        paginationEl.style.display = 'none';
        searchInput.style.display = 'none';
      });
  }

  backToListBtn.onclick = () => {
    articleView.style.display = 'none';
    articlesEl.style.display = 'grid';
    paginationEl.style.display = 'flex';
    searchInput.style.display = 'block';
  };

  searchInput.oninput = () => {
    const term = searchInput.value.toLowerCase();
    filteredArticles = articles.filter(article =>
      article.title.toLowerCase().includes(term) ||
      article.summary.toLowerCase().includes(term)
    );
    currentPage = 1;
    renderArticlesList();
  };

  fetch('data/articles.json')
    .then(res => res.json())
    .then(data => {
      articles = data;
      filteredArticles = [...articles];
      renderArticlesList();
    });

  function initHeaderScripts() {
    const modeToggle = document.getElementById('modeToggle');
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (localStorage.getItem('theme') === 'light') {
      document.body.classList.add('light-mode');
      if (modeToggle) modeToggle.textContent = '🌞';
    }

    if (modeToggle) {
      modeToggle.onclick = () => {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        modeToggle.textContent = isLight ? '🌞' : '🌙';
      };
    }

    if (menuToggle && navLinks) {
      menuToggle.onclick = () => {
        navLinks.classList.toggle('open');
      };
    }
  }

  function loadArticleLinks() {
    fetch('data/articles.json')
      .then(res => res.json())
      .then(articles => {
        const container = document.getElementById('articleMenu');
        if (!container) return;
        articles.forEach(article => {
          const link = document.createElement('a');
          link.href = '#';
          link.textContent = article.title;
          link.onclick = e => {
            e.preventDefault();
            showArticle(article);
            document.getElementById('navLinks')?.classList.remove('open');
          };
          container.appendChild(link);
        });
      });
  }
};
