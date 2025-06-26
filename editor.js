import Quill from 'https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.min.js';

let quill, allArticles = [];

// Load header.html with fallback
fetch("./header.html")
  .then(res => {
    if (!res.ok) throw new Error(res.status);
    return res.text();
  })
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;
    if (typeof initHeaderScripts === 'function') initHeaderScripts();
  })
  .catch(err => {
    console.warn("header.html failed:", err);
    document.getElementById("header-placeholder").innerHTML = `<header><h1>Gadget Guide Editor</h1></header>`;
  });

// Initialize editor after DOM ready
window.addEventListener("DOMContentLoaded", () => {
  quill = new Quill("#quillEditor", { theme: "snow" });

  fetch("./articles.json")
    .then(res => res.json())
    .then(data => {
      allArticles = data;
      populateArticleDropdown();
      populateCategories(data);
      updatePreview();
    })
    .catch(err => console.error("articles.json failed:", err));

  setupEventListeners();
});

// Populate article select dropdown
function populateArticleDropdown() {
  const sel = document.getElementById("articleSelect");
  sel.innerHTML = '<option value="">➕ New Article</option>';
  allArticles.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.title;
    sel.appendChild(opt);
  });
}

// Load categories checkboxes
function populateCategories(data) {
  const cats = [...new Set(data.flatMap(a => a.categories))].sort();
  const container = document.getElementById("categoryOptions");
  container.innerHTML = "";
  cats.forEach(cat => {
    const lbl = document.createElement("label");
    lbl.innerHTML = `<input type="checkbox" value="${cat}"> ${cat}`;
    container.appendChild(lbl);
  });
}

// Main event listeners setup
function setupEventListeners() {
  document.getElementById("articleSelect").addEventListener("change", handleArticleSelect);
  document.getElementById("newCategoryInput").addEventListener("keydown", handleNewCategory);
  document.getElementById("toggleCategoryDropdown").addEventListener("click", () => {
    document.getElementById("categoryOptions").classList.toggle("show");
  });
  quill.on("text-change", updatePreview);
  ["titleInput","summaryInput","imageInput","idInput"].forEach(id =>
    document.getElementById(id).addEventListener("input", updatePreview)
  );
  document.querySelectorAll(".copy-button").forEach(btn =>
    btn.addEventListener("click", handleCopy)
  );
  document.getElementById("downloadMd").addEventListener("click", downloadMd);
  document.getElementById("downloadJson").addEventListener("click", downloadJson);
}

// Handle selecting an article
function handleArticleSelect(e) {
  const id = e.target.value;
  if (!id) { clearFields(); return; }
  const art = allArticles.find(a => a.id === id);
  document.getElementById("idInput").value = art.id;
  document.getElementById("titleInput").value = art.title;
  document.getElementById("summaryInput").value = art.summary;
  document.getElementById("imageInput").value = art.image;
  document.querySelectorAll("#categoryOptions input").forEach(cb => {
    cb.checked = art.categories.includes(cb.value);
  });
  fetch(`./articles/${id}.md`)
    .then(r => r.text()).then(md => quill.setText(md));
}

// Add new category on Enter
function handleNewCategory(ev) {
  if (ev.key === "Enter" && ev.target.value.trim()) {
    const val = ev.target.value.trim();
    const lbl = document.createElement("label");
    lbl.innerHTML = `<input type="checkbox" checked value="${val}"> ${val}`;
    document.getElementById("categoryOptions").appendChild(lbl);
    ev.target.value = "";
    updatePreview();
  }
}

// Build combined article JSON
function buildArticleJson() {
  return {
    id: document.getElementById("idInput").value.trim(),
    title: document.getElementById("titleInput").value.trim(),
    summary: document.getElementById("summaryInput").value.trim(),
    image: document.getElementById("imageInput").value.trim(),
    categories: [...document.querySelectorAll("#categoryOptions input:checked")].map(cb => cb.value)
  };
}

// Update both Markdown & JSON previews
function updatePreview() {
  document.getElementById("markdownPreview").textContent = quill.getText().trim();
  document.getElementById("jsonPreview").textContent = JSON.stringify(buildArticleJson(), null, 2);
}

// Copy handler
function handleCopy(e) {
  const target = e.currentTarget.dataset.target + "Preview";
  const text = document.getElementById(target).textContent;
  navigator.clipboard.writeText(text).then(() => {
    e.currentTarget.textContent = "✅";
    setTimeout(() => e.currentTarget.textContent = "📋", 1200);
  });
}

// Download .md
function downloadMd() {
  const id = document.getElementById("idInput").value || "article";
  const blob = new Blob([quill.getText()], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${id}.md`;
  a.click();
}

// Download updated JSON
function downloadJson() {
  const arr = [...allArticles.filter(a => a.id !== buildArticleJson().id), buildArticleJson()];
  const blob = new Blob([JSON.stringify(arr, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "articles.json";
  a.click();
}

// Clear input fields
function clearFields() {
  ["idInput","titleInput","summaryInput","imageInput"].forEach(id => document.getElementById(id).value = "");
  document.querySelectorAll("#categoryOptions input").forEach(cb => cb.checked = false);
  quill.setText("");
  updatePreview();
}