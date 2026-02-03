import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Footer } from "../components/Footer";

export const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const API_KEY = "80d491707d8cf7b38aa19c7ccab0952f";
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w1280";
  const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`
        );
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };
    fetchMovie();
  }, [id]);

  if (!movie) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Backdrop Hero */}
      <div
        className="relative w-full h-[400px] md:h-[500px] bg-cover bg-center"
        style={{ backgroundImage: `url(${IMAGE_BASE_URL}${movie.backdrop_path})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white container mx-auto">
          <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
          <p className="text-lg opacity-90 italic">{movie.tagline}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-12 flex-grow">
        <div className="flex-shrink-0 w-full md:w-1/3 lg:w-1/4">
          <img
            src={`${POSTER_BASE_URL}${movie.poster_path}`}
            alt={movie.title}
            className="w-full rounded-xl shadow-2xl"
          />
        </div>

        <div className="flex-grow">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Overview</h2>
          <p className="text-gray-600 leading-relaxed mb-6">{movie.overview}</p>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-semibold text-gray-700">Release Date</h3>
              <p>{movie.release_date}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Rating</h3>
              <p className="text-yellow-600 font-bold">{movie.vote_average?.toFixed(1)} / 10</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Runtime</h3>
              <p>{movie.runtime} minutes</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Genres</h3>
              <p>{movie.genres?.map(g => g.name).join(", ")}</p>
            </div>
          </div>

          <Link
            to="/moviedashboard"
            state={{ movie }} // Pass movie data to dashboard
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition shadow-lg transform hover:-translate-y-1"
          >
            Book Tickets
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};
