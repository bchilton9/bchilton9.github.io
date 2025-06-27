// Load header.html into #header-placeholder
fetch("header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;
  })
  .catch(() => {
    console.warn("Failed to load header.html");
  });

// Globals
let allArticles = [];
let categories = new Set();

const articleLoader = document.getElementById("articleLoader");
const titleInput = document.getElementById("title");
const summaryInput = document.getElementById("summary");
const imageInput = document.getElementById("image");
const idInput = document.getElementById("id");
const wysiwygEditor = document.getElementById("wysiwygEditor");
const markdownEditor = document.getElementById("markdownEditor");
const markdownOutput = document.getElementById("markdownOutput");
const jsonOutput = document.getElementById("jsonOutput");

const categoriesSelect = document.getElementById("categoriesSelect");
const categoriesList = document.getElementById("categoriesList");
const categoriesDropdown = document.getElementById("categoriesDropdown");
const newCategoryInput = document.getElementById("newCategoryInput");
const addCategoryBtn = document.getElementById("addCategoryBtn");

// Fetch articles.json
async function loadArticles() {
  try {
    const res = await fetch("articles.json");
    if (!res.ok) throw new Error("Failed loading articles.json");
    allArticles = await res.json();
    collectCategories();
    populateArticleLoader();
    populateCategoriesList();
    updateOutputs();
  } catch (e) {
    console.error(e);
  }
}

// Collect unique categories
function collectCategories() {
  categories.clear();
  allArticles.forEach(a => {
    a.categories.forEach(c => categories.add(c));
  });
}

// Populate edit article dropdown
function populateArticleLoader() {
  // Clear but keep new article option
  articleLoader.innerHTML = `<option value="">➕ New Article</option>`;
  allArticles.forEach(article => {
    const opt = document.createElement("option");
    opt.value = article.id;
    opt.textContent = article.title;
    articleLoader.appendChild(opt);
  });
}

// Populate category checkboxes list
function populateCategoriesList() {
  categoriesList.innerHTML = "";
  categories.forEach(cat => {
    const li = document.createElement("li");
    li.innerHTML = `
      <label>
        <input type="checkbox" value="${cat}" />
        ${cat}
      </label>
    `;
    categoriesList.appendChild(li);
  });
}

// Open/close categories dropdown
categoriesSelect.addEventListener("click", () => {
  const expanded = categoriesSelect.getAttribute("aria-expanded") === "true";
  categoriesSelect.setAttribute("aria-expanded", !expanded);
  categoriesList.classList.toggle("show");
  if (!expanded) newCategoryInput.focus();
});

// Auto-close dropdown if clicked outside
document.addEventListener("click", (e) => {
  if (!categoriesDropdown.contains(e.target)) {
    categoriesList.classList.remove("show");
    categoriesSelect.setAttribute("aria-expanded", false);
  }
});

// Add new category
addCategoryBtn.addEventListener("click", () => {
  const val = newCategoryInput.value.trim();
  if (!val) return alert("Enter a category name.");
  if (categories.has(val)) return alert("Category already exists.");
  categories.add(val);
  populateCategoriesList();
  newCategoryInput.value = "";
  newCategoryInput.focus();
});

// When article changes
articleLoader.addEventListener("change", () => {
  const id = articleLoader.value;
  if (!id) {
    clearForm();
    updateOutputs();
    return;
  }
  const article = allArticles.find(a => a.id === id);
  if (!article) return;
  fillForm(article);
});

// Fill form fields with article data
function fillForm(article) {
  idInput.value = article.id;
  titleInput.value = article.title;
  summaryInput.value = article.summary;
  imageInput.value = article.image;
  // Categories checkboxes
  const checkedCategories = new Set(article.categories);
  categoriesList.querySelectorAll("input[type=checkbox]").forEach(cb => {
    cb.checked = checkedCategories.has(cb.value);
  });

  // Load markdown content from article's markdown file
  fetch(`articles/${article.id}.md`)
    .then(res => res.text())
    .then(md => {
      markdownEditor.value = md;
      wysiwygEditor.innerHTML = marked.parse(md);
      updateOutputs();
    })
    .catch(() => {
      markdownEditor.value = "";
      wysiwygEditor.innerHTML = "";
      updateOutputs();
    });
}

