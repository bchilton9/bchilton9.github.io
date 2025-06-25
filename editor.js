window.onload = () => {
  fetch('header.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('header-placeholder').innerHTML = data;
      initHeaderScripts();
    });

  fetch('footer.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    });

  const titleInput = document.getElementById('editorTitle');
  const imageInput = document.getElementById('editorImage');
  const bodyInput = document.getElementById('editorBody');
  const preview = document.getElementById('preview');
  const rawMd = document.getElementById('rawMd');
  const jsonOut = document.getElementById('jsonSnippet');

  // Live preview + raw code view
  const updatePreview = () => {
    const markdown = bodyInput.value;
    preview.innerHTML = marked.parse(markdown);
    rawMd.textContent = markdown;
  };

  bodyInput.addEventListener('input', updatePreview);

  // Insert markdown image tag
  document.getElementById('insertImage').onclick = () => {
    const url = prompt("Image URL:");
    if (url) {
      const alt = prompt("Alt text:", "Image description");
      const insert = `![${alt || ""}](${url})\n`;
      bodyInput.value += insert;
      updatePreview();
    }
  };

  document.getElementById('saveArticle').onclick = () => {
    const title = titleInput.value.trim();
    const image = imageInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title || !body) {
      alert('Title and body are required.');
      return;
    }

    const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const snippet = {
      id,
      title,
      image,
      summary: body.split('\n')[0].substring(0, 100) + '...'
    };

    // Download .md
    const blob = new Blob([body], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${id}.md`;
    link.click();

    jsonOut.textContent = JSON.stringify(snippet, null, 2);
    alert('Markdown file downloaded.\nCopy the JSON snippet into your articles.json.');
  };
};

function initHeaderScripts() {
  const modeToggle = document.getElementById('modeToggle');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

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

  if (menuToggle && navLinks) {
    menuToggle.onclick = () => {
      navLinks.classList.toggle('open');
    };
  }
}
