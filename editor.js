// Load header.html
fetch("header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;
  });

// Tab switching logic
document.querySelectorAll('.editor-tabs button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.editor-tabs button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    const tabId = 'tab-' + button.dataset.tab;
    document.getElementById(tabId).classList.add('active');
  });
});

// Initialize Quill
const quill = new Quill('#quillEditor', {
  theme: 'snow',
  placeholder: 'Write your article content here...'
});

// Synchronize Quill and Markdown textarea
const markdownEditor = document.getElementById('markdownEditor');
const quillEditor = document.getElementById('quillEditor');

// On Quill change, update Markdown
quill.on('text-change', () => {
  // Convert Quill delta to HTML, then to Markdown
  const html = quill.root.innerHTML;
  // Use turndown to convert HTML to Markdown
  markdownEditor.value = TurndownService ? new TurndownService().turndown(html) : html;
});

// On Markdown textarea change, update Quill
markdownEditor.addEventListener('input', () => {
  const markdown = markdownEditor.value;
  // Convert markdown to HTML using marked.js (or similar)
  if (marked) {
    const html = marked.parse(markdown);
    quill.root.innerHTML = html;
  } else {
    quill.root.innerHTML = markdown;
  }
});

// Load articles.json and populate dropdown & UI
let allArticles = [];
fetch('articles.json')
  .then(res => res.json())
  .then(data => {
    allArticles = data;
    updateArticleListUI();
    populateLoaderDropdown();
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
  if (article) {
    document.getElementById("id").value = article.id;
    document.getElementById("title").value = article.title;
    document.getElementById("summary").value = article.summary;
    document.getElementById("image").value = article.image;
    document.getElementById("categories").value = article.categories.join(", ");

    fetch(`articles/${article.id}.md`)
      .then(res => res.text())
      .then(md => {
        markdownEditor.value = md;
        if (marked) {
          quill.root.innerHTML = marked.parse(md);
        } else {
          quill.root.innerHTML = md;
        }
      });
  }
});

function clearForm() {
  ['id', 'title', 'summary', 'image', 'categories'].forEach(id => {
    document.getElementById(id).value = '';
  });
  markdownEditor.value = '';
  quill.root.innerHTML = '';
}

function buildArticleJson() {
  return {
    id: document.getElementById('id').value.trim(),
    title: document.getElementById('title').value.trim(),
    summary: document.getElementById('summary').value.trim(),
    image: document.getElementById('image').value.trim(),
    categories: document.getElementById('categories').value.split(',').map(c => c.trim()).filter(Boolean)
  };
}

function updateArticleListUI() {
  const json = JSON.stringify(allArticles, null, 2);
  document.getElementById('articleListDisplay').textContent = json;
}

// Export buttons
document.getElementById('downloadMd').addEventListener('click', () => {
  const id = document.getElementById('id').value.trim() || 'article';
  const md = markdownEditor.value;
  const blob = new Blob([md], {type: 'text/markdown'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = id + '.md';
  link.click();
});

document.getElementById('copyMd').addEventListener('click', () => {
  const md = markdownEditor.value;
  navigator.clipboard.writeText(md).then(() => {
    alert('Markdown copied!');
  });
});

document.getElementById('copyJson').addEventListener('click', () => {
  const newArticle = buildArticleJson();
  const updated = [...allArticles.filter(a => a.id !== newArticle.id), newArticle];
  navigator.clipboard.writeText(JSON.stringify(updated, null, 2)).then(() => {
    alert('JSON copied!');
  });
});

document.getElementById('downloadJson').addEventListener('click', () => {
  const newArticle = buildArticleJson();
  const updated = [...allArticles.filter(a => a.id !== newArticle.id), newArticle];
  const blob = new Blob([JSON.stringify(updated, null, 2)], {type: 'application/json'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'articles.json';
  link.click();
});