// Load header
fetch("header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;
  });

// Initialize Quill
const quill = new Quill("#quillEditor", {
  theme: "snow"
});

const markdownOutput = document.getElementById("markdownOutput");
const jsonOutput = document.getElementById("jsonOutput");

const idInput = document.getElementById("id");
const titleInput = document.getElementById("title");
const summaryInput = document.getElementById("summary");
const imageInput = document.getElementById("image");

let allArticles = [];
let selectedCategories = new Set();

// Load articles.json
fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    allArticles = data;
    updateDropdown();
  });

function updateDropdown() {
  const select = document.getElementById("articleSelector");
  select.innerHTML = '<option value="">➕ New Article</option>';
  allArticles.forEach(article => {
    const option = document.createElement("option");
    option.value = article.id;
    option.textContent = article.title;
    select.appendChild(option);
  });
}

document.getElementById("articleSelector").addEventListener("change", e => {
  const id = e.target.value;
  if (!id) {
    clearForm();
    return;
  }
  const article = allArticles.find(a => a.id === id);
  if (article) {
    idInput.value = article.id;
    titleInput.value = article.title;
    summaryInput.value = article.summary;
    imageInput.value = article.image;
    selectedCategories = new Set(article.categories || []);
    updateCategoryCheckboxes();
    fetch(`articles/${article.id}.md`)
      .then(res => res.text())
      .then(md => {
        quill.setText(md);
        markdownOutput.textContent = md;
        updateOutputs();
      });
  }
});

function clearForm() {
  idInput.value = "";
  titleInput.value = "";
  summaryInput.value = "";
  imageInput.value = "";
  quill.setText("");
  selectedCategories.clear();
  updateCategoryCheckboxes();
  updateOutputs();
}

// Category Dropdown
const dropdown = document.getElementById("categoryDropdown");
const dropdownToggle = document.getElementById("categoryDropdownToggle");
const optionsContainer = document.getElementById("categoryOptions");

dropdownToggle.addEventListener("click", () => {
  dropdown.classList.toggle("open");
});

document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target)) {
    dropdown.classList.remove("open");
  }
});

document.getElementById("addCategoryBtn").addEventListener("click", () => {
  const newCat = document.getElementById("newCategory").value.trim();
  if (newCat) {
    selectedCategories.add(newCat);
    updateCategoryCheckboxes();
    document.getElementById("newCategory").value = "";
  }
});

function updateCategoryCheckboxes() {
  const existing = [...new Set(allArticles.flatMap(a => a.categories || []))];
  const combined = Array.from(new Set([...existing, ...selectedCategories])).sort();
  optionsContainer.innerHTML = "";
  combined.forEach(cat => {
    const id = `cat_${cat.replace(/\s+/g, "_")}`;
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" id="${id}" value="${cat}" ${selectedCategories.has(cat) ? "checked" : ""}/> ${cat}`;
    optionsContainer.appendChild(label);
    label.querySelector("input").addEventListener("change", (e) => {
      if (e.target.checked) {
        selectedCategories.add(e.target.value);
      } else {
        selectedCategories.delete(e.target.value);
      }
      updateOutputs();
    });
  });
}

// Sync Markdown Output
quill.on("text-change", () => {
  const text = quill.getText().trim();
  markdownOutput.textContent = text;
  updateOutputs();
});

[idInput, titleInput, summaryInput, imageInput].forEach(el =>
  el.addEventListener("input", updateOutputs)
);

function updateOutputs() {
  const json = {
    id: idInput.value.trim(),
    title: titleInput.value.trim(),
    summary: summaryInput.value.trim(),
    image: imageInput.value.trim(),
    categories: Array.from(selectedCategories)
  };
  jsonOutput.textContent = JSON.stringify(json, null, 2);
}

// Export Buttons
document.getElementById("downloadMd").addEventListener("click", () => {
  const blob = new Blob([quill.getText()], { type: "text/markdown" });
  triggerDownload(blob, (idInput.value || "article") + ".md");
});
document.getElementById("downloadJson").addEventListener("click", () => {
  const json = {
    id: idInput.value.trim(),
    title: titleInput.value.trim(),
    summary: summaryInput.value.trim(),
    image: imageInput.value.trim(),
    categories: Array.from(selectedCategories)
  };
  const updated = [...allArticles.filter(a => a.id !== json.id), json];
  const blob = new Blob([JSON.stringify(updated, null, 2)], { type: "application/json" });
  triggerDownload(blob, "articles.json");
});

function triggerDownload(blob, filename) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// Copy Buttons
function setupCopy(buttonId, targetId) {
  const btn = document.getElementById(buttonId);
  const target = document.getElementById(targetId);
  btn.addEventListener("click", async () => {
    try {
      const text = target.textContent;
      await navigator.clipboard.writeText(text);
      btn.textContent = "✅ Copied!";
      setTimeout(() => {
        btn.textContent = "Copy";
      }, 2000);
    } catch {
      alert("Copy not supported. Please copy manually.");
    }
  });
}

setupCopy("copyJsonBtn", "jsonOutput");
setupCopy("copyMdBtn", "markdownOutput");