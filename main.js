// Elements
const headerPlaceholder = document.getElementById('header-placeholder');
const footerPlaceholder = document.getElementById('footer-placeholder');

const articlesDiv = document.getElementById('articles');
const paginationDiv = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const articleDropdown = document.getElementById('articleDropdown');

const articleView = document.getElementById('articleView');
const backToListBtn = document.getElementById('backToList');
const title = document.getElementById('articleTitle');
const image = document.getElementById('articleImage');
const body = document.getElementById('articleBody');

let allArticles = [];
let filteredArticles = [];
let currentPage = 1;
const articlesPerPage = 4;

// Load header and footer
async function loadLayout() {
  const headerResp = await fetch('header.html');
  headerPlaceholder.innerHTML = await headerResp.text();

  const footerResp = await fetch('footer.html');
  footerPlaceholder.innerHTML = await footerResp.text();
}

// Load articles.json and initialize
async function loadArticles() {
  const res = await fetch('data/articles.json');
  allArticles = await res.json();
  filteredArticles = allArticles;
  renderDropdown();
  renderPage(1);
}

// Render article cards
function renderPage(page) {
  currentPage = page;
  articlesDiv.innerHTML = '';
  paginationDiv.innerHTML = '';

  const start = (page - 1) * articlesPerPage;
  const end = start + articlesPerPage;
  const pageArticles = filteredArticles.slice(start, end);

  if (pageArticles.length === 0) {
    articlesDiv.innerHTML = '<p>No articles found.</p>';
    return;
  }

  pageArticles.forEach(article => {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
    card.innerHTML = `
      <img src="${article.image}" alt="${article.title}" />
      <h3>${article.title}</h3>
      <p>${article.summary}</p>
      <button class="read-more">Read More</button>
    `;
    card.querySelector('.read-more').addEventListener('click', () => showArticle(article));
    articlesDiv.appendChild(card);
  });

  // Pagination buttons
  const pageCount = Math.ceil(filteredArticles.length / articlesPerPage);
  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i === page ? ' active' : '');
    btn.textContent = i;
    btn.addEventListener('click', () => renderPage(i));
    paginationDiv.appendChild(btn);
  }
}

// Search filtering
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  filteredArticles = allArticles.filter(a =>
    a.title.toLowerCase().includes(query) ||
    a.summary.toLowerCase().includes(query)
  );
  renderPage(1);
  renderDropdown();
});

// Render dropdown for article quick select
function renderDropdown() {
  articleDropdown.innerHTML = '';
  filteredArticles.forEach(article => {
    const option = document.createElement('option');
    option.value = article.id;
    option.textContent = article.title;
    articleDropdown.appendChild(option);
  });
}

articleDropdown.addEventListener('change', () => {
  const selectedId = articleDropdown.value;
  const article = allArticles.find(a => a.id === selectedId);
  if (article) showArticle(article);
});

// Show full article view, loading markdown dynamically
async function showArticle(article) {
  try {
    const res = await fetch(`data/${article.id}.md`);
    if (!res.ok) throw new Error('Markdown file not found');
    const md = await res.text();

    articlesDiv.style.display = 'none';
    paginationDiv.style.display = 'none';
    articleView.style.display = 'block';
    searchInput.style.display = 'none';
    articleDropdown.style.display = 'none';

    title.textContent = article.title;
    image.src = article.image;
    image.alt = article.title;
    body.innerHTML = marked.parse(md);
  } catch (err) {
    title.textContent = article.title;
    image.src = article.image;
    image.alt = article.title;
    body.innerHTML = '<p style="color:#f66;">Error loading article content.</p>';
  }
}

// Back button handler
backToListBtn.addEventListener('click', () => {
  articleView.style.display = 'none';
  articlesDiv.style.display = 'grid';
  paginationDiv.style.display = 'flex';
  searchInput.style.display = 'block';
  articleDropdown.style.display = 'inline-block';
  body.innerHTML = '';
});

// Initialize site
window.onload = async () => {
  await loadLayout();
  await loadArticles();
};
// Theme toggle
const modeToggle = document.getElementById('modeToggle');
const isLight = localStorage.getItem('theme') === 'light';

if (isLight) {
  document.body.classList.add('light-mode');
  modeToggle.textContent = '🌞';
}

modeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  modeToggle.textContent = isLight ? '🌞' : '🌙';
});

// Hamburger menu toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
