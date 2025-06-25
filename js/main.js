// Load header and footer
fetch('header.html').then(res => res.text()).then(html => {
  document.getElementById('header').innerHTML = html;
});
fetch('footer.html').then(res => res.text()).then(html => {
  document.getElementById('footer').innerHTML = html;
});

// Load and display articles
fetch('data/articles.json')
  .then(res => res.json())
  .then(data => {
    const articlesDiv = document.getElementById('articles');
    const articleView = document.getElementById('article-view');
    const backButton = document.getElementById('back-button');
    const title = document.getElementById('article-title');
    const body = document.getElementById('article-body');
    const image = document.getElementById('article-image');

    data.forEach(article => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${article.image}" alt="${article.title}">
        <h2>${article.title}</h2>
        <p>${article.summary}</p>
      `;
      card.addEventListener('click', () => {
        articlesDiv.style.display = 'none';
        articleView.style.display = 'block';
        title.textContent = article.title;
        body.innerHTML = marked.parse(article.content);
        image.src = article.image;
        image.alt = article.title;
      });
      articlesDiv.appendChild(card);
    });

    backButton.addEventListener('click', () => {
      articleView.style.display = 'none';
      articlesDiv.style.display = 'block';
    });
  });
