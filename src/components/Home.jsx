import React, { useEffect, useState } from "react";
import { Footer } from "./Footer";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Home = () => {
  const [movies, setMovies] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const API_URL = "https://api.themoviedb.org/3/discover/movie?api_key=80d491707d8cf7b38aa19c7ccab0952f";
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w1280";
  const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        // Take first 16 movies
        setMovies(data.results.slice(0, 16));
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, []);

  // Carousel Auto-slide logic
  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 5); // Cycle through top 5 movies
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, [movies]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 5);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 5) % 5);
  };

  if (movies.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Hero Section with Carousel */}
      <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
        {movies.slice(0, 5).map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
          >
            <img
              src={`${IMAGE_BASE_URL}${movie.backdrop_path}`}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            {/* Hero Content */}
            <div className="absolute bottom-16 left-8 md:left-16 text-white max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                Welcome to CineBook
              </h1>
              <p className="text-lg md:text-xl mb-6 drop-shadow-md">
                {movie.title}
              </p>
              <div className="flex gap-4">
                <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition transform hover:scale-105 shadow-lg">
                  Book Now
                </button>
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-8 py-3 rounded-full font-semibold transition border border-white/30">
                  See Locations
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm text-white transition"
        >
          <ChevronLeft size={32} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm text-white transition"
        >
          <ChevronRight size={32} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${i === currentSlide ? "bg-red-600 w-8" : "bg-white/50"
                }`}
            />
          ))}
        </div>
      </div>

      {/* Popular Movies Section */}
      <main className="container mx-auto px-4 py-12 flex-grow">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 border-l-4 border-red-600 pl-4">
          Popular Movies
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 cursor-pointer"
            >
              <div className="relative overflow-hidden aspect-[2/3]">
                <img
                  src={`${POSTER_BASE_URL}${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                  <button className="bg-red-600 text-white px-6 py-2 rounded-full font-semibold transform scale-90 group-hover:scale-100 transition duration-300 shadow-lg">
                    View Details
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold mb-1 truncate" title={movie.title}>
                  {movie.title}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {movie.release_date}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Rating: {movie.vote_average}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};
