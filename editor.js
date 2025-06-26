// Load header.html
fetch("header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;
  });

// Tabs logic
const tabs = document.querySelectorAll(".tab-btn");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    contents.forEach(c => c.classList.remove("active"));

    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
  });
});

// Initialize Quill editor
const quill = new Quill('#quillEditor', {
  theme: 'snow',
  placeholder: 'Write article content here...',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered'}, { list: 'bullet' }],
      [{ script: 'sub'}, { script: 'super' }],
      [{ indent: '-1'}, { indent: '+1' }],
      [{ direction: 'rtl' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ['clean'],
      ['link', 'image', 'video']
    ]
  }
});

// Markdown editor element
const markdownEditor = document.getElementById("markdownEditor");

// Sync markdown -> Quill (parse markdown to html)
markdownEditor.addEventListener("input", () => {
  const md = markdownEditor.value;
  const html = marked.parse(md);
  quill.root.innerHTML = html;
});

// Sync Quill -> markdown (using Turndown.js if available)
quill.on('text-change', () => {
  const html = quill.root.innerHTML;
  if(window.turndownService) {
    const md = window.turndownService.turndown(html);
    markdownEditor.value = md;
  } else {
    // fallback: show HTML inside markdown editor (not ideal)
    markdownEditor.value = html;
  }
});

// Build article JSON object from form fields
function buildArticleJson() {
  return {
    id: document.getElementById("id").value.trim(),
    title: document.getElementById("title").value.trim(),
    summary: document.getElementById("summary").value.trim(),
    image: document.getElementById("image").value.trim(),
    categories: document.getElementById("categories").value.split(",").map(c => c.trim()).filter(Boolean)
  };
}

// Articles loaded from articles.json
let allArticles = [];
fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    allArticles = data;
    updateArticleListUI();
    populateLoaderDropdown();
  }).catch(e => {
    console.error("Failed loading articles.json:", e);
  });

function populateLoaderDropdown() {
  const loader = document.getElementById("articleLoader");
  loader.innerHTML = '<option value="">➕ New Article</option>';
  allArticles.forEach(article => {
    const option = document.createElement("option");
    option.value = article.id;
    option.textContent = article.title;
    loader.appendChild(option);
  });
}

document.getElementById("articleLoader").addEventListener("change", e => {
  const id = e.target.value;
  if (!id) {
    clearForm();
    return;
  }
  const article = allArticles.find(a => a.id === id);
  if (!article) return;

  document.getElementById("id").value = article.id;
  document.getElementById("title").value = article.title;
  document.getElementById("summary").value = article.summary;
  document.getElementById("image").value = article.image;
  document.getElementById("categories").value = article.categories.join(", ");

  fetch(`articles/${article.id}.md`)
    .then(res => res.text())
    .then(md => {
      markdownEditor.value = md;
      const html = marked.parse(md);
      quill.root.innerHTML = html;
    }).catch(err => {
      console.warn("Markdown file missing, clearing editor", err);
      markdownEditor.value = "";
      quill.root.innerHTML = "";
    });
});

function clearForm() {
  ["id", "title", "summary", "image", "categories"].forEach(id => {
    document.getElementById(id).value = "";
  });
  markdownEditor.value = "";
  quill.root.innerHTML = "";
  document.getElementById("articleLoader").value = "";
}

// Show articles.json live in export tab
function updateArticleListUI() {
  document.getElementById("articleListDisplay").textContent = JSON.stringify(allArticles, null, 2);
}

// Export buttons
document.getElementById("downloadMd").addEventListener("click", () => {
  const id = document.getElementById("id").value.trim() || "untitled";
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
  }).catch(() => {
    alert("Copy failed. Please copy manually.");
  });
});

document.getElementById("copyJson").addEventListener("click", () => {
  const newArticle = buildArticleJson();
  const updated = [...allArticles.filter(a => a.id !== newArticle.id), newArticle];
  navigator.clipboard.writeText(JSON.stringify(updated, null, 2)).then(() => {
    alert("JSON copied!");
  }).catch(() => {
    alert("Copy failed. Please copy manually.");
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

// Image list - demo images, replace with server or dynamic load as needed
const demoImages = [
  "images/IMG_1289.png",
  "images/IMG_1291.png",
  "images/IMG_1301.png",
  "images/IMG_1328.png",
  "images/IMG_1334.png",
  "images/IMG_1330.png"
];

const imagesList = document.getElementById("imagesList");

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}
function fallbackCopy(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    alert("Copied to clipboard");
  } catch (err) {
    alert("Copy failed");
  }
  document.body.removeChild(textArea);
}

function insertAtCursor(myField, myValue) {
  if (document.selection) {
    myField.focus();
    const sel = document.selection.createRange();
    sel.text = myValue;
  } else if (myField.selectionStart || myField.selectionStart === 0) {
    const startPos = myField.selectionStart;
    const endPos = myField.selectionEnd;
    const before = myField.value.substring(0, startPos);
    const after = myField.value.substring(endPos, myField.value.length);
    myField.value = before + myValue + after;
    myField.selectionStart = myField.selectionEnd = startPos + myValue.length;
    myField.focus();
  } else {
    myField.value += myValue;
    myField.focus();
  }
}

function insertImageToMarkdown(path) {
  const mdEditor = document.getElementById("markdownEditor");
  insertAtCursor(mdEditor, `![Image](${path})`);
}

function insertImageToArticleImageField(path) {
  document.getElementById("image").value = path;
}

// Render image list with buttons
demoImages.forEach(src => {
  const div = document.createElement("div");
  div.className = "image-item";

  const img = document.createElement("img");
  img.src = src;
  img.alt = src;
  img.title = "Click image to copy path";

  img.onclick = () => {
    copyToClipboard(src);
    alert(`Image path copied:\n${src}`);
  };

  const pathDisplay = document.createElement("div");
  pathDisplay.textContent = src;

  const btnInsertMarkdown = document.createElement("button");
  btnInsertMarkdown.textContent = "Insert Markdown";
  btnInsertMarkdown.onclick = () => {
    insertImageToMarkdown(src);
    alert("Image markdown inserted");
  };

  const btnInsertArticleImage = document.createElement("button");
  btnInsertArticleImage.textContent = "Set as Article Image";
  btnInsertArticleImage.onclick = () => {
    insertImageToArticleImageField(src);
    alert("Image set as article main image");
  };

  div.appendChild(img);
  div.appendChild(pathDisplay);
  div.appendChild(btnInsertMarkdown);
  div.appendChild(btnInsertArticleImage);
  imagesList.appendChild(div);
});