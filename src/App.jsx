import React, { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";

// Use your backend URL from .env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// TMDB API setup
const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSerachTerm] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Debounce search input
  useDebounce(() => setDebouncedSerachTerm(searchTerm), 500, [searchTerm]);

  // Fetch movies from TMDB
  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error("Failed to fetch movies");

      const data = await response.json();
      setMovieList(data.results || []);
    } catch (error) {
      setErrorMessage("Error fetching movies");
      setMovieList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update search count in your Azure backend
  const updateSearchCount = async () => {
    try {
      await fetch(`${BACKEND_URL}/users`, { method: "POST" }); // assuming POST increments count
    } catch (err) {
      console.error("Error updating search count:", err);
    }
  };

  // Call updateSearchCount whenever movie search happens
  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchMovies(debouncedSearchTerm);
      updateSearchCount();
    } else {
      fetchMovies();
    }
  }, [debouncedSearchTerm]);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> you&apos;ll enjoy
            without the hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        <section className="all-movies">
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
