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
}

function renderPagination(filtered) {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;
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
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      allArticles = data;
      renderCategories(data);
      applyCategoryFromUrl();
      renderArticles();
      setupSearch();
    })
    .catch((err) => {
      console.error("Failed to load articles:", err);
      const container = document.getElementById("articles");
      container.innerHTML = "<p style='color:red'>Failed to load articles.</p>";
    });
}

function renderArticles() {
  const container = document.getElementById("articles");
  const articleContent = document.getElementById("articleContent");
  const pagination = document.getElementById("pagination");
  const backButton = document.getElementById("backButton");
  const searchBox = document.getElementById("searchBox");
  const categoryFilters = document.getElementById("categoryFilters");

  // Show list UI
  container.style.display = "block";
  searchBox.style.display = "block";
  categoryFilters.style.display = "flex";
  pagination.style.display = "flex";
  articleContent.style.display = "none";
  backButton.style.display = "none";

  // Filter by category and search term
  const filtered = allArticles.filter((article) => {
    const inCategory =
      activeCategory === "all" || article.categories.includes(activeCategory);
    const inSearch =
      article.title.toLowerCase().includes(searchTerm) ||
      article.summary.toLowerCase().includes(searchTerm);
    return inCategory && inSearch;
  });

  // Pagination slice
  const start = (currentPage - 1) * articlesPerPage;
  const pageArticles = filtered.slice(start, start + articlesPerPage);

  container.innerHTML = "";
  pageArticles.forEach((article) => {
    const card = document.createElement("article");
    card.setAttribute("data-categories", article.categories.join(","));

    card.innerHTML = `
      <h2>${article.title}</h2>
      ${
        article.image
          ? `<img src="${article.image}" alt="${article.title}" />`
          : ""
      }
      <p>${article.summary}</p>
      <div class="card-buttons">
        <button data-id="${article.id}" class="readMore">Read more →</button>
        <button data-id="${article.id}" class="shareLink">🔗 Share</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Attach read more button handlers
  document.querySelectorAll(".readMore").forEach((btn) => {
    btn.onclick = () => {
      loadMarkdown(btn.dataset.id);
      navLinks.classList.remove("open");
    };
  });

  // Attach share button handlers
  document.querySelectorAll(".shareLink").forEach((btn) => {
    btn.onclick = () => {
      const link = `${window.location.origin}${window.location.pathname}#${btn.dataset.id}`;
      copyToClipboard(link, btn);
    };
  });

  renderPagination(filtered);

  // Highlight active category button in filters
  document.querySelectorAll("#categoryFilters button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.cat === activeCategory);
  });
  // Highlight active category link in hamburger menu
  document.querySelectorAll("#articleList a").forEach((link) => {
    link.classList.toggle("active", link.textContent === activeCategory);
  });
}

function renderCategories(data) {
  const menuList = document.getElementById("articleList");
  const filterContainer = document.getElementById("categoryFilters");
  const allCategories = new Set();

  data.forEach((a) => a.categories.forEach((c) => allCategories.add(c)));

  menuList.innerHTML = "";
  filterContainer.innerHTML = "";

  // Add "All" link/button to hamburger and filters
  const allLink = document.createElement("a");
  allLink.href = "?cat=all";
  allLink.textContent = "All";
  allLink.classList.add("active");
  allLink.onclick = (e) => {
    e.preventDefault();
    activeCategory = "all";
    currentPage = 1;
    renderArticles();
    navLinks.classList.remove("open");
  };
  menuList.appendChild(allLink);

  const allFilterBtn = document.createElement("button");
  allFilterBtn.textContent = "All";
  allFilterBtn.dataset.cat = "all";
  allFilterBtn.classList.add("active");
  filterContainer.appendChild(allFilterBtn);

  Array.from(allCategories)
    .sort()
    .forEach((cat) => {
      // Sidebar menu (hamburger)
      const link = document.createElement("a");
      link.href = "?cat=" + encodeURIComponent(cat);
      link.textContent = cat;
      link.onclick = (e) => {
        e.preventDefault();
        activeCategory = cat;
        currentPage = 1;
        renderArticles();
        navLinks.classList.remove("open");
      };
      menuList.appendChild(link);

      // Filter buttons
      const btn = document.createElement("button");
      btn.textContent = cat;
      btn.dataset.cat = cat;
      filterContainer.appendChild(btn);
    });

  // Filter buttons event
  filterContainer.onclick = (e) => {
    if (e.target.tagName !== "BUTTON") return;
    activeCategory = e.target.dataset.cat;
    currentPage = 1;
    renderArticles();
    // Highlight active filter
    document.querySelectorAll("#categoryFilters button").forEach((btn) =>
      btn.classList.remove("active")
    );
    e.target.classList.add("active");
  };
}

