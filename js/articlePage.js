let easyMDE;
let currentArticle = null;

async function loadArticle() {
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");

  const res = await fetch("data/articles.json");
  const articles = await res.json();
  currentArticle = articles.find(a => a.id === articleId);

  if (!currentArticle) {
    document.getElementById("articleBody").innerHTML = "<p>Article not found.</p>";
    return;
  }

  document.title = `${currentArticle.title} - The Gadget Guide`;
  document.getElementById("articleTitle").textContent = currentArticle.title;
  document.getElementById("articleImage").src = currentArticle.image;
  document.getElementById("articleImage").alt = currentArticle.title;
  document.getElementById("articleBody").innerHTML = marked.parse(currentArticle.content);
  setupEditor(currentArticle.content);
}

function setupEditor(markdown) {
  const textarea = document.getElementById("markdownEditor");
  textarea.value = markdown;
  easyMDE = new EasyMDE({ element: textarea, spellChecker: false });

  document.getElementById("editToggle").addEventListener("click", () => {
    const isVisible = !textarea.classList.contains("d-none");

    if (isVisible) {
      document.getElementById("articleBody").classList.remove("d-none");
      textarea.classList.add("d-none");
      document.getElementById("saveButton").classList.add("d-none");
      document.getElementById("editToggle").textContent = "Edit";
    } else {
      if (!sessionStorage.getItem("editUnlocked")) {
        const pass = prompt("Enter the editor password:");
        if (pass !== "gadget123") {
          alert("Incorrect password.");
          return;
        }
        sessionStorage.setItem("editUnlocked", "true");
      }

      document.getElementById("articleBody").classList.add("d-none");
      textarea.classList.remove("d-none");
      document.getElementById("saveButton").classList.remove("d-none");
      document.getElementById("editToggle").textContent = "Cancel";
    }
  });

  document.getElementById("saveButton").addEventListener("click", () => {
    const updated = easyMDE.value();
    currentArticle.content = updated;
    document.getElementById("articleBody").innerHTML = marked.parse(updated);
    console.log("Updated article JSON:", JSON.stringify(currentArticle, null, 2));
    document.getElementById("editToggle").click();
  });
}

window.addEventListener("DOMContentLoaded", loadArticle);
