// editor.js

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
    btn.classList.add("active");

    const tabId = "tab-" + btn.dataset.tab;
    document.querySelectorAll(".tab-content").forEach(tab => {
      tab.classList.remove("active");
    });
    document.getElementById(tabId).classList.add("active");
  });
});

const articleLoader = document.getElementById("articleLoader");
const categoriesSelect = document.getElementById("categories");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const newCategoryInput = document.getElementById("newCategoryInput");
const markdownEditor = document.getElementById("markdownEditor");

let allArticles = [];

// Initialize Quill editor
const quill = new Quill('#quillEditor', {
  theme: 'snow',
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered'}, { list: 'bullet' }],
      ['link', 'image', 'code-block'],
      ['clean']
    ]
  }
});

// Convert HTML from quill to markdown (basic)
function htmlToMarkdown(html) {
  // Simple approach for demo (for better, use a library)
  let md = html
    .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<u>(.*?)<\/u>/gi, '__$1__')
    .replace(/<strike>(.*?)<\/strike>/gi, '~~$1~~')
    .replace(/<ul>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<a href="(.*?)".*?>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, ""); // strip remaining tags
  return md.trim();
}

// Convert markdown to HTML (using marked)
function markdownToHtml(md) {
  if (window.marked) {
    return marked.parse(md);
  }
  return md;
}

// Sync quill content with markdown textarea
quill.on('text-change', () => {
  const html = quill.root.innerHTML;
  const md = htmlToMarkdown(html);
  if (markdownEditor.value !== md) {
    markdownEditor.value = md;
  }
});

// Sync markdown textarea with quill editor
markdownEditor.addEventListener("input", () => {
  const md = markdownEditor.value;
  const html = markdownToHtml(md);
  if (quill.root.innerHTML !== html) {
    quill.root.innerHTML = html;
  }
});

// Populate article loader dropdown
function populateLoaderDropdown() {
  articleLoader.innerHTML = '<option value="">➕ New Article</option>';
  allArticles.forEach(article => {
    const option = document.createElement("option");
    option.value = article.id;
    option.textContent = article.title;
    articleLoader.appendChild(option);
  });
}

// Populate categories multi-select
function populateCategoriesSelect() {
  const categorySet = new Set();
  allArticles.forEach(article => {
    article.categories.forEach(cat => categorySet.add(cat));
  });

  categoriesSelect.innerHTML = "";
  [...categorySet].sort().forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoriesSelect.appendChild(option);
  });
}

// Load articles.json & init UI
fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    allArticles = data;
    populateLoaderDropdown();
    populateCategoriesSelect();
    updateArticleListUI();
  });

// When article selected, load data
articleLoader.addEventListener("change", e => {
  const id = e.target.value;
  if (!id) {
    clearForm();
    return;
  }

  const article = allArticles.find(a => a.id === id);
  if (article) {
    document.getElementById("id").value = article.id;
    document.getElementById("title").value = article.title;
    document.getElementById("summary").value = article.summary;
    document.getElementById("image").value = article.image;

    // Select categories
    for (const option of categoriesSelect.options) option.selected = false;
    article.categories.forEach(cat => {
      const opt = Array.from(categoriesSelect.options).find(o => o.value === cat);
      if (opt) opt.selected = true;
    });

    // Load markdown file
    fetch(`articles/${article.id}.md`)
      .then(res => res.text())
      .then(md => {
        markdownEditor.value = md;
        quill.root.innerHTML = markdownToHtml(md);
      });
  }
});

function clearForm() {
  ["id", "title", "summary", "image"].forEach(id => {
    document.getElementById(id).value = "";
  });
  for (const option of categoriesSelect.options) option.selected = false;
  markdownEditor.value = "";
  quill.root.innerHTML = "";
}

addCategoryBtn.addEventListener("click", () => {
  const newCat = newCategoryInput.value.trim();
  if (!newCat) return;

  // Check if category exists
  if (![...categoriesSelect.options].some(o => o.value.toLowerCase() === newCat.toLowerCase())) {
    const option = document.createElement("option");
    option.value = newCat;
    option.textContent = newCat;
    option.selected = true;
    categoriesSelect.appendChild(option);
  } else {
    const existing = [...categoriesSelect.options].find(o => o.value.toLowerCase() === newCat.toLowerCase());
    if (existing) existing.selected = true;
  }

  newCategoryInput.value = "";
});

function buildArticleJson() {
  const selectedCategories = [...categoriesSelect.selectedOptions].map(o => o.value);
  return {
    id: document.getElementById("id").value.trim(),
    title: document.getElementById("title").value.trim(),
    summary: document.getElementById("summary").value.trim(),
    image: document.getElementById("image").value.trim(),
    categories: selectedCategories
  };
}

function updateArticleListUI() {
  const json = JSON.stringify(allArticles, null, 2);
  document.getElementById("articleListDisplay").textContent = json;
}

// Export buttons
document.getElementById("downloadMd").addEventListener("click", () => {
  const id = document.getElementById("id").value.trim();
  const md = markdownEditor.value;
  if (!id) {
    alert("Please enter an article ID.");
    return;
  }
  const blob = new Blob([md], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = id + ".md";
  link.click();
});

document.getElementById("copyMd").addEventListener("click", () => {
  navigator.clipboard.writeText(markdownEditor.value).then(() => {
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