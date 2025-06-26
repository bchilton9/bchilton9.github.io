// Load header and activate menu
fetch("header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");
    menuToggle?.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
  });

// Tabs
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
  });
});

const wysiwygEditor = document.getElementById("wysiwygEditor");
const markdownEditor = document.getElementById("markdownEditor");

wysiwygEditor.addEventListener("input", () => {
  markdownEditor.value = wysiwygEditor.value;
});
markdownEditor.addEventListener("input", () => {
  wysiwygEditor.value = markdownEditor.value;
});

function buildArticleJson() {
  return {
    id: document.getElementById("id").value.trim(),
    title: document.getElementById("title").value.trim(),
    summary: document.getElementById("summary").value.trim(),
    image: document.getElementById("image").value.trim(),
    categories: document.getElementById("categories").value.split(",").map(c => c.trim()).filter(Boolean)
  };
}

let allArticles = [];

fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    allArticles = data;
    updateArticleListUI();
    populateLoaderDropdown();
  });

function populateLoaderDropdown() {
  const loader = document.getElementById("articleLoader");
  allArticles.forEach(article => {
    const option = document.createElement("option");
    option.value = article.id;
    option.textContent = article.title;
    loader.appendChild(option);
  });
}

document.getElementById("articleLoader").addEventListener("change", (e) => {
  const id = e.target.value;
  if (!id) return clearForm();

  const article = allArticles.find(a => a.id === id);
  if (article) {
    document.getElementById("id").value = article.id;
    document.getElementById("title").value = article.title;
    document.getElementById("summary").value = article.summary;
    document.getElementById("image").value = article.image;
    document.getElementById("categories").value = article.categories.join(", ");
    fetch(`articles/${article.id}.md`)
      .then(res => res.text())
      .then(md => {
        markdownEditor.value = md;
        wysiwygEditor.value = md;
      });
  }
});

function clearForm() {
  ["id", "title", "summary", "image", "categories"].forEach(id => {
    document.getElementById(id).value = "";
  });
  wysiwygEditor.value = "";
  markdownEditor.value = "";
}

function updateArticleListUI() {
  document.getElementById("articleListDisplay").textContent = JSON.stringify(allArticles, null, 2);
}

// Export buttons
document.getElementById("downloadMd").addEventListener("click", () => {
  const id = document.getElementById("id").value.trim();
  const blob = new Blob([markdownEditor.value], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = id + ".md";
  link.click();
});

document.getElementById("copyMd").addEventListener("click", () => {
  navigator.clipboard.writeText(markdownEditor.value).then(() => alert("Markdown copied!"));
});

document.getElementById("copyJson").addEventListener("click", () => {
  const newArticle = buildArticleJson();
  const updated = [...allArticles.filter(a => a.id !== newArticle.id), newArticle];
  navigator.clipboard.writeText(JSON.stringify(updated, null, 2)).then(() => alert("JSON copied!"));
});

document.getElementById("downloadJson").addEventListener("click", () => {
  const newArticle = buildArticleJson();
  const updated = [...allArticles.filter(a => a.id !== newArticle.id), newArticle];
  const blob = new Blob([JSON.stringify(updated, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "articles.json";
  link.click();
});

// Image tab: auto-list .png/.jpg from /images
fetch("images/").then(res => res.text()).then(html => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const links = Array.from(doc.querySelectorAll('a')).map(a => a.getAttribute('href'));
  const imageList = document.getElementById("imageList");
  links.filter(href => /\.(png|jpe?g|webp|gif)$/i.test(href)).forEach(src => {
    const img = document.createElement("img");
    img.src = "images/" + src;
    img.alt = src;
    img.onclick = () => {
      document.getElementById("image").value = img.src;
      alert("Image selected: " + img.src);
    };
    imageList.appendChild(img);
  });
});