// Load header
fetch("header.html")
  .then((res) => res.text())
  .then((html) => {
    document.getElementById("header-placeholder").innerHTML = html;
  });

// Tabs switching
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

// Initialize Quill editor
const quill = new Quill("#quillEditor", {
  theme: "snow",
  modules: {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  },
});

const wysiwygEditor = quill;
const markdownEditor = document.getElementById("markdownEditor");

// Sync Quill content to Markdown textarea (convert delta to markdown)
quill.on("text-change", () => {
  const html = quill.root.innerHTML;
  markdownEditor.value = turndownService.turndown(html);
});

// Sync Markdown textarea to Quill (parse markdown to HTML)
markdownEditor.addEventListener("input", () => {
  const md = markdownEditor.value;
  const html = marked.parse(md);
  quill.root.innerHTML = html;
});

// Build article JSON data from form fields
function buildArticleJson() {
  return {
    id: document.getElementById("id").value.trim(),
    title: document.getElementById("title").value.trim(),
    summary: document.getElementById("summary").value.trim(),
    image: document.getElementById("image").value.trim(),
    categories: document
      .getElementById("categories")
      .value.split(",")
      .map((c) => c.trim())
      .filter(Boolean),
  };
}

// Load articles.json
let allArticles = [];
fetch("articles.json")
  .then((res) => res.json())
  .then((data) => {
    allArticles = data;
    updateArticleListUI();
    populateLoaderDropdown();
  });

function populateLoaderDropdown() {
  const loader = document.getElementById("articleLoader");
  allArticles.forEach((article) => {
    const option = document.createElement("option");
    option.value = article.id;
    option.textContent = article.title;
    loader.appendChild(option);
  });
}

document.getElementById("articleLoader").addEventListener("change", (e) => {
  const id = e.target.value;
  if (!id) {
    clearForm();
    return;
  }
  const article = allArticles.find((a) => a.id === id);
  if (article) {
    document.getElementById("id").value = article.id;
    document.getElementById("title").value = article.title;
    document.getElementById("summary").value = article.summary;
    document.getElementById("image").value = article.image;
    document.getElementById("categories").value = article.categories.join(", ");
    fetch(`articles/${article.id}.md`)
      .then((res) => res.text())
      .then((md) => {
        markdownEditor.value = md;
        const html = marked.parse(md);
        quill.root.innerHTML = html;
      });
  }
});

function clearForm() {
  ["id", "title", "summary", "image", "categories"].forEach((id) => {
    document.getElementById(id).value = "";
  });
  markdownEditor.value = "";
  quill.root.innerHTML = "";
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
    alert("Please enter an Article ID");
    return;
  }
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