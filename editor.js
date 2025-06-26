// Load header.html into #header-placeholder
fetch("header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;
  });

const quill = new Quill('#quillEditor', {
  theme: 'snow',
  placeholder: 'Write article content here...',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'header': [1, 2, 3, false] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  }
});

let allArticles = [];
let allCategories = new Set();

const idInput = document.getElementById("idInput");
const titleInput = document.getElementById("titleInput");
const summaryInput = document.getElementById("summaryInput");
const imageInput = document.getElementById("imageInput");
const categoriesSelect = document.getElementById("categoriesSelect");
const newCategoryInput = document.getElementById("newCategoryInput");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const articleListDisplay = document.getElementById("articleListDisplay");

// Load articles.json and populate categories
async function loadArticles() {
  try {
    const res = await fetch("articles.json");
    allArticles = await res.json();

    allCategories.clear();
    allArticles.forEach(a => a.categories.forEach(c => allCategories.add(c)));

    populateCategories();
    displayArticleList();
  } catch (e) {
    console.error("Failed to load articles.json", e);
  }
}
loadArticles();

function populateCategories() {
  categoriesSelect.innerHTML = "";
  Array.from(allCategories).sort().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoriesSelect.appendChild(opt);
  });
}

addCategoryBtn.addEventListener("click", () => {
  const newCat = newCategoryInput.value.trim();
  if (newCat && !allCategories.has(newCat)) {
    allCategories.add(newCat);
    populateCategories();
    newCategoryInput.value = "";
    // Select the new category
    Array.from(categoriesSelect.options).forEach(opt => {
      opt.selected = (opt.value === newCat);
    });
  }
});

// Load article data by ID
idInput.addEventListener("change", () => {
  const id = idInput.value.trim();
  if (!id) {
    clearForm();
    return;
  }
  const article = allArticles.find(a => a.id === id);
  if (article) {
    titleInput.value = article.title;
    summaryInput.value = article.summary;
    imageInput.value = article.image || "";
    // Select categories
    Array.from(categoriesSelect.options).forEach(opt => {
      opt.selected = article.categories.includes(opt.value);
    });

    // Load markdown content from articles folder
    fetch(`articles/${id}.md`)
      .then(res => res.text())
      .then(md => {
        // Load markdown into Quill by converting markdown to HTML
        quill.setText(""); // clear first
        quill.clipboard.dangerouslyPasteHTML(marked.parse(md));
      })
      .catch(() => quill.setText(""));
  } else {
    titleInput.value = "";
    summaryInput.value = "";
    imageInput.value = "";
    Array.from(categoriesSelect.options).forEach(opt => opt.selected = false);
    quill.setText("");
  }
});

function clearForm() {
  idInput.value = "";
  titleInput.value = "";
  summaryInput.value = "";
  imageInput.value = "";
  Array.from(categoriesSelect.options).forEach(opt => opt.selected = false);
  quill.setText("");
}

function buildArticleJson() {
  return {
    id: idInput.value.trim(),
    title: titleInput.value.trim(),
    summary: summaryInput.value.trim(),
    image: imageInput.value.trim(),
    categories: Array.from(categoriesSelect.selectedOptions).map(opt => opt.value)
  };
}

// Convert Quill HTML content to Markdown (basic)
function quillToMarkdown() {
  const html = quill.root.innerHTML;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  function nodeToMarkdown(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    switch (node.tagName) {
      case 'P': return nodeToMarkdownArray(node.childNodes) + '\n\n';
      case 'STRONG': return `**${nodeToMarkdownArray(node.childNodes)}**`;
      case 'EM': return `*${nodeToMarkdownArray(node.childNodes)}*`;
      case 'U': return `<u>${nodeToMarkdownArray(node.childNodes)}</u>`;
      case 'BR': return '\n';
      case 'H1': return `# ${nodeToMarkdownArray(node.childNodes)}\n\n`;
      case 'H2': return `## ${nodeToMarkdownArray(node.childNodes)}\n\n`;
      case 'H3': return `### ${nodeToMarkdownArray(node.childNodes)}\n\n`;
      case 'UL':
        return Array.from(node.children).map(li => `- ${nodeToMarkdownArray(li.childNodes)}`).join('\n') + '\n\n';
      case 'OL':
        return Array.from(node.children).map((li, i) => `${i+1}. ${nodeToMarkdownArray(li.childNodes)}`).join('\n') + '\n\n';
      case 'A':
        return `[${nodeToMarkdownArray(node.childNodes)}](${node.getAttribute('href')})`;
      case 'IMG':
        return `![${node.getAttribute('alt')||''}](${node.getAttribute('src')})`;
      default:
        return nodeToMarkdownArray(node.childNodes);
    }
  }
  function nodeToMarkdownArray(nodes) {
    return Array.from(nodes).map(nodeToMarkdown).join('');
  }
  return nodeToMarkdown(tempDiv);
}

document.getElementById("downloadMdBtn").addEventListener("click", () => {
  const id = idInput.value.trim();
  if (!id) {
    alert("Please enter an Article ID.");
    return;
  }
  const md = quillToMarkdown();
  const blob = new Blob([md], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = id + ".md";
  link.click();
});

document.getElementById("copyMdBtn").addEventListener("click", () => {
  const md = quillToMarkdown();
  navigator.clipboard.writeText(md).then(() => alert("Markdown copied!"));
});

document.getElementById("copyJsonBtn").addEventListener("click", () => {
  const newArticle = buildArticleJson();
  const updated = [...allArticles.filter(a => a.id !== newArticle.id), newArticle];
  navigator.clipboard.writeText(JSON.stringify(updated, null, 2)).then(() => alert("JSON copied!"));
});

document.getElementById("downloadJsonBtn").addEventListener("click", () => {
  const newArticle = buildArticleJson();
  const updated = [...allArticles.filter(a => a.id !== newArticle.id), newArticle];
  const blob = new Blob([JSON.stringify(updated, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "articles.json";
  link.click();
});

function displayArticleList() {
  articleListDisplay.textContent = JSON.stringify(allArticles, null, 2);
}