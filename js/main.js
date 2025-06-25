let allArticles = [];

const articlesDiv = document.getElementById('articles');
const articleView = document.getElementById('article-view');
const backButton = document.getElementById('back-button');
const title = document.getElementById('article-title');
const body = document.getElementById('article-body');
const image = document.getElementById('article-image');
const searchInput = document.getElementById('searchInput');
const dropdown = document.getElementById('articleDropdown');

// Load header and footer
fetch('header.html').then(res => res.text()).then(html => {
  document.getElementById('header').innerHTML = html;
});
fetch('footer.html').then(res => res.text()).then(html => {
  document.getElementById('footer').innerHTML = html;
});

// Load and render articles
fetch('data/articles.json')
  .then(res => res.json())
  .then(data => {
    allArticles = data;
    renderArticles(data);
    populateDropdown(data);
  });

function renderArticles(articles) {
  articlesDiv.innerHTML = '';
  articles.forEach(article => {
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
}

function showArticle(article) {
  articlesDiv.style.display = 'none';
  articleView.style.display = 'block';
  title.textContent = article.title;
  body.innerHTML = marked.parse(article.content);
  image.src = article.image;
  image.alt = article.title;
}

function populateDropdown(articles) {
  const dropdown = document.getElementById('articleDropdown');
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

backButton.addEventListener('click', () => {
  articleView.style.display = 'none';
  articlesDiv.style.display = 'block';
  searchInput.value = '';
  renderArticles(allArticles);
});

// Live search
searchInput.addEventListener('input', () => {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = allArticles.filter(a =>
    a.title.toLowerCase().includes(term) ||
    a.summary.toLowerCase().includes(term) ||
    a.content.toLowerCase().includes(term)
  );
  renderArticles(filtered);
});
