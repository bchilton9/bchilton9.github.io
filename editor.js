// Load header
fetch("header.html").then(res => res.text()).then(html => {
  document.getElementById("header-placeholder").innerHTML = html;
});

// Tab switching
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
  });
});

const wysiwyg = document.getElementById("wysiwygEditor");
const markdown = document.getElementById("markdownEditor");

// Sync both ways
let syncing = false;
wysiwyg.addEventListener("input", () => {
  if (syncing) return;
  syncing = true;
  markdown.value = wysiwyg.value;
  syncing = false;
});

markdown.addEventListener("input", () => {
  if (syncing) return;
  syncing = true;
  wysiwyg.value = markdown.value;
  syncing = false;
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
  .then((res) => res.json())
  .then((data) => {
    allArticles = data;
    updateArticleListUI();
    populateLoaderDropdown();
  });

function updateArticleListUI() {
  document.getElementById("articleListDisplay").textContent = JSON.stringify(allArticles, null, 2);
}

function populateLoaderDropdown() {
  const loader = document.getElementById("articleLoader");
  allArticles.forEach((article) => {
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
    fetch(`articles/${article.id}.md`).then(res => res.text()).then((md) => {
      wysiwyg.value = md;
      markdown.value = md;
    });
  }
});

function clearForm() {
  ["id", "title", "summary", "image", "categories"].forEach(id => document.getElementById(id).value = "");
  wysiwyg.value = "";
  markdown.value = "";
}

// Export buttons
document.getElementById("downloadMd").onclick = () => {
  const blob = new Blob([markdown.value], { type: "text/markdown" });
  const link = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: document.getElementById("id").value.trim() + ".md"
  });
  link.click();
};

document.getElementById("copyMd").onclick = () => {
  navigator.clipboard.writeText(markdown.value).then(() => alert("Markdown copied!"));
};

document.getElementById("copyJson").onclick = () => {
  const updated = [...allArticles.filter(a => a.id !== buildArticleJson().id), buildArticleJson()];
  navigator.clipboard.writeText(JSON.stringify(updated, null, 2)).then(() => alert("JSON copied!"));
};

document.getElementById("downloadJson").onclick = () => {
  const updated = [...allArticles.filter(a => a.id !== buildArticleJson().id), buildArticleJson()];
  const blob = new Blob([JSON.stringify(updated, null, 2)], { type: "application/json" });
  const link = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: "articles.json"
  });
  link.click();
};

// Load images from /images/
fetch("images/").then(res => res.text()).then((html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const links = Array.from(doc.querySelectorAll("a"));
  const imageGrid = document.getElementById("imageGrid");

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (/\.(png|jpe?g|gif|webp)$/i.test(href)) {
      const fullPath = `images/${href}`;
      const figure = document.createElement("figure");
      figure.innerHTML = `
        <img src="${fullPath}" alt="${href}" />
        <figcaption>${fullPath}</figcaption>
        <button onclick="copyImage('${fullPath}')">📋 Copy Path</button>
        <button onclick="insertImage('${fullPath}')">⬇️ Insert into Markdown</button>
        <button onclick="setImage('${fullPath}')">🎯 Set as Main</button>
      `;
      imageGrid.appendChild(figure);
    }
  });
});

window.copyImage = (path) => {
  navigator.clipboard.writeText(path).then(() => alert("Copied to clipboard!"));
};
window.insertImage = (path) => {
  markdown.value += `\n\n![alt text](${path})\n`;
  wysiwyg.value = markdown.value;
};
window.setImage = (path) => {
  document.getElementById("image").value = path;
};