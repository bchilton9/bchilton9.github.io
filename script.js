const username = "bchilton9";
const activeList = document.getElementById("active-list");
const archivedList = document.getElementById("archived-list");

async function fetchRepos() {
  const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
  const repos = await response.json();

  repos.forEach(async (repo) => {
    const description = await fetchDescription(repo);
    const card = document.createElement("div");
    card.className = "repo-card";
    card.innerHTML = `
      <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
      <p>${description || repo.description || "No description provided."}</p>
    `;

    if (repo.archived) {
      archivedList.appendChild(card);
    } else {
      activeList.appendChild(card);
    }
  });
}

async function fetchDescription(repo) {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${username}/${repo.name}/main/description.md`);
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    return null;
  }
}

fetchRepos();