//Data

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
  params: {
    'api_key': API_KEY,
  },
});
function likedMoviesList(){
  const item = JSON.parse(localStorage.getItem('liked_movies'));
  let movies;

  if (item) {
    movies = item;
  } else {
    movies = {};
  }
  return movies; 
}
function likeMovie(movie){
  //movie.id
  const likedMovies = likedMoviesList();

  if (likedMovies[movie.id]) {
    likedMovies[movie.id] = undefined;
    //console.log('la pelicula ya se encontraba en el LS, deberiamos retirarla');
    //removerla
  } else {
    likedMovies[movie.id] = movie;
    //console.log('la pelicula no se encontraba en el LS, deberiamos agregarla');
    //agregar la peli a ls
  }

  localStorage.setItem('liked_movies',JSON.stringify(likedMovies));
}


// Utils

const lazyLoader = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {

      // console.log(entry.target.setAttribute)
      const url = entry.target.getAttribute('data-img')
      //console.log(entry.target)
      entry.target.setAttribute('src', url);
    }
  });
});

function createMovies(movies, container, { lazyLoad = false, clean = true } = {}) {
  if (clean) {
    container.innerHTML = '';
  }
  //container.innerHTML = '';

  movies.forEach(movie => {
    const movieContainer = document.createElement('div');
    movieContainer.classList.add('movie-container');
    movieContainer

    const movieImg = document.createElement('img');
    movieImg.classList.add('movie-img');
    movieImg.setAttribute('alt', movie.title);
    movieImg.setAttribute(
      lazyLoad ? 'data-img' : 'src',
      'https://image.tmdb.org/t/p/w300' + movie.poster_path,
    );
    movieImg.addEventListener('click', () => {
      location.hash = '#movie=' + movie.id;
    });
    movieImg.addEventListener('error', () => {
      movieImg.setAttribute('src', 'https://scontent.fclo7-1.fna.fbcdn.net/v/t1.6435-9/97247836_249085386439697_6517225843587022848_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=8bfeb9&_nc_eui2=AeH8d4lrgBWGnGFKIlfUDivhSm2FpYByltxKbYWlgHKW3CRGO76i28Jsu8Dmmtl7UoZ3uc0E9iDD7LordkoZHXo4&_nc_ohc=BHdcsdgx7j4AX-FRbBS&tn=PNxswDJ9Mvtdc5Hc&_nc_ht=scontent.fclo7-1.fna&oh=00_AT_SFK9Lh--WvDmtUH8iI0jbwEEGaT2aJzXbcSFdPOtclg&oe=62F431D5',);
    });

    const movieBtn = document.createElement('button');
    movieBtn.classList.add('movie-btn');
    movieBtn.addEventListener('click', () => {
      movieBtn.classList.toggle('movie-btn--liked');
      //se tiene que agregar la pelicula en LS
      likeMovie(movie);
    });
    //lazyLoader.observe(movieImg);

    if (lazyLoad) {
      lazyLoader.observe(movieImg);
    }
    movieContainer.appendChild(movieImg);
    movieContainer.appendChild(movieBtn);
    container.appendChild(movieContainer);

  });
}

function createCategories(categories, container) {
  container.innerHTML = "";

  categories.forEach(category => {
    const categoryContainer = document.createElement('div');
    categoryContainer.classList.add('category-container');

    const categoryTitle = document.createElement('h3');
    categoryTitle.classList.add('category-title');
    categoryTitle.setAttribute('id', 'id' + category.id);
    categoryTitle.addEventListener('click', () => {
      location.hash = `#category=${category.id}-${category.name}`;
    });
    const categoryTitleText = document.createTextNode(category.name);

    categoryTitle.appendChild(categoryTitleText);
    categoryContainer.appendChild(categoryTitle);
    container.appendChild(categoryContainer);
  });
}

// Llamados a la API

async function getTrendingMoviesPreview() {
  const { data } = await api('trending/movie/day');
  const movies = data.results;
  console.log(movies)

  createMovies(movies, trendingMoviesPreviewList, true);
}

