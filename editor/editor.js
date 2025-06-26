// Load header
fetch("header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;
  });

// Globals
let allArticles = [];
let quill;
const quillEditorContainer = document.getElementById("quillEditor");

// Initialize Quill
function initQuill() {
  quill = new Quill("#quillEditor", {
    theme: "snow",
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"]
      ]
    }
  });

  quill.on('text-change', () => {
    const html = quill.root.innerHTML;
    markdownFromHtml(html);
  });
}

// Convert HTML from Quill to Markdown
function markdownFromHtml(html) {
  // Using a simple conversion with Turndown.js (needs to be included in your page)
  if (window.turndownService) {
    const md = window.turndownService.turndown(html);
    document.getElementById("markdownContent").textContent = md;
  } else {
    // Fallback: just show html if no turndown available
    document.getElementById("markdownContent").textContent = html;
  }
}

// Convert markdown textarea content to Quill HTML (simple sync)
function htmlFromMarkdown(md) {
  // Using marked.js to parse markdown to HTML (needs to be included in your page)
  if (window.marked) {
    const html = marked.parse(md);
    quill.root.innerHTML = html;
  } else {
    quill.root.innerHTML = md;
  }
}

// Populate the edit article dropdown
function populateArticleLoader() {
  const loader = document.getElementById("articleLoader");
  loader.innerHTML = '<option value="">➕ New Article</option>';
  allArticles.forEach(article => {
    const opt = document.createElement("option");
    opt.value = article.id;
    opt.textContent = article.title;
    loader.appendChild(opt);
  });
}

// Populate category checkboxes from existing categories
function populateCategoryCheckboxes() {
  const container = document.getElementById("categoryCheckboxes");
  container.innerHTML = "";
  const categoriesSet = new Set();
  allArticles.forEach(a => a.categories.forEach(c => categoriesSet.add(c)));
  const categories = Array.from(categoriesSet).sort();

  categories.forEach(cat => {
    const id = "cat_" + cat.replace(/\s+/g, "_");
    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = cat;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.name = "categories";
    checkbox.value = cat;

    label.prepend(checkbox);
    container.appendChild(label);
  });
}

// Load selected article into form
function loadArticle(id) {
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

  // Categories
  const checkboxes = document.querySelectorAll("#categoryCheckboxes input[type=checkbox]");
  checkboxes.forEach(cb => {
    cb.checked = article.categories.includes(cb.value);
  });

  // Load markdown content and Quill content
  fetch(`articles/${article.id}.md`)
    .then(res => res.text())
    .then(md => {
      document.getElementById("markdownContent").textContent = md;
      htmlFromMarkdown(md);
    });
}

// Clear form
function clearForm() {
  ["id", "title", "summary", "image"].forEach(id => {
    document.getElementById(id).value = "";
  });
  const checkboxes = document.querySelectorAll("#categoryCheckboxes input[type=checkbox]");
  checkboxes.forEach(cb => cb.checked = false);
  document.getElementById("markdownContent").textContent = "";
  quill.root.innerHTML = "";
  document.getElementById("articleLoader").value = "";
}

// Build article JSON object from inputs
function buildArticleJson() {
  const id = document.getElementById("id").value.trim();
  const title = document.getElementById("title").value.trim();
  const summary = document.getElementById("summary").value.trim();
  const image = document.getElementById("image").value.trim();

  const selectedCategories = Array.from(document.querySelectorAll("#categoryCheckboxes input[type=checkbox]:checked"))
    .map(cb => cb.value);

  return { id, title, summary, image, categories: selectedCategories };
}

// Add new category
document.getElementById("addCategoryBtn").addEventListener("click", () => {
  const newCatInput = document.getElementById("newCategory");
  const val = newCatInput.value.trim();
  if (!val) return alert("Enter a category name");

  // Check if category exists
  const exists = Array.from(document.querySelectorAll("#categoryCheckboxes input[type=checkbox]"))
    .some(cb => cb.value.toLowerCase() === val.toLowerCase());

  if (exists) {
    alert("Category already exists");
    newCatInput.value = "";
    return;
  }

  // Create new checkbox
  const id = "cat_" + val.replace(/\s+/g, "_");
  const label = document.createElement("label");
  label.setAttribute("for", id);
  label.textContent = val;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = id;
  checkbox.name = "categories";
  checkbox.value = val;
  checkbox.checked = true;

  label.prepend(checkbox);
  document.getElementById("categoryCheckboxes").appendChild(label);

  newCatInput.value = "";
});

// Export buttons
document.getElementById("downloadMd").addEventListener("click", () => {
  const id = document.getElementById("id").value.trim();
  if (!id) return alert("Set an article ID first");
  const md = document.getElementById("markdownContent").textContent;
  const blob = new Blob([md], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = id + ".md";
  a.click();
});

document.getElementById("copyMd").addEventListener("click", () => {
  const md = document.getElementById("markdownContent").textContent;
  copyToClipboard(md);
});

document.getElementById("downloadJson").addEventListener("click", () => {
  const newArticle = buildArticleJson();
  const filtered = allArticles.filter(a => a.id !== newArticle.id);
  const updated = [...filtered, newArticle];
  const blob = new Blob([JSON.stringify(updated, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "articles.json";
  a.click();
});

document.getElementById("copyJson").addEventListener("click", () => {
  const newArticle = buildArticleJson();
  const filtered = allArticles.filter(a => a.id !== newArticle.id);
  const updated = [...filtered, newArticle];
  copyToClipboard(JSON.stringify(updated, null, 2));
});

// Copy to clipboard utility with iOS support fallback
function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => alert("Copied!"));
  } else {
    // fallback for older browsers or insecure context
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      alert("Copied!");
    } catch {
      alert("Copy failed");
    }
    document.body.removeChild(ta);
  }
}

// Initialize app after DOM ready
document.addEventListener("DOMContentLoaded", () => {
  // Fetch articles.json from root
  fetch("articles.json")
    .then(res => res.json())
    .then(data => {
      allArticles = data;
      populateArticleLoader();
      populateCategoryCheckboxes();
      initQuill();
    });

  // Article loader change
  document.getElementById("articleLoader").addEventListener("change", e => {
    loadArticle(e.target.value);
  });
});