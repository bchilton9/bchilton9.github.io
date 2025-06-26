let allArticles = [];


document.addEventListener("DOMContentLoaded", () => {
  fetch("header.html").then(res => res.text()).then(html => {
    document.getElementById("header-placeholder").innerHTML = html;
  });

  fetch("articles.json").then(res => res.json()).then(data => {
    allArticles = data;
    updateArticleListUI();
    populateLoaderDropdown();
  });

  setupTabs();
  setupButtons();
});

function setupTabs() {
  const wysiwyg = document.getElementById("wysiwygEditor");

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const tabId = "tab-" + btn.dataset.tab;
      document.querySelectorAll(".tab-content").forEach((tab) => tab.classList.remove("active"));
      document.getElementById(tabId).classList.add("active");

      if (tabId === "tab-wysiwyg") {
        wysiwyg.value = document.getElementById("markdownEditor").value;
      } else if (tabId === "tab-images") {
        loadImages();
      }
    });
  });

  document.getElementById("wysiwygEditor").addEventListener("input", (e) => {
    document.getElementById("markdownEditor").value = e.target.value;
  });

  document.getElementById("markdownEditor").addEventListener("input", (e) => {
    document.getElementById("wysiwygEditor").value = e.target.value;
  });
}

function setupButtons() {
  document.getElementById("articleLoader").addEventListener("change", (e) => {
    const id = e.target.value;
    if (!id) return clearForm();
    const article = allArticles.find((a) => a.id === id);
    if (article) {
      ["id", "title", "summary", "image", "categories"].forEach(key => {
        document.getElementById(key).value = key === "categories" ? article[key].join(", ") : article[key];
      });
      fetch(`articles/${id}.md`).then(res => res.text()).then(md => {
        document.getElementById("markdownEditor").value = md;
        document.getElementById("wysiwygEditor").value = md;
      });
    }
  });

  document.getElementById("downloadMd").addEventListener("click", () => {
    const id = document.getElementById("id").value.trim();
    const md = document.getElementById("markdownEditor").value;
    downloadFile(id + ".md", md, "text/markdown");
  });

  document.getElementById("copyMd").addEventListener("click", () => {
    copyToClipboard(document.getElementById("markdownEditor").value);
  });

  document.getElementById("copyJson").addEventListener("click", () => {
    const newArticle = buildArticleJson();
    const updated = [...allArticles.filter(a => a.id !== newArticle.id), newArticle];
    copyToClipboard(JSON.stringify(updated, null, 2));
  });

  document.getElementById("downloadJson").addEventListener("click", () => {
    const newArticle = buildArticleJson();
    const updated = [...allArticles.filter(a => a.id !== newArticle.id), newArticle];
    downloadFile("articles.json", JSON.stringify(updated, null, 2), "application/json");
  });
}

function populateLoaderDropdown() {
  const loader = document.getElementById("articleLoader");
  allArticles.forEach(article => {
    const opt = document.createElement("option");
    opt.value = article.id;
    opt.textContent = article.title;
    loader.appendChild(opt);
  });
}

function clearForm() {
  ["id", "title", "summary", "image", "categories"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("markdownEditor").value = "";
  document.getElementById("wysiwygEditor").value = "";
}

function updateArticleListUI() {
  const json = JSON.stringify(allArticles, null, 2);
  document.getElementById("articleListDisplay").textContent = json;
}

function buildArticleJson() {
  return {
    id: document.getElementById("id").value.trim(),
    title: document.getElementById("title").value.trim(),
    summary: document.getElementById("summary").value.trim(),
    image: document.getElementById("image").value.trim(),
    categories: document.getElementById("categories").value.split(",").map(c => c.trim()).filter(Boolean)
  };
}

function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
}

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => alert("Copied!"));
  } else {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    alert("Copied!");
  }
}

function loadImages() {
  const container = document.getElementById("imagePicker");
  container.innerHTML = "";
  fetch("images/") // assumes directory listing is allowed
    .then(res => res.text())
    .then(html => {
      const matches = html.match(/href="([^"]+\.(jpg|png|gif|jpeg))"/gi) || [];
      matches.map(m => m.replace(/.*href="|"/g, "")).forEach(file => {
        const fullPath = `images/${file}`;
        const box = document.createElement("div");
        box.innerHTML = `
          <img src="${fullPath}" alt="${file}">
          <p>${fullPath}</p>
          <button onclick="copyToClipboard('${fullPath}')">Copy Path</button>
          <button onclick="insertImageToMarkdown('${fullPath}')">Insert in Markdown</button>
          <button onclick="document.getElementById('image').value='${fullPath}'">Set as Main Image</button>
        `;
        container.appendChild(box);
      });
    });
}

window.insertImageToMarkdown = function(path) {
  const editor = document.getElementById("markdownEditor");
  const insert = `![Alt text](${path})\n`;
  editor.value += insert;
  document.getElementById("wysiwygEditor").value = editor.value;
};