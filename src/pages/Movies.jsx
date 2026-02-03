import React, { useEffect, useState } from "react";
import { Footer } from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";

export const Movies = () => {
  const [movies, setMovies] = useState([]);
  const API_URL = "https://api.themoviedb.org/3/discover/movie?api_key=80d491707d8cf7b38aa19c7ccab0952f";
  const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setMovies(data.results);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };
    fetchMovies();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">All Movies</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition duration-300"
            >
              <div className="relative overflow-hidden aspect-[2/3]">
                <img
                  src={`${POSTER_BASE_URL}${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col gap-3 items-center justify-center">
                  <button
                    onClick={() => navigate(`/movies/${movie.id}`)}
                    className="bg-transparent border-2 border-white text-white px-6 py-2 rounded-full font-bold hover:bg-white hover:text-black transition"
                  >
                    View Details
                  </button>
                  <Link
                    to="/moviedashboard"
                    state={{ movie }}
                    className="bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition"
                  >
                    Book Now
                  </Link>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold mb-1 truncate" title={movie.title}>
                  {movie.title}
                </h3>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{movie.release_date}</span>
                  <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                    ★ {movie.vote_average}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};
