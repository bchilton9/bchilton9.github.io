async function loadHTML(id, file) {
  const res = await fetch(file);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}
window.addEventListener("DOMContentLoaded", () => {
  loadHTML("header", "partials/header.html");
  loadHTML("footer", "partials/footer.html");
});
