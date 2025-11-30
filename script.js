document.addEventListener("DOMContentLoaded", () => {
  const formData = document.getElementById("search-box");
  const searchInput = document.getElementById("search-input");
  const resultsSection = document.getElementById("results");
  const hide = document.getElementById("hunt");
  const sectionTitle = document.getElementById("section-title");
  const navTrending = document.getElementById("nav-trending");

  loadTrendingMovies();

  formData.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;
    sectionTitle.classList.add("hidden");
    hide.classList.add("hidden");
    fetchMovie(query);
  });

  async function fetchMovie(movieName) {
    try {
      resultsSection.innerHTML = `
        <p class="loading-message">Searching for "${movieName}"...</p>
      `;

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

  function displayMovieDetails(movies) {
    movies.forEach(movie => {
      const v = movie.vote_average;
      const c = movie.vote_count;
      movie.weighted_score = (v * c) / (c + 500);
    });

    movies.sort((a, b) => b.weighted_score - a.weighted_score);
    resultsSection.innerHTML = "";

    if (!movies || movies.length === 0) {
      resultsSection.innerHTML = `
        <p class="error-message">No results found</p>
      `;
      return;
    }

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
      card.dataset.id = movie.id; // ⭐ IMPORTANT

      card.innerHTML = `
        <img src="${poster}" class="poster" alt="${movie.original_title}" />
        <h3>${movie.original_title}</h3>
        <p>${movie.overview || "No description available"}</p>
        <p><div class="details">release date: ${movie.release_date || "N/A"}</div></p>
        <p><div class="details">vote average: <span style="color:yellow">${movie.vote_average ?? "N/A"}</span></div></p>

        <div class="trailer-popup"></div> <!-- ⭐ ADDED -->
      `;

      resultsSection.appendChild(card);
    });

    attachTrailerHover(); //new
  }

  async function loadTrendingMovies() {
    try {
      sectionTitle.textContent = "Trending";
      sectionTitle.classList.remove("hidden");
      resultsSection.innerHTML = `
        <p class="loading-message">Loading trending movies...</p>
      `;

      const res = await fetch("/api/trending");
      if (!res.ok) throw new Error("Failed trending fetch");

      const data = await res.json();
      displayMovieDetails(data.results || []);
    } catch (error) {
      console.error(error);
      resultsSection.innerHTML = `<p class="error-message">Failed to load trending movies.</p>`;
    }
  }

  navTrending.addEventListener("click", () => {
    searchInput.value = "";
    hide.classList.remove("hidden");
    loadTrendingMovies();
  });

  // fetch trailer 
  async function getTrailer(id) {
    try {
      const res = await fetch(`/api/trailer?id=${id}`);
      const data = await res.json();

      const trailer = data.results.find(
        vid => vid.type === "Trailer" && vid.site === "YouTube"
      );

      return trailer ? trailer.key : null;
    } catch (error) {
      console.error("Trailer fetch failed", error);
      return null;
    }
  }

  //  handle hover popup
  function attachTrailerHover() {
    const cards = document.querySelectorAll(".movie-card");

    cards.forEach(card => {
      const popup = card.querySelector(".trailer-popup");
      const movieId = card.dataset.id;
      let loaded = false;

      card.addEventListener("mouseenter", async () => {
        popup.style.display = "block";

        if (!loaded) {
          const key = await getTrailer(movieId);
          if (key) {
            popup.innerHTML = `
              <iframe
                width="300" height="170"
                src="https://www.youtube.com/embed/${key}?autoplay=1&mute=1&controls=0"
                allow="autoplay"
                frameborder="0">
              </iframe>
            `;
          }
          loaded = true;
        }
      });

      card.addEventListener("mouseleave", () => {
        popup.style.display = "none";
      });
    });
  }
});
