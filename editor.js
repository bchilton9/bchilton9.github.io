// Load shared header
fetch("header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;
    initHeaderScripts();
  });

// Tab switching
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");

    if (btn.dataset.tab === "preview") {
      updatePreview();
    } else if (btn.dataset.tab === "save") {
      updateJSONPreview();
    }
  });
});

function updatePreview() {
  const markdown = document.getElementById("markdownInput").value;
  document.getElementById("livePreview").innerHTML = marked.parse(markdown);
}

function updateJSONPreview() {
  const json = buildArticleJSON();
  document.getElementById("jsonPreview").textContent = JSON.stringify(json, null, 2);
}

function buildArticleJSON() {
  const title = document.getElementById("articleTitle").value.trim();
  const image = document.getElementById("articleImage").value.trim();
  const categories = document.getElementById("articleCategories").value.split(",").map(c => c.trim());
  const summary = document.getElementById("markdownInput").value.trim().split("\n")[0];
  const id = title.replace(/\s+/g, "").replace(/[^\w\-]/g, "");

  return { id, title, summary, image, categories };
}

// Export buttons
document.getElementById("downloadMD").onclick = () => {
  const blob = new Blob([document.getElementById("markdownInput").value], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${document.getElementById("articleTitle").value || "untitled"}.md`;
  a.click();
};

document.getElementById("copyMD").onclick = () => {
  navigator.clipboard.writeText(document.getElementById("markdownInput").value).then(() => {
    alert("Markdown copied!");
  });
};

document.getElementById("copyJSON").onclick = () => {
  const json = buildArticleJSON();
  navigator.clipboard.writeText(JSON.stringify(json, null, 2)).then(() => {
    alert("JSON copied!");
  });
};