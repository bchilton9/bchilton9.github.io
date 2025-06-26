// Load header
fetch("header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;
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

// Populate articles.json dropdown
let allArticles = [];
let images = [];

fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    allArticles = data;
    updateArticleListUI();
    const loader = document.getElementById("articleLoader");
    data.forEach(article => {
      const opt = document.createElement("option");
      opt.value = article.id;
      opt.textContent = article.title;
      loader.appendChild(opt);
    });
  });

fetch("images/")
  .then(res => res.text())
  .then(html => {
    const matches = Array.from(html.matchAll(/href="([^"]+\.(png|jpg|jpeg|gif|webp))"/gi));
    images = matches.map(m => "images/" + m[1]);
    loadImages();
  });

document.getElementById("articleLoader").addEventListener("change", (e) => {
  const id = e.target.value;
  if (!id) return clearForm();
  const article = allArticles.find(a => a.id === id);
  if (!article) return;

  ["id", "title", "summary", "image"].forEach(k => {
    document.getElementById(k).value = article[k] || "";
  });
  document.getElementById("categories").value = article.categories.join(", ");

  fetch(`articles/${article.id}.md`)
    .then(res => res.text())
    .then(md => {
      document.getElementById("markdownEditor").value = md;
      document.getElementById("wysiwygEditor").value = md;
    });
});

function clearForm() {
  ["id", "title", "summary", "image", "categories"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("markdownEditor").value = "";
  document.getElementById("wysiwygEditor").value = "";
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

function updateArticleListUI() {
  const json = JSON.stringify(allArticles, null, 2);
  document.getElementById("articleListDisplay").textContent = json;
}

function loadImages() {
  const container = document.getElementById("imageList");
  container.innerHTML = "";
  images.forEach((imgPath) => {
    const wrap = document.createElement("div");
    wrap.className = "image-item";

    const img = document.createElement("img");
    img.src = imgPath;
    img.alt = "";

    const label = document.createElement("div");
    label.textContent = imgPath;

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", () => {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(imgPath).then(() => {
          copyBtn.textContent = "Copied!";
          setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
        });
      } else {
        const area = document.createElement("textarea");
        area.value = imgPath;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.focus();
        area.select();
        try {
          document.execCommand("copy");
          copyBtn.textContent = "Copied!";
        } catch {
          alert("Copy failed");
        }
        document.body.removeChild(area);
        setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
      }
    });

    wrap.appendChild(img);
    wrap.appendChild(label);
    wrap.appendChild(copyBtn);
    container.appendChild(wrap);
  });
}

document.getElementById("downloadMd").addEventListener("click", () => {
  const id = document.getElementById("id").value.trim();
  const md = document.getElementById("markdownEditor").value;
  const blob = new Blob([md], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = id + ".md";
  link.click();
});

document.getElementById("copyMd").addEventListener("click", () => {
  const md = document.getElementById("markdownEditor").value;
  navigator.clipboard.writeText(md).then(() => {
    alert("Markdown copied!");
  });
});

document.getElementById("copyJson").addEventListener("click", () => {
  const newArticle = buildArticleJson();
  const updated = [...allArticles.filter(a => a.id !== newArticle.id), newArticle];
  navigator.clipboard.writeText(JSON.stringify(updated, null, 2)).then(() => {
    alert("JSON copied!");
  });
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