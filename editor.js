import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

let allArticles = [];
const articleSelect = document.getElementById("articleSelect");
const markdownEditor = document.getElementById("markdownEditor");
const jsonOutput = document.getElementById("jsonOutput");
const markdownOutput = document.getElementById("markdownOutput");

const quill = new Quill("#quillEditor", { theme: "snow" });

fetch("header.html").then((res) => res.text()).then((html) => {
  document.getElementById("header-placeholder").innerHTML = html;
});

fetch("articles.json").then((res) => res.json()).then((data) => {
  allArticles = data;
  data.forEach(article => {
    const opt = document.createElement("option");
    opt.value = article.id;
    opt.textContent = article.title;
    articleSelect.appendChild(opt);
  });

  loadCategoryCheckboxes(data);
});

function loadCategoryCheckboxes(data) {
  const set = new Set();
  data.forEach(a => a.categories.forEach(c => set.add(c)));

  const container = document.getElementById("categoryList");
  container.innerHTML = "";
  [...set].sort().forEach(cat => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${cat}"> ${cat}`;
    container.appendChild(label);
  });
}

articleSelect.addEventListener("change", () => {
  const id = articleSelect.value;
  if (!id) return clearForm();

  const a = allArticles.find(a => a.id === id);
  document.getElementById("id").value = a.id;
  document.getElementById("title").value = a.title;
  document.getElementById("summary").value = a.summary;
  document.getElementById("image").value = a.image;

  document.querySelectorAll("#categoryList input").forEach(cb => {
    cb.checked = a.categories.includes(cb.value);
  });

  fetch(`articles/${id}.md`).then(res => res.text()).then(md => {
    markdownEditor.value = md;
    quill.setText(md);
    updateOutputs();
  });
});

function clearForm() {
  ["id", "title", "summary", "image"].forEach(id => document.getElementById(id).value = "");
  markdownEditor.value = "";
  quill.setText("");
  document.querySelectorAll("#categoryList input").forEach(cb => cb.checked = false);
  updateOutputs();
}

markdownEditor.addEventListener("input", () => {
  quill.setText(markdownEditor.value);
  updateOutputs();
});

quill.on("text-change", () => {
  markdownEditor.value = quill.getText();
  updateOutputs();
});

function buildJson() {
  return {
    id: document.getElementById("id").value.trim(),
    title: document.getElementById("title").value.trim(),
    summary: document.getElementById("summary").value.trim(),
    image: document.getElementById("image").value.trim(),
    categories: [...document.querySelectorAll("#categoryList input:checked")].map(c => c.value)
  };
}

function updateOutputs() {
  jsonOutput.textContent = JSON.stringify(buildJson(), null, 2);
  markdownOutput.textContent = markdownEditor.value;
}

window.toggleCategoryDropdown = function () {
  const list = document.getElementById("categoryList");
  list.style.display = list.style.display === "block" ? "none" : "block";
};

window.handleNewCategory = function (e) {
  if (e.key === "Enter") {
    const val = e.target.value.trim();
    if (val) {
      const label = document.createElement("label");
      label.innerHTML = `<input type="checkbox" value="${val}" checked> ${val}`;
      document.getElementById("categoryList").appendChild(label);
      e.target.value = "";
    }
  }
};

document.querySelectorAll(".copy-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.copyTarget;
    const text = document.getElementById(id).innerText;
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = "✅";
      setTimeout(() => (btn.textContent = "📋"), 1500);
    });
  });
});