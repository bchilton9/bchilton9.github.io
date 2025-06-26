// Load shared header
fetch("header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;
    initHeaderScripts?.(); // Optional
  });

// Tab switching
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
  });
});

const mdEditor = document.getElementById("markdownEditor");
const wysiwyg = document.getElementById("wysiwygBox");
const idField = document.getElementById("id");
const titleField = document.getElementById("title");
const summaryField = document.getElementById("summary");
const imageField = document.getElementById("image");
const categoriesField = document.getElementById("categories");

let allArticles = [];

// Live sync between editors
mdEditor.addEventListener("input", () => {
  wysiwyg.innerHTML = marked.parse(mdEditor.value);
});
wysiwyg.addEventListener("input", () => {
  // Optional: update mdEditor from wysiwyg if you implement a proper rich editor
});

// Load articles.json and build dropdown
fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    allArticles = data;
    updateArticleList();
    populateArticleDropdown();
  });

function populateArticleDropdown() {
  const select = document.getElementById("articleLoader");
  allArticles.forEach(article => {
    const opt = document.createElement("option");
    opt.value = article.id;
    opt.textContent = article.title;
    select.appendChild(opt);
  });
}

document.getElementById("articleLoader").addEventListener("change", e => {
  const id = e.target.value;
  if (!id) return clearForm();

  const article = allArticles.find(a => a.id === id);
  if (!article) return;

  idField.value = article.id;
  titleField.value = article.title;
  summaryField.value = article.summary;
  imageField.value = article.image;
  categoriesField.value = article.categories.join(", ");

  fetch(`articles/${article.id}.md`)
    .then(res => res.text())
    .then(md => {
      mdEditor.value = md;
      wysiwyg.innerHTML = marked.parse(md);
    });
});

function clearForm() {
  [idField, titleField, summaryField, imageField, categoriesField].forEach(el => el.value = "");
  mdEditor.value = "";
  wysiwyg.innerHTML = "";
}

// Export buttons
document.getElementById("downloadMd").addEventListener("click", () => {
  const id = idField.value.trim();
  const blob = new Blob([mdEditor.value], { type: "text/markdown" });
  triggerDownload(blob, `${id || "article"}.md`);
});

document.getElementById("copyMd").addEventListener("click", () => {
  copyText(mdEditor.value);
});

document.getElementById("copyJson").addEventListener("click", () => {
  const updated = buildUpdatedJson();
  copyText(JSON.stringify(updated, null, 2));
});

document.getElementById("downloadJson").addEventListener("click", () => {
  const updated = buildUpdatedJson();
  const blob = new Blob([JSON.stringify(updated, null, 2)], { type: "application/json" });
  triggerDownload(blob, "articles.json");
});

function triggerDownload(blob, filename) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function copyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = 0;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  alert("Copied!");
}

function buildUpdatedJson() {
  const newArticle = {
    id: idField.value.trim(),
    title: titleField.value.trim(),
    summary: summaryField.value.trim(),
    image: imageField.value.trim(),
    categories: categoriesField.value.split(",").map(c => c.trim()).filter(Boolean)
  };
  const filtered = allArticles.filter(a => a.id !== newArticle.id);
  return [...filtered, newArticle].sort((a, b) => a.title.localeCompare(b.title));
}

function updateArticleList() {
  const display = document.getElementById("articleListDisplay");
  display.textContent = JSON.stringify(allArticles, null, 2);
}

// Load image list from images/ directory
fetch("images/")
  .then(res => res.text())
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const links = Array.from(doc.querySelectorAll("a"))
      .map(link => link.getAttribute("href"))
      .filter(name => /\.(png|jpe?g|gif)$/i.test(name));

    const container = document.getElementById("imageList");
    container.innerHTML = "";

    links.forEach(filename => {
      const fullPath = "images/" + filename;
      const entry = document.createElement("div");
      entry.className = "image-entry";
      entry.innerHTML = `
        <img src="${fullPath}" alt="" />
        <span class="path">${fullPath}</span>
        <button class="copyBtn">📋 Copy Path</button>
        <button class="insertMdBtn">🖼️ → Markdown</button>
        <button class="setImgBtn">🏞️ → Main Image</button>
      `;
      container.appendChild(entry);

      entry.querySelector(".copyBtn").onclick = () => copyText(fullPath);
      entry.querySelector(".insertMdBtn").onclick = () => {
        mdEditor.value += `\n![Image](${fullPath})\n`;
        wysiwyg.innerHTML = marked.parse(mdEditor.value);
      };
      entry.querySelector(".setImgBtn").onclick = () => {
        imageField.value = fullPath;
      };
    });
  })
  .catch(err => {
    console.error("Failed to load image list:", err);
    const container = document.getElementById("imageList");
    container.innerHTML = "<p style='color: red;'>Error loading images directory. Hosting must allow directory listing.</p>";
  });