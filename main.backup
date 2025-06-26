let currentPage = 1;
const articlesPerPage = 6;
let allArticles = [];
let activeCategory = "all";
let searchTerm = "";

function initHeaderScripts() {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
    document.addEventListener("click", (e) => {
      if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove("open");
      }
    });
  }

  const modeToggle = document.getElementById("modeToggle");
  const siteLogo = document.getElementById("siteLogo");

  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
    if (modeToggle) modeToggle.textContent = "🌞";
    if (siteLogo) siteLogo.src = "images/logo-light.png";
  }

  if (modeToggle) {
    modeToggle.onclick = () => {
      const isLight = document.body.classList.toggle("light-mode");
      localStorage.setItem("theme", isLight ? "light" : "dark");
      modeToggle.textContent = isLight ? "🌞" : "🌙";
      if (siteLogo)
        siteLogo.src = isLight ? "images/logo-light.png" : "images/logo-dark.png";
    };
  }
}

function renderPagination(filtered) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(filtered.length / articlesPerPage);
  if (totalPages <= 1) return;

  const prev = document.createElement("button");
  prev.textContent = "← Prev";
  prev.disabled = currentPage === 1;
  prev.onclick = () => {
    currentPage--;
    renderArticles();
  };

  const next = document.createElement("button");
  next.textContent = "Next →";
  next.disabled = currentPage === totalPages;
  next.onclick = () => {
    currentPage++;
    renderArticles();
  };

  pagination.appendChild(prev);
  pagination.appendChild(document.createTextNode(` Page ${currentPage} of ${totalPages} `));
  pagination.appendChild(next);
}

function loadArticles() {
  fetch("articles.json")
    .then((res) => res.json())
    .then((data) => {
      allArticles = data;
      renderCategories(data);
      renderArticles();
    });
}

function renderArticles() {
  const container = document.getElementById("articles");
  container.innerHTML = "";

  const filtered = allArticles.filter((article) => {
    const inCategory =
      activeCategory === "all" || article.categories.includes(activeCategory);
    const inSearch = article.title.toLowerCase().includes(searchTerm) ||
                     article.summary.toLowerCase().includes(searchTerm);
    return inCategory && inSearch;
  });

  const start = (currentPage - 1) * articlesPerPage;
  const pageArticles = filtered.slice(start, start + articlesPerPage);

  pageArticles.forEach((article) => {
    const card = document.createElement("article");
    card.setAttribute("data-categories", article.categories.join(","));

    card.innerHTML = `
      <h2>${article.title}</h2>
      ${article.image ? `<img src="${article.image}" alt="${article.title}" />` : ""}
      <p>${article.summary}</p>
      <div class="card-buttons">
        <button data-id="${article.id}" class="readMore">Read more →</button>
        <button data-id="${article.id}" class="shareLink">🔗 Share</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Read More buttons
  document.querySelectorAll(".readMore").forEach((btn) => {
    btn.addEventListener("click", () => loadMarkdown(btn.dataset.id));
  });

  // Share buttons
  document.querySelectorAll(".shareLink").forEach((btn) => {
    btn.addEventListener("click", () => {
      const link = `${window.location.origin}${window.location.pathname}#${btn.dataset.id}`;
      copyToClipboard(link, btn);
    });
  });

  renderPagination(filtered);
}

function renderCategories(data) {
  const menuList = document.getElementById("articleList");
  const filterContainer = document.getElementById("categoryFilters");
  const allCategories = new Set();

  data.forEach((a) => a.categories.forEach((c) => allCategories.add(c)));

  menuList.innerHTML = "";
  filterContainer.innerHTML = `<button class="active" data-cat="all">All</button>`;

  Array.from(allCategories).sort().forEach((cat) => {
    // Sidebar menu (hamburger)
    const link = document.createElement("a");
    link.href = "?cat=" + encodeURIComponent(cat);
    link.textContent = cat;
    link.addEventListener("click", (e) => {
      e.preventDefault();
      activeCategory = cat;
      currentPage = 1;
      renderArticles();
      document.querySelectorAll("#articleList a").forEach((el) =>
        el.classList.remove("active")
      );
      link.classList.add("active");
      document.getElementById("navLinks").classList.remove("open");
    });
    menuList.appendChild(link);

    // Filter buttons
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.dataset.cat = cat;
    filterContainer.appendChild(btn);
  });

  // Filter UI
  filterContainer.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") return;
    activeCategory = e.target.dataset.cat;
    currentPage = 1;
    renderArticles();
    document.querySelectorAll(".category-filters button").forEach((btn) =>
      btn.classList.remove("active")
    );
    e.target.classList.add("active");
  });

  // Apply ?cat= from URL
  const urlParams = new URLSearchParams(window.location.search);
  const catFromUrl = urlParams.get("cat");
  if (catFromUrl) {
    activeCategory = catFromUrl;
  }
}

function loadMarkdown(id) {
  fetch(`articles/${id}.md`)
    .then((res) => res.text())
    .then((markdown) => {
      document.getElementById("articles").style.display = "none";
      document.getElementById("searchBox").style.display = "none";
      document.getElementById("categoryFilters").style.display = "none";
      document.getElementById("pagination").style.display = "none";

      const viewer = document.getElementById("articleContent");
      viewer.innerHTML = marked.parse(markdown);

      const share = document.createElement("button");
      share.textContent = "🔗 Share";
      share.onclick = () => {
        const link = `${window.location.origin}${window.location.pathname}#${id}`;
        copyToClipboard(link, share);
      };
      share.style.marginTop = "1rem";
      viewer.appendChild(share);

      viewer.style.display = "block";
      document.getElementById("backButton").style.display = "inline-block";
      document.getElementById("navLinks").classList.remove("open");
    });
}

document.getElementById("backButton").addEventListener("click", () => {
  document.getElementById("articles").style.display = "block";
  document.getElementById("searchBox").style.display = "block";
  document.getElementById("categoryFilters").style.display = "flex";
  document.getElementById("pagination").style.display = "block";
  document.getElementById("articleContent").style.display = "none";
  document.getElementById("backButton").style.display = "none";
  window.location.hash = "";
});

document.addEventListener("input", (e) => {
  if (e.target.id === "searchBox") {
    searchTerm = e.target.value.toLowerCase();
    currentPage = 1;
    renderArticles();
  }
});

function copyToClipboard(text, button) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showCopied(button);
    }).catch(() => {
      fallbackCopy(text, button);
    });
  } else {
    fallbackCopy(text, button);
  }
}

function fallbackCopy(text, button) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    const successful = document.execCommand("copy");
    if (successful) showCopied(button);
  } catch (err) {
    alert("Copy not supported");
  }
  document.body.removeChild(textarea);
}

function showCopied(button) {
  const original = button.textContent;
  button.textContent = "✅ Copied!";
  setTimeout(() => (button.textContent = original), 1500);
}

fetch("header.html").then(res => res.text()).then(html => {
  document.getElementById("header-placeholder").innerHTML = html;
  initHeaderScripts();
  loadArticles();
});

fetch("footer.html").then(res => res.text()).then(html => {
  document.getElementById("footer-placeholder").innerHTML = html;
});