function loadMarkdown(id) {
  fetch(`articles/${id}.md`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load article");
      return res.text();
    })
    .then((markdown) => {
      // Hide list UI
      document.getElementById("articles").style.display = "none";
      document.getElementById("searchBox").style.display = "none";
      document.getElementById("categoryFilters").style.display = "none";
      document.getElementById("pagination").style.display = "none";

      const viewer = document.getElementById("articleContent");
      viewer.innerHTML = marked.parse(markdown);

      // Make images clickable to open full size in new tab
      viewer.querySelectorAll("img").forEach((img) => {
        img.style.maxWidth = "100%";
        img.style.cursor = "pointer";
        img.onclick = () => window.open(img.src, "_blank");
      });

      // Add share button below article
      const share = document.createElement("button");
      share.textContent = "🔗 Share";
      share.style.marginTop = "1rem";
      share.onclick = () => {
        const link = `${window.location.origin}${window.location.pathname}#${id}`;
        copyToClipboard(link, share);
      };
      viewer.appendChild(share);

      viewer.style.display = "block";

      // Show back button
      const backButton = document.getElementById("backButton");
      backButton.style.display = "inline-block";

      // Update URL hash
      window.location.hash = id;

      // Close menu
      const navLinks = document.getElementById("navLinks");
      navLinks.classList.remove("open");
    })
    .catch((err) => {
      alert("Failed to load article.");
      console.error(err);
    });
}

function copyToClipboard(text, button) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showCopied(button);
      })
      .catch(() => {
        fallbackCopy(text, button);
      });
  } else {
    fallbackCopy(text, button);
  }
}

function fallbackCopy(text, button) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed"; // avoid scrolling to bottom
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    const successful = document.execCommand("copy");
    if (successful) showCopied(button);
  } catch {
    alert("Copy not supported");
  }
  document.body.removeChild(textarea);
}

function showCopied(button) {
  const original = button.textContent;
  button.textContent = "✅ Copied!";
  setTimeout(() => (button.textContent = original), 1500);
}

function setupSearch() {
  const searchBox = document.getElementById("searchBox");
  searchBox.addEventListener("input", () => {
    searchTerm = searchBox.value.toLowerCase();
    currentPage = 1;
    renderArticles();
  });
}

function applyCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get("cat");
  if (cat) {
    activeCategory = cat;
  }
}

document.getElementById("backButton").addEventListener("click", () => {
  // Show list UI
  document.getElementById("articles").style.display = "block";
  document.getElementById("searchBox").style.display = "block";
  document.getElementById("categoryFilters").style.display = "flex";
  document.getElementById("pagination").style.display = "flex";
  document.getElementById("articleContent").style.display = "none";
  document.getElementById("backButton").style.display = "none";

  // Clear URL hash
  window.location.hash = "";
  currentPage = 1;
  renderArticles();
});

// Load header, footer, and articles after DOM ready
document.addEventListener("DOMContentLoaded", () => {
  fetch("header.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("header-placeholder").innerHTML = html;
      initHeaderScripts();
    });

  fetch("footer.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("footer-placeholder").innerHTML = html;
    });

  loadArticles();

  // If page loaded with hash, load that article
  const hash = window.location.hash.substring(1);
  if (hash) {
    setTimeout(() => loadMarkdown(hash), 500);
  }
});