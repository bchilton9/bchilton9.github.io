let quill;
let allArticles = [];

document.addEventListener("DOMContentLoaded", () => {
  // Load header
  fetch("header.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("header-placeholder").innerHTML = html;
    });

  quill = new Quill("#quillEditor", { theme: "snow" });

  fetch("articles.json")
    .then(res => res.json())
    .then(data => {
      allArticles = data;
      populateArticleDropdown();
      populateCategories(data);
      updateOutput();
    });

  document.getElementById("articleSelect").addEventListener("change", loadArticle);
  document.getElementById("newCategoryInput").addEventListener("keydown", addNewCategory);
  document.getElementById("toggleCategoryDropdown").addEventListener("click", () => {
    document.getElementById("categoryOptions").classList.toggle("show");
  });

  document.querySelectorAll(".copy-button").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const text = document.getElementById(targetId).textContent;
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = "✅";
        setTimeout(() => (btn.textContent = "📋"), 1200);
      });
    });
  });

  quill.on("text-change", updateOutput);
  document.querySelectorAll("input").forEach(i => i.addEventListener("input", updateOutput));

  document.getElementById("downloadMd").addEventListener("click", () => {
    const id = document.getElementById("idInput").value.trim();
    const md = quill.getText();
    const blob = new Blob([md], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${id || "article"}.md`;
    link.click();
  });

  document.getElementById("downloadJson").addEventListener("click", () => {
    const article = buildArticleJson();
    const updated = [...allArticles.filter(a => a.id !== article.id), article];
    const blob = new Blob([JSON.stringify(updated, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "articles.json";
    link.click();
  });
});

function populateArticleDropdown() {
  const select = document.getElementById("articleSelect");
  allArticles.forEach(article => {
    const opt = document.createElement("option");
    opt.value = article.id;
    opt.textContent = article.title;
    select.appendChild(opt);
  });
}

function loadArticle() {
  const id = this.value;
  if (!id) return clearFields();

  const article = allArticles.find(a => a.id === id);
  if (article) {
    document.getElementById("idInput").value = article.id;
    document.getElementById("titleInput").value = article.title;
    document.getElementById("summaryInput").value = article.summary;
    document.getElementById("imageInput").value = article.image;
    setCategoryChecks(article.categories);

    fetch(`articles/${id}.md`)
      .then(res => res.text())
      .then(md => quill.setText(md));
  }
}

function populateCategories(data) {
  const allCats = new Set();
  data.forEach(a => a.categories.forEach(c => allCats.add(c)));
  const container = document.getElementById("categoryOptions");
  container.innerHTML = "";
  Array.from(allCats).sort().forEach(cat => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${cat}"> ${cat}`;
    container.appendChild(label);
  });
}

function setCategoryChecks(categories = []) {
  const checkboxes = document.querySelectorAll("#categoryOptions input[type='checkbox']");
  checkboxes.forEach(cb => {
    cb.checked = categories.includes(cb.value);
  });
}

function addNewCategory(e) {
  if (e.key === "Enter" && e.target.value.trim()) {
    const val = e.target.value.trim();
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${val}" checked> ${val}`;
    document.getElementById("categoryOptions").appendChild(label);
    e.target.value = "";
    updateOutput();
  }
}

function buildArticleJson() {
  const id = document.getElementById("idInput").value.trim();
  const title = document.getElementById("titleInput").value.trim();
  const summary = document.getElementById("summaryInput").value.trim();
  const image = document.getElementById("imageInput").value.trim();
  const categories = Array.from(document.querySelectorAll("#categoryOptions input:checked")).map(cb => cb.value);
  return { id, title, summary, image, categories };
}

function updateOutput() {
  const markdown = quill.getText().trim();
  const json = JSON.stringify(buildArticleJson(), null, 2);
  document.getElementById("markdownPreview").textContent = markdown;
  document.getElementById("jsonPreview").textContent = json;
}

function clearFields() {
  ["idInput", "titleInput", "summaryInput", "imageInput"].forEach(id => {
    document.getElementById(id).value = "";
  });
  quill.setText("");
  document.querySelectorAll("#categoryOptions input[type='checkbox']").forEach(cb => cb.checked = false);
}