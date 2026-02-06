import React, { useEffect, useState } from "react";
import { Skeleton } from "../components/Skeleton";
import { useParams, useNavigate } from "react-router-dom";
import { Footer } from "../components/Footer";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";

export const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [theatres, setTheatres] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  const [selectedTheatre, setSelectedTheatre] = useState("");
  const [showTimingsVisible, setShowTimingsVisible] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState(null);

  const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Movie
        const movieRef = doc(db, "movies", id);
        const movieSnap = await getDoc(movieRef);
        if (movieSnap.exists()) {
          setMovie(movieSnap.data());
        } else {
          console.log("No such movie!");
        }

        // 2. Fetch Theatres
        const theatreSnap = await getDocs(collection(db, "theatres"));
        const theatreList = theatreSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTheatres(theatreList);

        // 3. Fetch Showtimes for this movie
        const q = query(collection(db, "showtimes"), where("movieId", "==", id)); // ID is string in my seed
        // Note: Check if ID type matches (string vs number). In seed it is string.
        const showtimeSnap = await getDocs(q);
        const showtimeList = showtimeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setShowtimes(showtimeList);

      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };
    fetchData();
  }, [id]);

  const handleBuyTicket = () => {
    if (!selectedShowtime) {
      alert("Please select a showtime first!");
      return;
    }
    // Navigate to booking page with context
    navigate("/moviedashboard", {
      state: {
        movie,
        showtime: selectedShowtime
      }
    });
  };

  // Filter showtimes for selected theatre
  const availableShowtimes = showtimes.filter(s => s.theatreId === selectedTheatre);

  if (!movie) return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col pb-12">
      {/* Skeleton Hero */}
      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
        <div className="lg:w-2/3 space-y-10">
          <Skeleton className="aspect-video w-full rounded-3xl" />
          <div className="bg-gray-800/60 p-8 rounded-3xl border border-gray-700/50 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-full" />
            </div>
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
        <div className="lg:w-1/3 min-w-[350px]">
          <Skeleton className="h-[600px] w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Hero Section / Backdrop (Optional: could add a faint backdrop image behind everything) */}
      <div
        className="fixed inset-0 z-0 opacity-20 pointer-events-none bg-cover bg-center mix-blend-overlay"
        style={{ backgroundImage: `url(${POSTER_BASE_URL}${movie.backdrop_path})` }}
      ></div>

      <div className="container mx-auto px-4 py-12 grow flex flex-col lg:flex-row gap-12 relative z-10">

        {/* LEFT COLUMN: TRAILER & DESC */}
        <div className="lg:w-2/3 space-y-10">
          {/* Trailer */}
          <div className="relative group aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            {movie.trailer_key ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${movie.trailer_key}?autoplay=1&mute=1&loop=1&playlist=${movie.trailer_key}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              // Fallback if no trailer
              <div
                className="w-full h-full bg-cover bg-center flex items-center justify-center transform transition duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }}
              >
                <div className="bg-black/40 absolute inset-0 backdrop-blur-sm"></div>
                <h1 className="text-5xl font-bold text-white drop-shadow-2xl relative z-10">{movie.title}</h1>
              </div>
            )}
          </div>

          {/* Details & Description */}
          <div className="bg-gray-800/60 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-gray-700/50">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{movie.title}</h1>

            <div className="flex flex-wrap gap-6 text-sm sm:text-base text-gray-300 mb-8 items-center">
              <span className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20">
                ⭐ <span className="font-bold">{movie.rating}</span>/10
              </span>
              <span className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                📅 {movie.release_date}
              </span>
              {/* Placeholder for duration if available */}
              {/* <span className="flex items-center gap-2 bg-gray-700/50 px-3 py-1 rounded-full">
                🕒 124 min
              </span> */}
            </div>

            <h2 className="text-2xl font-bold mb-4 text-red-500 flex items-center gap-2">
              Synopsis
              <div className="h-0.5 w-12 bg-red-500/50 rounded-full"></div>
            </h2>
            <p className="text-gray-300 leading-relaxed font-light text-lg text-justify">
              {movie.overview}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: NOW SHOWING GLASS BOX */}
        <div className="lg:w-1/3 min-w-[350px]">
          <div className="sticky top-8">
            <div className="relative overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">

              {/* Decorative gradient blob */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

              <h2 className="text-3xl font-bold mb-8 text-center text-white drop-shadow-md relative z-10">
                Book Tickets
              </h2>

              {/* Theatre Selection */}
              <div className="mb-8 relative z-10">
                <label className="block text-gray-300 text-sm font-bold mb-3 ml-1">Select Theatre</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-gray-900/60 text-white border border-gray-600 rounded-xl p-4 pr-10 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all cursor-pointer shadow-inner"
                    value={selectedTheatre}
                    onChange={(e) => {
                      setSelectedTheatre(e.target.value);
                      setShowTimingsVisible(false); // Reset flow
                      setSelectedShowtime(null);
                    }}
                  >
                    <option value="">-- Choose a Cinema --</option>
                    {theatres.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* Show Timing Button / Timings */}
              <div className="min-h-[120px] relative z-10">
                {!showTimingsVisible ? (
                  <button
                    onClick={() => {
                      if (!selectedTheatre) return alert("Select a theatre first!");
                      setShowTimingsVisible(true);
                    }}
                    className={`
                      w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-300
                      ${!selectedTheatre
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transform hover:scale-[1.02] cursor-pointer'
                      }
                    `}
                    disabled={!selectedTheatre}
                  >
                    <span>View Showtimes</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </button>
                ) : (
                  <div className="w-full animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-gray-300 text-sm font-semibold">Select ShowTime</p>
                      <button
                        onClick={() => setShowTimingsVisible(false)}
                        className="text-xs text-gray-500 hover:text-white underline cursor-pointer"
                      >
                        Change Theatre
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar p-1">
                      {availableShowtimes.length > 0 ? availableShowtimes.map(show => (
                        <button
                          key={show.id}
                          onClick={() => setSelectedShowtime(show)}
                          className={`
                            py-3 px-2 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer
                            ${selectedShowtime?.id === show.id
                              ? 'bg-red-600 border-red-500 text-white shadow-lg scale-105 shadow-red-900/50'
                              : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-400 hover:text-white'
                            }
                          `}
                        >
                          {show.time}
                        </button>
                      )) : (
                        <div className="col-span-2 py-6 text-center text-red-300 bg-red-900/10 rounded-lg border border-red-900/30 text-sm">
                          No shows available today.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Buy Ticket Button */}
              <div className="mt-8 border-t border-white/10 pt-8 relative z-10">
                <button
                  onClick={handleBuyTicket}
                  disabled={!selectedShowtime}
                  className={`
                    w-full py-4 rounded-xl font-black text-xl tracking-widest uppercase transition-all duration-300 shadow-xl
                    ${selectedShowtime
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white transform hover:-translate-y-1 hover:shadow-red-500/40 cursor-pointer'
                      : 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600/30'
                    }
                  `}
                >
                  Proceed to Seat
                </button>
                {selectedShowtime && (
                  <p className="text-center text-xs text-gray-400 mt-3 animate-pulse">
                    ${selectedShowtime.price} per ticket
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
