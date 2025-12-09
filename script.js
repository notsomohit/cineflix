document.addEventListener("DOMContentLoaded", () => {
  const formData = document.getElementById("search-box");
  const searchInput = document.getElementById("search-input");
  const resultsSection = document.getElementById("results");
  const hide = document.getElementById("hunt");
  const sectionTitle = document.getElementById("section-title");
  const navTrending = document.getElementById("nav-trending");

  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");
  const modalClose = document.getElementById("modal-close");

  loadTrendingMovies();

  formData.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;
    hide.classList.add("hidden");
    sectionTitle.textContent = `Results for "${query}"`;
    sectionTitle.classList.remove("hidden");
    fetchMovie(query);
  });

  async function fetchMovie(movieName) {
    try {
      showSkeletons();
      const response = await fetch(
        `/api/movies?query=${encodeURIComponent(movieName)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }
      const data = await response.json();
      displayMovieDetails(data.results || []);
    } catch (err) {
      console.error(err);
      resultsSection.innerHTML = `
        <p class="error-message">Something went wrong. Please try again later.</p>
      `;
    }
  }

  function showSkeletons() {
    resultsSection.innerHTML = "";
    for (let i = 0; i < 6; i++) {
      const skel = document.createElement("div");
      skel.className = "skeleton-card";
      skel.innerHTML = `<div class="skeleton-poster"></div>`;
      resultsSection.appendChild(skel);
    }
  }

  function displayMovieDetails(movies) {
    if (!movies || movies.length === 0) {
      resultsSection.innerHTML = `
        <p class="error-message">No results found</p>
      `;
      return;
    }

    movies.forEach((movie) => {
      const v = movie.vote_average || 0;
      const c = movie.vote_count || 0;
      movie.weighted_score = (v * c) / (c + 500);
    });

    movies.sort((a, b) => b.weighted_score - a.weighted_score);

    resultsSection.innerHTML = "";

    movies.forEach((movie) => {
      let poster;
      if (movie.poster_path) {
        poster = "https://image.tmdb.org/t/p/w500" + movie.poster_path;
      } else if (movie.backdrop_path) {
        poster = "https://image.tmdb.org/t/p/w500" + movie.backdrop_path;
      } else {
        poster =
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBdbYMPv3mY2vH6g3eMgKQWnNG5TYW9a6T1A&s";
      }

      const card = document.createElement("div");
      card.classList.add("movie-card");

      const title = movie.title || movie.original_title || "Untitled";
      const overview = movie.overview || "No description available";
      const voteAverage =
        typeof movie.vote_average === "number"
          ? movie.vote_average.toFixed(1)
          : "N/A";

      card.innerHTML = `
        <div class="poster-wrapper">
          <span class="rating-badge">${voteAverage}</span>
          <img src="${poster}" class="poster" alt="${title}" />
        </div>
        <h3>${title}</h3>
        <p class="overview">${overview}</p>
        <p><div class="details">release date: ${movie.release_date || "N/A"}</div></p>
        <p><div class="details">vote average: <span style="color:#ffcc00">${voteAverage}</span> (${movie.vote_count || 0} votes)</div></p>
      `;

      card.addEventListener("click", () => {
        openModal(movie, poster);
      });

      resultsSection.appendChild(card);
    });
  }

  async function loadTrendingMovies() {
    try {
      sectionTitle.textContent = "Trending";
      sectionTitle.classList.remove("hidden");
      hide.classList.remove("hidden");
      showSkeletons();

      const res = await fetch("/api/trending");
      if (!res.ok) throw new Error("Failed trending fetch");

      const data = await res.json();
      displayMovieDetails(data.results || []);
    } catch (error) {
      console.error(error);
      resultsSection.innerHTML = `<p class="error-message">Failed to load trending movies.</p>`;
    }
  }

  function openModal(movie, poster) {
    const title = movie.title || movie.original_title || "Untitled";
    const voteAverage =
      typeof movie.vote_average === "number"
        ? movie.vote_average.toFixed(1)
        : "N/A";

    modalBody.innerHTML = `
      <img src="${poster}" alt="${title}" />
      <h2>${title}</h2>
      <p><strong>Release:</strong> ${movie.release_date || "N/A"}</p>
      <p><strong>Rating:</strong> ${voteAverage} (${movie.vote_count || 0} votes)</p>
      <p style="margin-top: 1rem;">${movie.overview || "No description available"}</p>
    `;
    modal.classList.remove("hidden");
  }

  modalClose.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });

  navTrending.addEventListener("click", () => {
    searchInput.value = "";
    loadTrendingMovies();
  });
});
