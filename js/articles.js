let articles = [];
let currentPage = 1;
const perPage = 2;

async function loadArticles() {
  const res = await fetch("data/articles.json");
  articles = await res.json();
  renderArticles();
  setupSearch();
}

function renderArticles(filtered = articles) {
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageArticles = filtered.slice(start, end);

  const container = document.getElementById("articles");
  container.innerHTML = "";

  pageArticles.forEach(article => {
    const card = document.createElement("div");
    card.className = "col-md-6 mb-4";
    card.innerHTML = `
      <div class="card h-100 bg-secondary text-light border-light">
        <img src="\${article.image}" class="card-img-top" alt="\${article.title}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">\${article.title}</h5>
          <p class="card-text">\${article.summary}</p>
          <a href="\${article.url}" class="btn btn-outline-light mt-auto">Read More</a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  renderPagination(filtered);
}

function renderPagination(filtered) {
  const totalPages = Math.ceil(filtered.length / perPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = \`btn btn-sm \${i === currentPage ? "btn-light" : "btn-outline-light"} me-1\`;
    btn.textContent = i;
    btn.addEventListener("click", () => {
      currentPage = i;
      renderArticles(filtered);
    });
    pagination.appendChild(btn);
  }
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", () => {
    currentPage = 1;
    const query = searchInput.value.toLowerCase();
    const filtered = articles.filter(a =>
      a.title.toLowerCase().includes(query) || a.summary.toLowerCase().includes(query)
    );
    renderArticles(filtered);
  });
}

window.addEventListener("DOMContentLoaded", loadArticles);

