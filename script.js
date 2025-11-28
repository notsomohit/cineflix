document.addEventListener('DOMContentLoaded',()=>{

    const API_KEY = "";
    const formData = document.getElementById('search-box');
    const searchInput = document.getElementById('search-input');
    const resultsSection = document.getElementById('results');
    const hide = document.getElementById('hunt');
    formData.addEventListener('submit',(e)=>{
        e.preventDefault();
        const query = searchInput.value.trim();
        if(!query) return;
        hide.classList.add('hidden');
        fetchMovie(query);


    });
    async function fetchMovie(movieName){
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${movieName}`);
        const data = await response.json();
        console.log(data);
        displayMovieDetails(data.results);
    };


    function displayMovieDetails(movies){
        resultsSection.innerHTML = "";
        if(movies.length === 0){
            resultsSection.innerHTML = `
                <p class="error-message">No results found</p>
            `
        }
        movies.forEach((movie) => {
            let poster;

            if (movie.poster_path) {
                poster = "https://image.tmdb.org/t/p/w500" + movie.poster_path;
            }
            else if (movie.backdrop_path) {
                poster = "https://image.tmdb.org/t/p/w500" + movie.backdrop_path;
            }
            else {
                poster = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBdbYMPv3mY2vH6g3eMgKQWnNG5TYW9a6T1A&s";
            }
        const card = document.createElement("div");
        card.classList.add("movie-card");

        card.innerHTML = `
            <img src="${poster}" class="poster" />
            <h3>${movie.original_title}</h3>
            <p>${movie.overview || "No description available"}</p>
            <P><div class="details">release date: ${movie.release_date}</div></P>
            <P><div class="details">vote average: <span style="color:yellow">${movie.vote_average}<span></div></P>
        `;

        resultsSection.appendChild(card);

            
        });
    };

})