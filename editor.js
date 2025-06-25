window.onload = () => {
  // Load header and footer
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

  // Update preview and raw markdown code
  function updatePreview() {
    const markdown = bodyInput.value;
    preview.innerHTML = marked.parse(markdown);
    rawMd.textContent = markdown;
  }

  bodyInput.addEventListener('input', updatePreview);

  // Insert image markdown on button click
  document.getElementById('insertImage').onclick = () => {
    const url = prompt('Enter Image URL:');
    if (url) {
      const alt = prompt('Enter alt text (optional):', '');
      const imageMarkdown = `![${alt || ''}](${url})\n`;
      // Insert at cursor position or append
      const start = bodyInput.selectionStart || bodyInput.value.length;
      const end = bodyInput.selectionEnd || bodyInput.value.length;
      bodyInput.value = bodyInput.value.substring(0, start) + imageMarkdown + bodyInput.value.substring(end);
      updatePreview();
      bodyInput.focus();
    }
  };

  // Save markdown file and show JSON snippet
  document.getElementById('saveArticle').onclick = () => {
    const title = titleInput.value.trim();
    const image = imageInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title || !body) {
      alert('Please enter both a title and body.');
      return;
    }

    const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const summary = body.split('\n').find(line => line.trim().length > 0)?.substring(0, 100) + '...';

    const articleJSON = {
      id,
      title,
      image,
      summary
    };

    // Download the markdown file
    const blob = new Blob([body], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${id}.md`;
    link.click();

    // Show JSON snippet
    jsonOut.textContent = JSON.stringify(articleJSON, null, 2);

    alert('Markdown file downloaded.\nCopy the JSON snippet into articles.json.');
  };

  // Initialize preview empty on load
  updatePreview();
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
