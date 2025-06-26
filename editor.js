// Load header
fetch("header.html")
  .then((res) => res.text())
  .then((html) => {
    document.getElementById("header-placeholder").innerHTML = html;
  });

// Tab switching logic
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Tabs
    document.querySelectorAll(".tab-btn").forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");

    // Tab content
    const tabId = "tab-" + btn.dataset.tab;
    document.querySelectorAll(".tab-content").forEach((tab) => {
      tab.classList.remove("active");
      tab.setAttribute("hidden", "true");
    });
    const activeTab = document.getElementById(tabId);
    activeTab.classList.add("active");
    activeTab.removeAttribute("hidden");
    activeTab.focus();
  });
});

const wysiwygEditor = document.getElementById("wysiwygEditor");
const wysiwygToolbar = document.getElementById("wysiwygToolbar");
const markdown = document.getElementById("markdownEditor");

function buildArticleJson() {
  return {
    id: document.getElementById("id").value.trim(),
    title: document.getElementById("title").value.trim(),
    summary: document.getElementById("summary").value.trim(),
    image: document.getElementById("image").value.trim(),
    categories: document.getElementById("categories").value
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean),
  };
}

// Articles data
let allArticles = [];
// Images data (hardcoded or fetch from server)
const images = [
  "images/IMG_1289.png",
  "images/IMG_1291.png",
  "images/IMG_1301.png",
  "images/IMG_1328.png",
  "images/IMG_1334.png",
  "images/IMG_1330.png",
];

function updateArticleListUI() {
  const json = JSON.stringify(allArticles, null, 2);
  document.getElementById("articleListDisplay").textContent = json;
}

function populateLoaderDropdown() {
  const loader = document.getElementById("articleLoader");
  // Clear all except new article option
  loader.querySelectorAll("option:not(:first-child)").forEach((opt) => opt.remove());

  allArticles.forEach((article) => {
    const option = document.createElement("option");
    option.value = article.id;
    option.textContent = article.title;
    loader.appendChild(option);
  });
}

// Load articles.json
fetch("articles.json")
  .then((res) => res.json())
  .then((data) => {
    allArticles = data;
    updateArticleListUI();
    populateLoaderDropdown();
    loadImages();
  })
  .catch(() => {
    allArticles = [];
    updateArticleListUI();
    populateLoaderDropdown();
    loadImages();
  });

// Load images tab content
function loadImages() {
  const container = document.getElementById("imageList");
  container.innerHTML = "";

  images.forEach((img) => {
    const pathElem = document.createElement("div");
    pathElem.className = "image-path";
    pathElem.textContent = img;
    pathElem.title = "Click to copy image path";
    pathElem.style.cursor = "pointer";

    pathElem.addEventListener("click", () => {
      navigator.clipboard
        .writeText(img)
        .then(() => {
          alert(`Copied to clipboard: ${img}`);
        })
        .catch(() => {
          alert("Failed to copy to clipboard");
        });
    });

    container.appendChild(pathElem);
  });
}

// Load article into form and editors
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
        markdown.value = md;
        syncEditorsFromMarkdown();
      })
      .catch(() => {
        markdown.value = "";
        wysiwygEditor.innerHTML = "";
      });
  }
});

function clearForm() {
  ["id", "title", "summary", "image", "categories"].forEach((id) => {
    document.getElementById(id).value = "";
  });
  markdown.value = "";
  wysiwygEditor.innerHTML = "";
}

// WYSIWYG toolbar buttons
wysiwygToolbar.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    const cmd = button.dataset.cmd;
    document.execCommand(cmd, false, null);
    wysiwygEditor.focus();
    syncEditorsFromWysiwyg();
  });
});

// Sync WYSIWYG -> Markdown
function syncEditorsFromWysiwyg() {
  let html = wysiwygEditor.innerHTML;

  // Basic replacements for bold and italic
  html = html
    .replace(/<(\/)?(b|strong)>/gi, "**")
    .replace(/<(\/)?(i|em)>/gi, "*")
    .replace(/<\/?[^>]+(>|$)/g, "");

  markdown.value = html.trim();
}

// Sync Markdown -> WYSIWYG
function syncEditorsFromMarkdown() {
  let md = markdown.value;

  md = md
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");

  wysiwygEditor.innerHTML = md;
}

wysiwygEditor.addEventListener("input", syncEditorsFromWysiwyg);
markdown.addEventListener("input", syncEditorsFromMarkdown);

// Export buttons
document.getElementById("downloadMd").addEventListener("click", () => {
  const id = document.getElementById("id").value.trim();
  if (!id) {
    alert("Please enter an Article ID.");
    return;
  }
  const md = markdown.value;
  const blob = new Blob([md], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = id + ".md";
  link.click();
});

document.getElementById("copyMd").addEventListener("click", () => {
  const md = markdown.value;
  navigator.clipboard
    .writeText(md)
    .then(() => alert("Markdown copied!"))
    .catch(() => alert("Failed to copy markdown."));
});

document.getElementById("copyJson").addEventListener("click", () => {
  const newArticle = buildArticleJson();
  if (!newArticle.id) {
    alert("Please enter an Article ID.");
    return;
  }
  const updated = [...allArticles.filter((a) => a.id !== newArticle.id), newArticle];
  navigator.clipboard
    .writeText(JSON.stringify(updated, null, 2))
    .then(() => alert("JSON copied!"))
    .catch(() => alert("Failed to copy JSON."));
});

document.getElementById("downloadJson").addEventListener("click", () => {
  const newArticle = buildArticleJson();
  if (!newArticle.id) {
    alert("Please enter an Article ID.");
    return;
  }
  const updated = [...allArticles.filter((a) => a.id !== newArticle.id), newArticle];
  const blob = new Blob([JSON.stringify(updated, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "articles.json";
  link.click();
});