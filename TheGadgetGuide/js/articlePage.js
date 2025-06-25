async function loadArticle() {
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");

  const res = await fetch("data/articles.json");
  const articles = await res.json();
  const article = articles.find(a => a.id === articleId);

  if (!article) {
    document.getElementById("articleContent").innerHTML = "<p>Article not found.</p>";
    return;
  }

  document.title = `${article.title} - The Gadget Guide`;
  document.getElementById("articleTitle").textContent = article.title;
  document.getElementById("articleImage").src = article.image;
  document.getElementById("articleImage").alt = article.title;
  document.getElementById("articleBody").textContent = article.content;
}

window.addEventListener("DOMContentLoaded", loadArticle);
