let allArticles = [];
let allCategories = new Set();

async function loadArticles() {
  try {
    const res = await fetch("articles.json");
    const data = await res.json();
    allArticles = data;
    allCategories.clear();

    data.forEach(article => {
      article.categories.forEach(cat => allCategories.add(cat));
    });

    populateCategories();
    populateArticleSelect();
    displayArticleList();
  } catch (e) {
    console.error("Error loading articles:", e);
  }
}

function populateCategories() {
  const container = document.getElementById("categorySelect");
  if (!container) return;
  container.innerHTML = "";

  allCategories.forEach(cat => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = cat;
    checkbox.name = "categories";
    label.appendChild(checkbox);
    label.append(" " + cat);
    container.appendChild(label);
  });

  // Add new category entry
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Add new category";
  input.id = "newCategoryInput";

  input.addEventListener("change", () => {
    const val = input.value.trim();
    if (val && !allCategories.has(val)) {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      checkbox.value = val;
      checkbox.name = "categories";
      label.appendChild(checkbox);
      label.append(" " + val);
      container.insertBefore(label, input);
      allCategories.add(val);
      input.value = "";
    }
  });

  container.appendChild(input);
}

function populateArticleSelect() {
  const select = document.getElementById("articleSelect");
  select.innerHTML = '<option value="">➕ New Article</option>';

  allArticles.forEach(article => {
    const opt = document.createElement("option");
    opt.value = article.id;
    opt.textContent = article.title;
    select.appendChild(opt);
  });
}

document.getElementById("articleSelect").addEventListener("change", async (e) => {
  const selectedId = e.target.value;
  if (!selectedId) {
    clearForm();
    return;
  }

  const article = allArticles.find(a => a.id === selectedId);
  if (!article) return;

  // Populate fields
  document.getElementById("articleId").value = article.id;
  document.getElementById("title").value = article.title;
  document.getElementById("summary").value = article.summary;
  document.getElementById("image").value = article.image;

  // Set category checkboxes
  document.querySelectorAll('#categorySelect input[type="checkbox"]').forEach(cb => {
    cb.checked = article.categories.includes(cb.value);
  });

  // Load markdown
  try {
    const md = await fetch(`articles/${article.id}.md`).then(r => r.text());
    document.getElementById("markdown").value = md;
    if (window.quillEditor) window.quillEditor.setContents(window.quillEditor.clipboard.convert(md));
  } catch (err) {
    document.getElementById("markdown").value = "";
  }

  updateJsonOutput();
  updateMarkdownOutput();
});

function clearForm() {
  ["articleId", "title", "summary", "image", "markdown"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  document.querySelectorAll('#categorySelect input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });

  if (window.quillEditor) window.quillEditor.setContents([]);
  updateJsonOutput();
  updateMarkdownOutput();
}

function getSelectedCategories() {
  return Array.from(document.querySelectorAll('#categorySelect input[type="checkbox"]:checked')).map(cb => cb.value);
}

function buildArticleJson() {
  return {
    id: document.getElementById("articleId").value.trim(),
    title: document.getElementById("title").value.trim(),
    summary: document.getElementById("summary").value.trim(),
    image: document.getElementById("image").value.trim(),
    categories: getSelectedCategories()
  };
}

function updateJsonOutput() {
  const article = buildArticleJson();
  const updated = [...allArticles.filter(a => a.id !== article.id), article];
  document.getElementById("jsonOutput").textContent = JSON.stringify(updated, null, 2);
}

function updateMarkdownOutput() {
  const markdown = document.getElementById("markdown").value;
  document.getElementById("markdownOutput").textContent = markdown;
}

document.getElementById("markdown").addEventListener("input", updateMarkdownOutput);

document.getElementById("copyJson").addEventListener("click", () => {
  navigator.clipboard.writeText(document.getElementById("jsonOutput").textContent)
    .then(() => alert("JSON copied!"));
});

document.getElementById("copyMarkdown").addEventListener("click", () => {
  navigator.clipboard.writeText(document.getElementById("markdown").value)
    .then(() => alert("Markdown copied!"));
});

window.addEventListener("load", () => {
  if (window.Quill) {
    window.quillEditor = new Quill("#wysiwyg", {
      theme: "snow"
    });

    window.quillEditor.on("text-change", () => {
      document.getElementById("markdown").value = window.quillEditor.root.innerHTML;
      updateMarkdownOutput();
    });
  }

  loadArticles();
});