async function loadLayoutPart(id, url) {
  const response = await fetch(url);
  const html = await response.text();
  document.getElementById(id).innerHTML = html;

  if (id === "footer") {
    document.getElementById("year").textContent = new Date().getFullYear();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadLayoutPart("header", "partials/header.html");
  loadLayoutPart("footer", "partials/footer.html");
});
