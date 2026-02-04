import React, { useEffect, useState } from "react";
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

  if (!movie) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow flex flex-col lg:flex-row gap-8">

        {/* LEFT COLUMN: TRAILER & DESC */}
        <div className="lg:w-2/3 space-y-8">
          {/* Trailer */}
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
            {movie.trailer_key ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${movie.trailer_key}?autoplay=1&mute=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              // Fallback if no trailer
              <div
                className="w-full h-full bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }}
              >
                <h1 className="text-4xl font-bold text-shadow-lg">{movie.title}</h1>
              </div>
            )}
          </div>

          {/* Details & Description */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
              <span>⭐ {movie.rating}/10</span>
              <span>📅 {movie.release_date}</span>
              {/* <span>🕒 {movie.duration} min</span> */}
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-500">Synopsis</h2>
            <p className="text-gray-300 leading-relaxed font-light text-lg">
              {movie.overview}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: NOW SHOWING GLASS BOX */}
        <div className="lg:w-1/3">
          <div className="sticky top-8">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 p-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold mb-6 text-center text-white drop-shadow-md">Now Showing</h2>

              {/* Theatre Selection */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-bold mb-2">Select Theatre</label>
                <select
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:border-red-500 transition"
                  value={selectedTheatre}
                  onChange={(e) => {
                    setSelectedTheatre(e.target.value);
                    setShowTimingsVisible(false); // Reset flow
                    setSelectedShowtime(null);
                  }}
                >
                  <option value="">-- Choose a Theatre --</option>
                  {theatres.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Show Timing Button / Timings */}
              <div className="min-h-[100px] flex items-center justify-center">
                {!showTimingsVisible ? (
                  <button
                    onClick={() => {
                      if (!selectedTheatre) return alert("Select a theatre first!");
                      setShowTimingsVisible(true);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 shadow-lg"
                    disabled={!selectedTheatre}
                  >
                    Show Timing
                  </button>
                ) : (
                  <div className="w-full animate-fadeIn">
                    <p className="text-center text-gray-300 mb-3 text-sm">Select a time:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {availableShowtimes.length > 0 ? availableShowtimes.map(show => (
                        <button
                          key={show.id}
                          onClick={() => setSelectedShowtime(show)}
                          className={`py-2 rounded border transition ${selectedShowtime?.id === show.id
                              ? 'bg-red-600 border-red-600 text-white'
                              : 'bg-transparent border-gray-500 text-gray-300 hover:border-white hover:text-white'
                            }`}
                        >
                          {show.time}
                        </button>
                      )) : (
                        <div className="col-span-2 text-center text-red-400">No shows available.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Buy Ticket Button */}
              <div className="mt-8 border-t border-white/20 pt-6">
                <button
                  onClick={handleBuyTicket}
                  className={`w-full py-4 rounded-xl font-black text-xl tracking-wider transition uppercase shadow-lg ${selectedShowtime
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white transform hover:-translate-y-1'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  disabled={!selectedShowtime}
                >
                  Buy Ticket
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