async function getCategoriesPreview() {
  const { data } = await api('genre/movie/list');
  const categories = data.genres;

  createCategories(categories, categoriesPreviewList);
}

async function getMoviesByCategory(id) {
  const { data } = await api('discover/movie', {
    params: {
      with_genres: id,
    },
  });
  const movies = data.results;
  maxPage = data.total_pages;

  createMovies(movies, genericSection, {lazyLoad: true,});
}

function getPaginatedMoviesByCategory(id) {
  return async function () {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
    const pageIsNotMax = page < maxPage;

    if (scrollIsBottom && pageIsNotMax) {
      page++;
      const { data } = await api('discover/movie', {
        params: {
          with_genres: id,
          page,
        },
      });
      const movies = data.results;
      maxPage = data.total_pages;
    
      createMovies(movies, genericSection, { lazyLoad: true, clean: false },
      );
    }    
  }

  // const btnLoadMore = document.createElement('button');
  // btnLoadMore.innerText = 'Cargar más';
  // btnLoadMore.addEventListener('click', getPaginatedTrendingMovies);
  // genericSection.appendChild(btnLoadMore);
}

async function getMoviesBySearch(query) {
  const { data } = await api('search/movie', {
    params: {
      query,
    },
  });
  const movies = data.results;
  maxPage = data.total_pages;
  console.log(maxPage);

  createMovies(movies, genericSection);
}

function getPaginatedMoviesBySearch(query) {
  return async function () {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
    const pageIsNotMax = page < maxPage;
    if (scrollIsBottom && pageIsNotMax) {
      page++;
      const { data } = await api('search/movie', {
        params: {
          query,
          page,
        },
      });
      const movies = data.results;
    
      createMovies(movies, genericSection, { lazyLoad: true, clean: false },
      );
    }    
  }

  // const btnLoadMore = document.createElement('button');
  // btnLoadMore.innerText = 'Cargar más';
  // btnLoadMore.addEventListener('click', getPaginatedTrendingMovies);
  // genericSection.appendChild(btnLoadMore);
}

async function getTrendingMovies() {
  const { data } = await api('trending/movie/day');
  const movies = data.results;
  maxPage = data.total_pages;

  createMovies(movies, genericSection, { lazyLoad: true, clean: true });

  // const btnLoadMore = document.createElement('button');
  // btnLoadMore.innerText = 'Cargar más';
  // btnLoadMore.addEventListener('click', getPaginatedTrendingMovies);
  // genericSection.appendChild(btnLoadMore);
}
//window.addEventListener('sroll', getPaginatedTrendingMovies);

async function getPaginatedTrendingMovies() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
  const pageIsNotMax = page < maxPage;
  if (scrollIsBottom && pageIsNotMax) {
    page++;
    const { data } = await api('trending/movie/day', {
      params: {
        page,
      },
    });
    const movies = data.results;
    //console.log(data)

    createMovies(movies, genericSection, { lazyLoad: true, clean: false },
    );
  }

  // const btnLoadMore = document.createElement('button');
  // btnLoadMore.innerText = 'Cargar más';
  // btnLoadMore.addEventListener('click', getPaginatedTrendingMovies);
  // genericSection.appendChild(btnLoadMore);
}

async function getMovieById(id) {
  const { data: movie } = await api('movie/' + id);

  const movieImgUrl = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
  console.log(movieImgUrl)
  headerSection.style.background = `
      linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.35) 19.27%,
        rgba(0, 0, 0, 0) 29.17%
      ),
      url(${movieImgUrl})
    `;

  movieDetailTitle.textContent = movie.title;
  movieDetailDescription.textContent = movie.overview;
  movieDetailScore.textContent = movie.vote_average;

  createCategories(movie.genres, movieDetailCategoriesList);
  getRelatedMovieById(id);
}


async function getRelatedMovieById(id) {
  const { data } = await api(`movie/${id}/recommendations`);
  const relatedMovies = data.results;

  createMovies(relatedMovies, relatedMoviesContainer);
}