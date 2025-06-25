async function loadArticles() {
  const res = await fetch("data/articles.json");
  const articles = await res.json();

  const container = document.getElementById("articles");

  articles.forEach(article => {
    const card = document.createElement("div");
    card.className = "col-md-4 mb-4";
    card.innerHTML = `
      <div class="card h-100 bg-secondary text-light border-light">
        <img src="${article.image}" class="card-img-top" alt="${article.title}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${article.title}</h5>
          <p class="card-text">${article.summary}</p>
          <a href="${article.url}" class="btn btn-outline-light mt-auto">Read More</a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

window.addEventListener("DOMContentLoaded", loadArticles);
