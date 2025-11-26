const API_KEY = "618e518d";
const API = "https://www.omdbapi.com/";

const movieSearchBox = document.getElementById('movie-search-box');
const searchList = document.getElementById('search-list');
const homeGrid = document.getElementById('home-grid');
const homeView = document.getElementById('home-view');
const detailsView = document.getElementById('details-view');
const detailsContent = document.getElementById('details-content');
const backBtn = document.getElementById('back-btn');
const themeToggleBtn = document.getElementById('theme-toggle');

async function omdb(params = {}) {
  const url = new URL(API);
  params.apikey = API_KEY;
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  return (await fetch(url)).json();
}
// Search
let searchDelay;
movieSearchBox.oninput = () => {
  clearTimeout(searchDelay);
  const q = movieSearchBox.value.trim();
  if (!q) return searchList.classList.add("hide-search-list");
  searchDelay = setTimeout(() => showSearch(q), 250);
};
async function showSearch(q) {
  const data = await omdb({ s: q });
  searchList.innerHTML = "";
  if (data.Response !== "True") {
    searchList.innerHTML = `<div class="search-list-item"><div>No results</div></div>`;
    return searchList.classList.remove("hide-search-list");
  }
  data.Search.forEach(m => {
    const item = document.createElement("div");
    item.className = "search-list-item";
    item.dataset.id = m.imdbID;
    item.innerHTML = `<img src="${m.Poster !== "N/A" ? m.Poster : "https://via.placeholder.com/60x80"}">
                      <div><h4>${m.Title}</h4><p>${m.Year}</p></div>`;
    item.onclick = () => loadMovieById(m.imdbID, true);
    searchList.appendChild(item);
  });
  searchList.classList.remove("hide-search-list");
};
window.onclick = e => { if (!e.target.closest(".search-element")) searchList.classList.add("hide-search-list"); };

// Home grid
const DEFAULT = ["batman","matrix","lord","harry","star wars","inception","thor","iron man","joker"];
document.addEventListener("DOMContentLoaded", loadHomeGrid);

async function loadHomeGrid() {
  const set = new Map();
  for (const term of DEFAULT) {
    const data = await omdb({ s: term });
    if (data.Response === "True") data.Search.forEach(m => set.set(m.imdbID, m));
    if (set.size >= 36) break;
  }
  const movies = Array.from(set.values()).slice(0, 36);
  homeGrid.innerHTML = movies.map(m => `
    <div class="card" data-id="${m.imdbID}">
      <img src="${m.Poster !== "N/A" ? m.Poster : "https://via.placeholder.com/200x300"}">
      <div class="meta"><div class="title">${m.Title}</div><div class="year">${m.Year}</div></div>
    </div>`).join("");
  homeGrid.querySelectorAll(".card").forEach(card => card.onclick = () => loadMovieById(card.dataset.id, true));
}

// Details
async function loadMovieById(id, open = false) {
  const d = await omdb({ i: id, plot: "full" });
  if (open) showDetails(d);
}
function showDetails(d) {
  detailsContent.innerHTML = `
    <div class="details-poster"><img src="${d.Poster}"></div>
    <div class="details-info">
      <div class="movie-title">${d.Title}</div>
      <ul class="movie-misc-info">
        <li><b>Year:</b> ${d.Year}</li>
        <li><b>Rated:</b> ${d.Rated}</li>
        <li><b>Released:</b> ${d.Released}</li>
        <li><b>Runtime:</b> ${d.Runtime}</li>
      </ul>
      <p><b>Genre:</b> ${d.Genre}</p>
      <p><b>Director:</b> ${d.Director}</p>
      <p><b>Writer:</b> ${d.Writer}</p>
      <p><b>Actors:</b> ${d.Actors}</p>
      <p><b>Plot:</b> ${d.Plot}</p>
      <p><b>Awards:</b> ${d.Awards}</p>
      <p><b>IMDB Rating:</b> ⭐ ${d.imdbRating} / 10 (${d.imdbVotes} votes)</p>
      <p><b>Box Office:</b> ${d.BoxOffice}</p>
      <p><b>Country:</b> ${d.Country}</p>
      <p><b>Language:</b> ${d.Language}</p>
      <p><b>Production:</b> ${d.Production}</p>
      <button class="back-btn" id="open-imdb">Open on IMDb</button>
    </div>
  `;
  document.getElementById("open-imdb").onclick = () =>
    window.open(`https://www.imdb.com/title/${d.imdbID}/`, "_blank");
  homeView.classList.add("hide");
  detailsView.classList.remove("hide");
}

backBtn.onclick = () => {
  detailsView.classList.add("hide");
  homeView.classList.remove("hide");
};
