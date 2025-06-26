window.onload = () => {
  fetch('header.html').then(res => res.text()).then(html => {
    document.getElementById('header-placeholder').innerHTML = html;
    initHeaderScripts();
  });

  fetch('footer.html').then(res => res.text()).then(html => {
    document.getElementById('footer-placeholder').innerHTML = html;
  });

  const titleInput = document.getElementById('editorTitle');
  const imageInput = document.getElementById('editorImage');
  const bodyInput = document.getElementById('editorBody');
  const preview = document.getElementById('preview');
  const rawMd = document.getElementById('rawMd');
  const jsonSnippet = document.getElementById('jsonSnippet');

  function updatePreview() {
    const markdown = bodyInput.value;
    preview.innerHTML = marked.parse(markdown);
    rawMd.textContent = markdown;
  }

  bodyInput.addEventListener('input', updatePreview);

  document.getElementById('insertImage').addEventListener('click', () => {
    const url = prompt("Enter image URL:");
    const alt = prompt("Alt text:", "");
    if (url) {
      const imageMarkdown = `![${alt}](${url})\n`;
      bodyInput.value += imageMarkdown;
      updatePreview();
    }
  });

  document.getElementById('saveArticle').addEventListener('click', () => {
    const title = titleInput.value.trim();
    const image = imageInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title || !body) return alert("Title and markdown are required.");

    const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '');
    const summary = body.split('\n').find(line => line.trim())?.substring(0, 100) + "...";

    const article = { id, title, image, summary };
    const mdBlob = new Blob([body], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(mdBlob);
    link.download = `${id}.md`;
    link.click();

    jsonSnippet.textContent = JSON.stringify(article, null, 2);
    updatePreview();
  });

  updatePreview();
};

function initHeaderScripts() {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }

  const modeToggle = document.getElementById('modeToggle');
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    if (modeToggle) modeToggle.textContent = '🌞';
  }

  if (modeToggle) {
    modeToggle.onclick = () => {
      const isLight = document.body.classList.toggle('light-mode');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      modeToggle.textContent = isLight ? '🌞' : '🌙';
    };
  }
}
