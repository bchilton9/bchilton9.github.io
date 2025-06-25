async function loadLayoutPart(id, url) {
  const response = await fetch(url);
  const html = await response.text();
  document.getElementById(id).innerHTML = html;

  if (id === "footer") {
    document.getElementById("year").textContent = new Date().getFullYear();
  }

  if (id === "header") {
    highlightActiveNavLink();
    loadDropdownArticles();
  }
}

async function loadDropdownArticles() {
  try {
    const res = await fetch("data/articles.json");
    const articles = await res.json();
    const menu = document.getElementById("articlesMenu");

    articles.forEach(article => {
      const item = document.createElement("li");
      item.innerHTML = `<a class="dropdown-item" href="${article.url}">${article.title}</a>`;
      menu.appendChild(item);
    });
  } catch (err) {
    console.error("Failed to load article list:", err);
  }
}
