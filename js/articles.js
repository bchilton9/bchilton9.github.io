let currentPage = 1;
const perPage = 5;
let articles = [];

async function loadArticles() {
  const res = await fetch("data/articles.json");
  articles = await res.json();
  renderArticles();
  renderDropdown();
}

function renderArticles() {
  const container = document.getElementById("articlesContainer");
  const start = (currentPage - 1) * perPage;
  const pageArticles = articles.slice(start, start + perPage);
  container.innerHTML = pageArticles.map(article => `
    <div class="card">
      <img src="${article.image}" alt="${article.title}">
      <h2>${article.title}</h2>
      <p>${article.summary}</p>
      <a href="${article.url}">Read More</a>
    </div>
  `).join("");

  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(articles.length / perPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      renderArticles();
    };
    pagination.appendChild(btn);
  }
}

function renderDropdown() {
  const dropdown = document.createElement("select");
  dropdown.innerHTML = articles.map(a => `<option value="${a.url}">${a.title}</option>`).join("");
  dropdown.onchange = (e) => window.location.href = e.target.value;
  document.getElementById("header").appendChild(dropdown);
}

window.addEventListener("DOMContentLoaded", loadArticles);
