// editor.js

// Load header
fetch("header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;
  });

// Tab switching
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const tabId = "tab-" + btn.dataset.tab;
    document.querySelectorAll(".tab-content").forEach(tab => {
      tab.classList.remove("active");
    });
    document.getElementById(tabId).classList.add("active");
  });
});

const wysiwyg = document.getElementById("wysiwygEditor");
const markdown = document.getElementById("markdownEditor");
const articleLoader = document.getElementById("articleLoader");
const articleListDisplay = document.getElementById("articleListDisplay");

let allArticles = [];

// Simulated images list, since JS cannot read directories on client side
const images = [
  "images/IMG_1289.png",
  "images/IMG_1291.png",
  "images/IMG_1301.png",
  "images/IMG_1328.png",
  "images/IMG_1334.png",
  "images/IMG_1330.png"
];

// Populate images tab
function loadImages() {
  const container = document.getElementById("imageList");
  container.innerHTML = "";
  images.forEach(img => {
    const imgElem = document.createElement("img");
    imgElem.src = img;
    imgElem.alt = img.split("/").pop();
    imgElem.className = "thumb";
    imgElem.title = "Click to insert URL";
    imgElem.addEventListener("click", () => {
      document.getElementById("image").value = img;
      alert(`Image URL inserted: ${img}`);
    });
    container.appendChild(imgElem);
  });
}

// Load articles.json and populate dropdown + articleList display
fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    allArticles = data;
    updateArticleListUI();
    populateLoaderDropdown();
  });

// Build JSON object from form fields
function buildArticleJson() {
  return {
    id: document.getElementById("id").value.trim(),
    title: document.getElementById("title").value.trim(),
    summary: document.getElementById("summary").value.trim(),
    image: document.getElementById("image").value.trim(),
    categories: document.getElementById("categories").value.split(",").map(c => c.trim()).filter(Boolean)
  };
}

function populateLoaderDropdown() {
  articleLoader.innerHTML = '<option value="">➕ New Article</option>';
  allArticles.forEach(article => {
    const option = document.createElement("option");
    option.value = article.id;
    option.textContent = article.title;
    articleLoader.appendChild(option);
  });
}

// When article selected, fill form and load markdown
articleLoader.addEventListener("change", e => {
  const id = e.target.value;
  if (!id) {
    clearForm();
    return;
  }
  const article = allArticles.find(a => a.id === id);
  if (!article) return;
  document.getElementById("id").value = article.id;
  document.getElementById("title").value = article.title;
  document.getElementById("summary").value = article.summary;
  document.getElementById("image").value = article.image;
  document.getElementById("categories").value = article.categories.join(", ");

  fetch(`articles/${article.id}.md`)
    .then(res => res.text())
    .then(md => {
      markdown.value = md;
      wysiwyg.value = md;
    });
});

function clearForm() {
  ["id", "title", "summary", "image", "categories"].forEach(id => {
    document.getElementById(id).value = "";
  });
  markdown.value = "";
  wysiwyg.value = "";
}

function updateArticleListUI() {
  articleListDisplay.textContent = JSON.stringify(allArticles, null, 2);
}

// Export buttons
document.getElementById("downloadMd").addEventListener("click", () => {
  const id = document.getElementById("id").value.trim();
  const md = markdown.value;
  if (!id) {
    alert("Enter an article ID before downloading.");
    return;
  }
  const blob = new Blob([md], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = id + ".md";
  link.click();
});

document.getElementById("copyMd").addEventListener("click", () => {
  const md = markdown.value;
  navigator.clipboard.writeText(md).then(() => {
    alert("Markdown copied!");
  });
});

document.getElementById("copyJson").addEventListener("click", () => {
  const newArticle = buildArticleJson();
  if (!newArticle.id) {
    alert("Enter an article ID before copying JSON.");
    return;
  }
  const updated = [...allArticles.filter(a => a.id !== newArticle.id), newArticle];
  navigator.clipboard.writeText(JSON.stringify(updated, null, 2)).then(() => {
    alert("JSON copied!");
  });
});

document.getElementById("downloadJson").addEventListener("click", () => {
  const newArticle = buildArticleJson();
  if (!newArticle.id) {
    alert("Enter an article ID before downloading JSON.");
    return;
  }
  const updated = [...allArticles.filter(a => a.id !== newArticle.id), newArticle];
  const blob = new Blob([JSON.stringify(updated, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "articles.json";
  link.click();
});

// Sync wysiwyg and markdown tabs bi-directionally
wysiwyg.addEventListener("input", () => {
  markdown.value = wysiwyg.value;
});
markdown.addEventListener("input", () => {
  wysiwyg.value = markdown.value;
});

// Initialize images tab when page loads
loadImages();