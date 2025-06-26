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
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    if (modeToggle) modeToggle.textContent = '🌞';
    const logo = document.getElementById('siteLogo');
    if (logo) logo.src = 'images/logolight.jpeg';
  }

  if (modeToggle) {
    modeToggle.onclick = () => {
      const isLight = document.body.classList.toggle('light-mode');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      modeToggle.textContent = isLight ? '🌞' : '🌙';
      
        // Swap logo
        const logo = document.getElementById('siteLogo');
        if (logo) {
          logo.src = isLight ? 'images/logolight.jpeg' : 'images/logodark.jpeg';
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

// Load and display list of articles
function loadArticles() {
  fetch('articles.json')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('articles');
      const menuList = document.getElementById('articleList');
      const categoryFilter = document.getElementById('categoryFilter');

      container.innerHTML = '';
      menuList.innerHTML = '';

      const categories = new Set();

      data.forEach(article => {
        // Save category
        if (article.category) categories.add(article.category);

        // Create article card
        const card = document.createElement('article');
        card.setAttribute('data-category', article.category || 'Uncategorized');
        card.innerHTML = `
          <h2>${article.title}</h2>
          ${article.image ? `<img src="${article.image}" alt="${article.title}" />` : ""}
          <p>${article.summary}</p>
          <button data-id="${article.id}" class="readMore">Read more →</button>
        `;
        container.appendChild(card);

        // Menu link
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = article.title;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          loadMarkdown(article.id);
        });
        menuList.appendChild(link);
      });

      // Populate category dropdown
      if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        Array.from(categories).sort().forEach(cat => {
          categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
        });

        categoryFilter.addEventListener('change', () => {
          const selected = categoryFilter.value;
          document.querySelectorAll('#articles article').forEach(article => {
            const matches = selected === 'all' || article.dataset.category === selected;
            article.style.display = matches ? 'block' : 'none';
          });
        });
      }

      // Read more buttons
      document.querySelectorAll('.readMore').forEach(btn => {
        btn.addEventListener('click', () => loadMarkdown(btn.dataset.id));
      });
    });
}

      document.querySelectorAll('.readMore').forEach(btn => {
        btn.addEventListener('click', () => loadMarkdown(btn.dataset.id));
      });
    });
}

// Load a markdown file and display it
function loadMarkdown(id) {
  fetch(`articles/${id}.md`)
    .then(res => res.text())
    .then(markdown => {
      document.getElementById('articles').style.display = 'none';
      document.getElementById('searchBox').style.display = 'none';
      document.getElementById('articleContent').innerHTML = marked.parse(markdown);
      document.getElementById('articleContent').style.display = 'block';
      document.getElementById('backButton').style.display = 'inline-block';
      document.getElementById('navLinks').classList.remove('open');
    });
}

// Return to list view
document.getElementById('backButton').addEventListener('click', () => {
  document.getElementById('articles').style.display = 'block';
  document.getElementById('searchBox').style.display = 'block';
  document.getElementById('articleContent').style.display = 'none';
  document.getElementById('backButton').style.display = 'none';
});

// Filter articles by search
document.addEventListener('input', e => {
  if (e.target.id === 'searchBox') {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('#articles article').forEach(article => {
      const text = article.innerText.toLowerCase();
      article.style.display = text.includes(term) ? 'block' : 'none';
    });
  }
});
