async function loadLayoutPart(id, url) {
  const response = await fetch(url);
  const html = await response.text();
  document.getElementById(id).innerHTML = html;

  if (id === "footer") {
    document.getElementById("year").textContent = new Date().getFullYear();
  }

  if (id === "header") {
    highlightActiveNavLink();
  }
}

function highlightActiveNavLink() {
  const current = window.location.pathname.split("/").pop();
  const links = document.querySelectorAll("#header a.nav-link");

  links.forEach(link => {
    const page = link.getAttribute("data-page");
    if (page === current || (current === "" && page === "index.html")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  loadLayoutPart("header", "partials/header.html");
  loadLayoutPart("footer", "partials/footer.html");
});
