document.addEventListener("DOMContentLoaded", () => {
  const username = "bchilton9";

  // TERMINAL LOADER
  const terminalLines = [
    "> Initializing ChilSoft...",
    "> Loading repositories...",
    "> Injecting caffeine...",
    "> System ready."
  ];

  const terminal = document.getElementById("terminal-text");
  const loader = document.getElementById("terminal-loader");

  let lineIndex = 0;
  function typeLine() {
    if (lineIndex < terminalLines.length) {
      const line = terminalLines[lineIndex];
      let charIndex = 0;
      const typer = setInterval(() => {
        if (charIndex < line.length) {
          terminal.textContent += line[charIndex++];
        } else {
          clearInterval(typer);
          terminal.textContent += '\n';
          lineIndex++;
          setTimeout(typeLine, 500);
        }
      }, 40);
    } else {
      setTimeout(() => {
        loader.style.opacity = "0";
        setTimeout(() => loader.remove(), 600);
      }, 1000);
    }
  }
  typeLine();

  // MATRIX BACKGROUND
  function startMatrix() {
    const canvas = document.getElementById("matrix");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = "01";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00f0ff";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    setInterval(draw, 35);
  }

  // REPO + PROJECT LOADING
  const activeList = document.getElementById("active-list");
  const archivedList = document.getElementById("archived-list");

  function loadCustomProjects() {
    return fetch('projects.json')
      .then(res => res.json())
      .then(projects => {
        projects.forEach(project => {
          const card = document.createElement('div');
          card.className = 'repo-card';
          card.innerHTML = `
            <h3><a href="${project.link}" target="_blank">${project.name}</a></h3>
            <p>${project.description}</p>
            <div class="repo-meta">
              <span class="badge">Custom Project (Non-GitHub)</span>
            </div>
          `;
          (project.archived ? archivedList : activeList).appendChild(card);
        });
      });
  }

  async function fetchRepos() {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    const repos = await response.json();

    repos.forEach(async (repo) => {
      const description = await fetchDescription(repo);
      const updated = new Date(repo.updated_at).toLocaleDateString();
      const language = repo.language ? `<span class="badge">${repo.language}</span>` : "";
      const stars = repo.stargazers_count > 0 ? `<span class="badge">⭐ ${repo.stargazers_count}</span>` : "";

      const card = document.createElement("div");
      card.className = "repo-card";
      card.innerHTML = `
        <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
        <p>${description || repo.description || "No description provided."}</p>
        <div class="repo-meta">
          ${language}
          ${stars}
          <span class="badge">Updated: ${updated}</span>
        </div>
      `;

      (repo.archived ? archivedList : activeList).appendChild(card);
    });
  }

  async function fetchDescription(repo) {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${username}/${repo.name}/main/description.md`);
      if (!res.ok) return null;
      return await res.text();
    } catch {
      return null;
    }
  }

  // ARCHIVE TOGGLE
  const toggleArchive = document.getElementById("toggle-archive");
  const toggleIcon = toggleArchive.querySelector("h2 span");

  toggleArchive.addEventListener("click", () => {
    archivedList.classList.toggle("collapsed");
    toggleIcon.textContent = archivedList.classList.contains("collapsed") ? "▶" : "▼";
  });

  // YEAR
  document.getElementById("year").textContent = new Date().getFullYear();

  // START EVERYTHING
  loadCustomProjects().then(() => {
    fetchRepos();
    startMatrix();
  });
});