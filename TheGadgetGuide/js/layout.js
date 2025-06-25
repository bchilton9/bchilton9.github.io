// Load a partial into the page and perform additional actions after load
async function loadLayoutPart(id, url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;

    if (id === "footer") {
      setFooterYear();
    }

    if (id === "header") {
      highlightActiveNavLink();
      loadDropdownArticles();
    }
  } catch (err) {
    console.error(`Failed to load ${url}:`, err);
  }
}

// Set copyright year
function setFooterYear() {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

// Highlight the nav link for the current page
function highlightActiveNavLink() {
  const current = window.location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll("#header a.nav-link");

  links.forEach(link => {
    const page = link.getAttribute("data-page");
    if (page === current || (page === "index.html" && current === "")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// Load article titles into the dropdown menu
async function loadDropdownArticles() {
  try {
    const res = await fetch("data/articles.json");
    const articles = await res.json();
    const menu = document.getElementById("articlesMenu");

    if (!menu) return;

    articles.forEach(article => {
      const item = document.createElement("li");
      item.innerHTML = `<a class="dropdown-item" href="${article.url}">${article.title}</a>`;
      menu.appendChild(item);
    });
  } catch (err) {
    console.error("Error loading article list for dropdown:", err);
  }
}

// Load header and footer on DOM ready
window.addEventListener("DOMContentLoaded", () => {
  loadLayoutPart("header", "partials/header.html");
  loadLayoutPart("footer", "partials/footer.html");
});
