// editor.js

// Load header.html into header placeholder
fetch("header.html")
  .then((res) => res.text())
  .then((html) => {
    document.getElementById("header-placeholder").innerHTML = html;
  });

// Tabs logic
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const tabId = "tab-" + btn.dataset.tab;
    document.querySelectorAll(".tab-content").forEach((tab) => {
      tab.classList.remove("active");
    });
    document.getElementById(tabId).classList.add("active");
  });
});

// Initialize QuillJS editor
const quill = new Quill("#quillEditor", {
  theme: "snow",
  placeholder: "Compose your article here...",
  modules: {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["link", "image", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ header: [1, 2, 3, false] }],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  },
});

const markdownEditor = document.getElementById("markdownEditor");
const categoriesSelect = document.getElementById("categories");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const newCategoryInput = document.getElementById("newCategory");
const articleLoader = document.getElementById("articleLoader");

let allArticles = [];

// Sync Quill HTML → Markdown textarea (simple)
function quillToMarkdown() {
  const html = quill.root.innerHTML;
  // Use a simple converter: Quill HTML to Markdown with turndown
  if (window.TurndownService) {
    const turndownService = new TurndownService();
    markdownEditor.value = turndownService.turndown(html);
  } else {
    markdownEditor.value = html;
  }
}

// Sync Markdown textarea → Quill editor
function markdownToQuill() {
  const md = markdownEditor.value;
  // Use marked.js to convert md → html
  if (window.marked) {
    quill.root.innerHTML = marked.parse(md);
  } else {
    quill.root.innerHTML = md;
  }
}

// Build JSON from form
function buildArticleJson() {
  return {
    id: document.getElementById("id").value.trim(),
    title: document.getElementById("title").value.trim(),
    summary: document.getElementById("summary").value.trim(),
    image: document.getElementById("image").value.trim(),
    categories: Array.from(categoriesSelect.selectedOptions).map((opt) => opt.value),
  };
}

// Clear form inputs
function clearForm() {
  ["id", "title", "summary", "image"].forEach((id) => {
    document.getElementById(id).value = "";
  });
  // Clear categories selection
  for (const option of categoriesSelect.options) {
    option.selected = false;
  }
  markdownEditor.value = "";
  quill.root.innerHTML = "";
  newCategoryInput.value = "";
  articleLoader.value = "";
}

// Populate categories multi-select dropdown from articles
function populateCategoriesSelect() {
  const categorySet = new Set();
  allArticles.forEach((article) => {
    article.categories.forEach((cat) => categorySet.add(cat));
  });

  categoriesSelect.innerHTML = "";
  [...categorySet].sort().forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoriesSelect.appendChild(option);
  });
}

// Populate article dropdown
function populateLoaderDropdown() {
  articleLoader.innerHTML = `<option value="">➕ New Article</option>`;
  allArticles.forEach((article) => {
    const option = document.createElement("option");
    option.value = article.id;
    option.textContent = article.title;
    articleLoader.appendChild(option);
  });
}

// Set selected categories when loading an article
function setSelectedCategories(categories) {
  for (const option of categoriesSelect.options) {
    option.selected = categories.includes(option.value);
  }
}

// Load articles.json and initialize editor dropdowns etc
fetch("articles.json")
  .then((res) => res.json())
  .then((data) => {
    allArticles = data;
    populateLoaderDropdown();
    populateCategoriesSelect();
    updateArticleListUI();
  });

// Load selected article data into form and editors
articleLoader.addEventListener("change", (e) => {
  const id = e.target.value;
  if (!id) {
    clearForm();
    return;
  }
  const article = allArticles.find((a) => a.id === id);
  if (!article) return;

  document.getElementById("id").value = article.id;
  document.getElementById("title").value = article.title;
  document.getElementById("summary").value = article.summary;
  document.getElementById("image").value = article.image;
  setSelectedCategories(article.categories);

  fetch(`articles/${article.id}.md`)
    .then((res) => res.text())
    .then((md) => {
      markdownEditor.value = md;
      markdownToQuill();
    });
});

// Add new category button
addCategoryBtn.addEventListener("click", () => {
  const newCat = newCategoryInput.value.trim();
  if (!newCat) return;

  // Avoid duplicates
  for (const opt of categoriesSelect.options) {
    if (opt.value.toLowerCase() === newCat.toLowerCase()) {
      alert("Category already exists");
      newCategoryInput.value = "";
      return;
    }
  }

  const option = document.createElement("option");
  option.value = newCat;
  option.textContent = newCat;
  option.selected = true;
  categoriesSelect.appendChild(option);
  newCategoryInput.value = "";
});

// Sync editors on change

// When Quill changes, update Markdown textarea
quill.on("text-change", () => {
  quillToMarkdown();
});

// When Markdown textarea changes, update Quill
markdownEditor.addEventListener("input", () => {
  markdownToQuill();
});

// Export buttons
document.getElementById("downloadMd").addEventListener("click", () => {
  const id = document.getElementById("id").value.trim() || "article";
  const md = markdownEditor.value;
  const blob = new Blob([md], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = id + ".md";
  link.click();
});

document.getElementById("copyMd").addEventListener("click", () => {
  const md = markdownEditor.value;
  navigator.clipboard.writeText(md).then(() => {
    alert("Markdown copied!");
  });
});

document.getElementById("copyJson").addEventListener("click", () => {
  const newArticle = buildArticleJson();
  const updated = [...allArticles.filter((a) => a.id !== newArticle.id), newArticle];
  navigator.clipboard.writeText(JSON.stringify(updated, null, 2)).then(() => {
    alert("JSON copied!");
  });
});

document.getElementById("downloadJson").addEventListener("click", () => {
  const newArticle = buildArticleJson();
  const updated = [...allArticles.filter((a) => a.id !== newArticle.id), newArticle];
  const blob = new Blob([JSON.stringify(updated, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "articles.json";
  link.click();
});

// Show current JSON in export tab
function updateArticleListUI() {
  const pre = document.getElementById("articleListDisplay");
  pre.textContent = JSON.stringify(allArticles, null, 2);
}