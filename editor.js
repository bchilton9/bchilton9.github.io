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

fetch("header.html").then((res) => res.text()).then((html) => {
  document.getElementById("header-placeholder").innerHTML = html;
  initHeaderScripts();
});

fetch("footer.html").then((res) => res.text()).then((html) => {
  document.getElementById("footer-placeholder").innerHTML = html;
});

const editor = new EditorJS({
  holder: "editorArea",
  placeholder: "Start writing your article content...",
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

document.getElementById("addArticle").addEventListener("click", () => {
  document.getElementById("articleTitle").value = "";
  document.getElementById("articleImage").value = "";
  document.getElementById("articleCategories").value = "";
  document.getElementById("articleSummary").value = "";
  editor.clear();
});

document.getElementById("loadArticle").addEventListener("click", () => {
  const id = prompt("Enter article ID to load:");
  if (!id) return;
  fetch(`articles/${id}.md`)
    .then((res) => res.text())
    .then((md) => {
      document.getElementById("markdownOutput").value = md;
      const title = md.match(/^# (.*)/)?.[1] || "";
      document.getElementById("articleTitle").value = title;
    });
});

document.getElementById("copyMarkdown").addEventListener("click", () => {
  navigator.clipboard.writeText(document.getElementById("markdownOutput").value);
});

document.getElementById("copyJSON").addEventListener("click", () => {
  navigator.clipboard.writeText(document.getElementById("jsonOutput").value);
});

document.getElementById("downloadMarkdown").addEventListener("click", () => {
  const blob = new Blob([document.getElementById("markdownOutput").value], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "article.md";
  a.click();
});

document.getElementById("downloadJSON").addEventListener("click", () => {
  const blob = new Blob([document.getElementById("jsonOutput").value], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "articles.json";
  a.click();
});