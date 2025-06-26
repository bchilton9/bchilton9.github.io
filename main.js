let currentPage = 1;
const articlesPerPage = 6;
let allArticles = [];
let activeCategory = "all";
let searchTerm = "";

function initHeaderScripts() {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
    document.addEventListener("click", e => {
      if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove("open");
      }
    });
  }

  const selector = document.getElementById("colorSelector");
  selector.addEventListener("change", () => setColorTheme(selector.value));
  loadColorTheme();
}

function setColorTheme(theme) {
  document.body.className = document.body.className
    .split(" ")
    .filter(c => !c.startsWith("theme-"))
    .join(" ");
  document.body.classList.add(`theme-${theme}`);
  localStorage.setItem("colorTheme", theme);
}

function loadColorTheme() {
  const theme = localStorage.getItem("colorTheme") || "blue";
  setColorTheme(theme);
  document.getElementById("colorSelector").value = theme;
}

function loadArticles() {
  fetch("articles.json")
    .then(res => res.json())
    .then(data => {
      allArticles = data;
      renderCategories(data);
      renderArticles();
    });
}

function renderCategories(data) {
  const menuList = document.getElementById("articleList");
  const filter = document.getElementById("categoryFilters");
  const setCats = new Set();

  data.forEach(a => a.categories.forEach(c => setCats.add(c)));
  const cats = ["all", ...Array.from(setCats).sort()];

  menuList.innerHTML = `<a href="index.html" class="cat-btn">Home</a>`;
  filter.innerHTML = `<button data-cat="all" class="active">All</button>`;

  cats.forEach(cat => {
    if (cat !== "all") {
      const btn = document.createElement("a");
      btn.href = "#";
      btn.textContent = cat;
      btn.classList.add("cat-btn");
      btn.addEventListener("click", e => {
        e.preventDefault();
        activeCategory = cat;
        currentPage = 1;
        renderArticles();
        setActiveHamburger(cat);
        document.getElementById("navLinks").classList.remove("open");
      });
      menuList.appendChild(btn);

      const fbtn = document.createElement("button");
      fbtn.textContent = cat;
      fbtn.dataset.cat = cat;
      filter.appendChild(fbtn);
    }
  });

  filter.addEventListener("click", e => {
    if (e.target.tagName === "BUTTON") {
      activeCategory = e.target.dataset.cat;
      currentPage = 1;
      renderArticles();
      filter.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
    }
  });
}

function setActiveHamburger(cat) {
  document.querySelectorAll(".cat-btn").forEach(el => {
    el.classList.toggle("active", el.textContent === cat);
  });
}

function renderArticles() {
  const container = document.getElementById("articles");
  const pagination = document.getElementById("pagination");
  const viewer = document.getElementById("articleContent");
  const backBtn = document.getElementById("backButton");

  viewer.style.display = "none";
  backBtn.style.display = "none";
  container.style.display = "block";
  pagination.style.display = "flex";
  document.getElementById("searchBox").style.display = "block";
  document.getElementById("categoryFilters").style.display = "flex";

  const filtered = allArticles.filter(a =>
    (activeCategory === "all" || a.categories.includes(activeCategory)) &&
    (searchTerm === "" ||
      a.title.toLowerCase().includes(searchTerm) ||
      a.summary.toLowerCase().includes(searchTerm))
  );

  const start = (currentPage - 1) * articlesPerPage;
  const slice = filtered.slice(start, start + articlesPerPage);

  container.innerHTML = "";
  slice.forEach(a => {
    const card = document.createElement("article");
    card.innerHTML = `
      <h2>${a.title}</h2>
      ${a.image ? `<img src="${a.image}" alt="${a.title}" />` : ""}
      <p>${a.summary}</p>
      <div class="card-buttons">
        <button class="readMore" data-id="${a.id}">Read more →</button>
        <button class="shareLink" data-id="${a.id}">🔗 Share</button>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll(".readMore")
    .forEach(btn => btn.addEventListener("click", () => loadMarkdown(btn.dataset.id)));

  container.querySelectorAll(".shareLink")
    .forEach(btn => btn.addEventListener("click", () => {
      const link = `${location.origin}${location.pathname}#${btn.dataset.id}`;
      copyToClipboard(link, btn);
  }));

  renderPagination(filtered.length);
}

function renderPagination(total) {
  const pagination = document.getElementById("pagination");
  const totalPages = Math.ceil(total / articlesPerPage);
  pagination.innerHTML = "";

  if (totalPages <= 1) return;

  const prev = document.createElement("button");
  prev.textContent = "← Prev";
  prev.disabled = currentPage === 1;
  prev.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderArticles();
    }
  });

  const next = document.createElement("button");
  next.textContent = "Next →";
  next.disabled = currentPage === totalPages;
  next.addEventListener("click", () => {
    if (currentPage * articlesPerPage < total) {
      currentPage++;
      renderArticles();
    }
  });

  pagination.append(prev, document.createTextNode(`Page ${currentPage} of ${totalPages}`), next);
}

function loadMarkdown(id) {
  fetch(`articles/${id}.md`)
    .then(r => r.text())
    .then(md => {
      document.getElementById("articles").style.display = "none";
      document.getElementById("pagination").style.display = "none";
      document.getElementById("searchBox").style.display = "none";
      document.getElementById("categoryFilters").style.display = "none";

      const viewer = document.getElementById("articleContent");
      viewer.innerHTML = marked.parse(md);
      viewer.style.display = "block";
      document.getElementById("backButton").style.display = "inline-block";
      setActiveHamburger("all");

      viewer.querySelectorAll("img").forEach(img => {
        img.style.cursor = "zoom-in";
        img.addEventListener("click", () => window.open(img.src, "_blank"));
      });

      const share = document.createElement("button");
      share.textContent = "🔗 Share";
      share.style.marginTop = "1rem";
      share.addEventListener("click", () => {
        const link = `${location.origin}${location.pathname}#${id}`;
        copyToClipboard(link, share);
      });
      viewer.appendChild(share);
    });
}

document.getElementById("backButton").addEventListener("click", () => {
  currentPage = 1;
  renderArticles();
});

document.getElementById("searchBox").addEventListener("input", e => {
  searchTerm = e.target.value.toLowerCase();
  currentPage = 1;
  renderArticles();
});

function copyToClipboard(text, btn) {
  if (navigator.share) {
    navigator.share({ url: text }).catch(console.warn);
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showCopied(btn)).catch(() => fallbackCopy(text, btn));
  } else {
    fallbackCopy(text, btn);
  }
}

function fallbackCopy(text, btn) {
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  showCopied(btn);
}

function showCopied(btn) {
  const old = btn.textContent;
  btn.textContent = "✅ Copied!";
  setTimeout(() => (btn.textContent = old), 1500);
}

fetch("header.html").then(r => r.text()).then(html => {
  document.getElementById("header-placeholder").innerHTML = html;
  initHeaderScripts();
  loadArticles();
});
fetch("footer.html").then(r => r.text()).then(html => {
  document.getElementById("footer-placeholder").innerHTML = html;
});