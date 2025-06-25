let allArticles = [];
let currentPage = 1;
const articlesPerPage = 3;

const articlesDiv = document.getElementById('articles');
const articleView = document.getElementById('article-view');
const backButton = document.getElementById('back-button');
const title = document.getElementById('article-title');
const body = document.getElementById('article-body');
const image = document.getElementById('article-image');
const searchInput = document.getElementById('searchInput');
const dropdown = document.getElementById('articleDropdown');
const paginationDiv = document.getElementById('pagination');

// Load and render articles
fetch('data/articles.json')
  .then(res => res.json())
  .then(data => {
    allArticles = data;
    populateDropdown(data);
    renderArticles();
  });

function populateDropdown(articles) {
  dropdown.innerHTML = '<option disabled selected>All Articles</option>';
  articles.forEach(article => {
    const opt = document.createElement('option');
    opt.value = article.id;
    opt.textContent = article.title;
    dropdown.appendChild(opt);
  });

  dropdown.addEventListener('change', () => {
    const selected = allArticles.find(a => a.id === dropdown.value);
    if (selected) showArticle(selected);
  });
}

function renderArticles() {
  const filtered = filterArticles();
  const start = (currentPage - 1) * articlesPerPage;
  const end = start + articlesPerPage;
  const pageArticles = filtered.slice(start, end);

  articlesDiv.innerHTML = '';
  pageArticles.forEach(article => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${article.image}" alt="${article.title}">
      <h2>${article.title}</h2>
      <p>${article.summary}</p>
    `;
    card.addEventListener('click', () => showArticle(article));
    articlesDiv.appendChild(card);
  });

  renderPagination(filtered.length);
}

function renderPagination(total) {
  const totalPages = Math.ceil(total / articlesPerPage);
  paginationDiv.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentPage = i;
      renderArticles();
      window.scrollTo(0, 0);
    });
    paginationDiv.appendChild(btn);
  }
}

function filterArticles() {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) return allArticles;
  return allArticles.filter(a =>
    a.title.toLowerCase().includes(term) ||
    a.summary.toLowerCase().includes(term) ||
    a.content.toLowerCase().includes(term)
  );
}

function showArticle(article) {
  articlesDiv.style.display = 'none';
  paginationDiv.style.display = 'none';
  articleView.style.display = 'block';
  searchInput.style.display = 'none';

  title.textContent = article.title;
  body.innerHTML = marked.parse(article.content);
  image.src = article.image;
  image.alt = article.title;
}

backButton.addEventListener('click', () => {
  articleView.style.display = 'none';
  articlesDiv.style.display = 'block';
  paginationDiv.style.display = 'flex';
  searchInput.style.display = 'block';
  window.scrollTo(0, 0);
});

// Search
searchInput.addEventListener('input', () => {
  currentPage = 1;
  renderArticles();
});