// Clear form for new article
function clearForm() {
  idInput.value = "";
  titleInput.value = "";
  summaryInput.value = "";
  imageInput.value = "";
  markdownEditor.value = "";
  wysiwygEditor.innerHTML = "";
  categoriesList.querySelectorAll("input[type=checkbox]").forEach(cb => (cb.checked = false));
}

// Build article JSON from form fields
function buildArticleJson() {
  const checkedCats = Array.from(categoriesList.querySelectorAll("input[type=checkbox]:checked")).map(
    cb => cb.value
  );

  return {
    id: idInput.value.trim(),
    title: titleInput.value.trim(),
    summary: summaryInput.value.trim(),
    image: imageInput.value.trim(),
    categories: checkedCats
  };
}

// Update output boxes
function updateOutputs() {
  const md = markdownEditor.value.trim();
  markdownOutput.textContent = md || "(empty)";
  const newArticle = buildArticleJson();

  // Update allArticles JSON with current article replaced or added
  const updated = allArticles.filter(a => a.id !== newArticle.id);
  if (newArticle.id) updated.push(newArticle);

  jsonOutput.textContent = JSON.stringify(updated, null, 2);
}

// Sync markdown → wysiwyg
document.getElementById("syncMdToWysiwyg").addEventListener("click", () => {
  const md = markdownEditor.value.trim();
  wysiwygEditor.innerHTML = marked.parse(md);
});

// Sync wysiwyg → markdown (simple)
document.getElementById("syncWysiwygToMd").addEventListener("click", () => {
  // Convert wysiwyg innerHTML back to markdown (very simple, fallback)
  // Here we just copy text content to markdown for simplicity
  const html = wysiwygEditor.innerHTML;
  // If you want a better HTML->Markdown conversion you can add a library
  const tempEl = document.createElement("div");
  tempEl.innerHTML = html;
  markdownEditor.value = tempEl.textContent || tempEl.innerText || "";
  updateOutputs();
});

// Update outputs live when markdown changes
markdownEditor.addEventListener("input", () => {
  updateOutputs();
});

// Download markdown file
document.getElementById("downloadMd").addEventListener("click", () => {
  const id = idInput.value.trim();
  if (!id) return alert("Enter an article ID before downloading.");
  const md = markdownEditor.value;
  const blob = new Blob([md], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = id + ".md";
  a.click();
  URL.revokeObjectURL(a.href);
});

// Copy markdown button with fallback for iOS
document.getElementById("copyMd").addEventListener("click", () => {
  const md = markdownEditor.value;
  copyText(md);
});

// Download articles.json
document.getElementById("downloadJson").addEventListener("click", () => {
  const newArticle = buildArticleJson();
  if (!newArticle.id) return alert("Enter an article ID before downloading JSON.");
  const updated = allArticles.filter(a => a.id !== newArticle.id);
  updated.push(newArticle);
  const blob = new Blob([JSON.stringify(updated, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "articles.json";
  a.click();
  URL.revokeObjectURL(a.href);
});

// Copy buttons in output boxes
document.querySelectorAll(".output-copy").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    const text = document.getElementById(targetId).textContent;
    copyText(text);
  });
});

// Copy text helper (with fallback)
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    }, fallbackCopy);
  } else {
    fallbackCopy();
  }

  function fallbackCopy() {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      if (document.execCommand("copy")) {
        alert("Copied to clipboard!");
      } else {
        alert("Copy failed");
      }
    } catch {
      alert("Copy failed");
    }

    document.body.removeChild(textarea);
  }
}

loadArticles();