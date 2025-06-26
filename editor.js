// Load header
fetch("header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;
    if (typeof initHeaderScripts === "function") initHeaderScripts();
  });

const articleSelect = document.getElementById("articleSelect");
const jsonOutput = document.getElementById("jsonOutput");
const markdownOutput = document.getElementById("markdownOutput");
const checkboxesContainer = document.getElementById("categoryCheckboxes");
let allArticles = [];

const quill = new Quill('#editor', {
  theme: 'snow'
});

document.getElementById("toggleCategories").onclick = () => {
  checkboxesContainer.style.display =
    checkboxesContainer.style.display === "block" ? "none" : "block";
};

function populateCategories(data) {
  const cats = new Set();
  data.forEach(a => a.categories.forEach(c => cats.add(c)));

  checkboxesContainer.innerHTML = "";
  [...cats].sort().forEach(cat => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${cat}"> ${cat}`;
    checkboxesContainer.appendChild(label);
  });
}

function getSelectedCategories() {
  return Array.from(checkboxesContainer.querySelectorAll("input:checked")).map(
    c => c.value
  );
}

function fillArticleFields(article, markdown = "") {
  document.getElementById("id").value = article.id;
  document.getElementById("title").value = article.title;
  document.getElementById("summary").value = article.summary;
  document.getElementById("image").value = article.image;

  // Categories
  checkboxesContainer.querySelectorAll("input").forEach(cb => {
    cb.checked = article.categories.includes(cb.value);
  });

  quill.setText(markdown);
  updateOutputs();
}

function updateOutputs() {
  const md = quill.getText();
  const obj = {
    id: document.getElementById("id").value.trim(),
    title: document.getElementById("title").value.trim(),
    summary: document.getElementById("summary").value.trim(),
    image: document.getElementById("image").value.trim(),
    categories: getSelectedCategories()
  };

  markdownOutput.textContent = md;
  const updated = [
    ...allArticles.filter((a) => a.id !== obj.id),
    obj
  ];
  jsonOutput.textContent = JSON.stringify(updated, null, 2);
}

fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    allArticles = data;
    populateCategories(data);
    data.forEach(article => {
      const opt = document.createElement("option");
      opt.value = article.id;
      opt.textContent = article.title;
      articleSelect.appendChild(opt);
    });
  });

articleSelect.addEventListener("change", (e) => {
  const id = e.target.value;
  const article = allArticles.find((a) => a.id === id);
  if (!article) return;

  fetch(`articles/${id}.md`)
    .then((res) => res.text())
    .then((md) => {
      fillArticleFields(article, md);
    });
});

["id", "title", "summary", "image"].forEach(id => {
  document.getElementById(id).addEventListener("input", updateOutputs);
});
checkboxesContainer.addEventListener("change", updateOutputs);
quill.on('text-change', updateOutputs);

document.getElementById("downloadMd").addEventListener("click", () => {
  const blob = new Blob([quill.getText()], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = document.getElementById("id").value + ".md";
  a.click();
});

document.getElementById("copyJson").addEventListener("click", () => {
  navigator.clipboard.writeText(jsonOutput.textContent).then(() => {
    alert("✅ JSON copied to clipboard!");
  });
});

document.getElementById("downloadJson").addEventListener("click", () => {
  const blob = new Blob([jsonOutput.textContent], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "articles.json";
  a.click();
});