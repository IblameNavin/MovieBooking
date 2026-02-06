import React, { useState, useEffect } from "react";
import { Skeleton } from "../components/Skeleton";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
import { toast } from "react-toastify";

export const MovieDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { movie, showtime } = location.state || {}; // Expect movie and showtime

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(true);

  useEffect(() => {
    if (!movie || !showtime) {
      toast.error("Please select a movie and showtime first.");
      navigate("/movies");
      return;
    }

    const fetchSeats = async () => {
      try {
        const q = query(
          collection(db, "seats"),
          where("showTimeId", "==", showtime.id)
        );
        const snapshot = await getDocs(q);
        const seatData = snapshot.docs.map(doc => ({
          docId: doc.id,
          ...doc.data()
        }));

        // Sort seats: A1, A2, ..., B1, B2...
        seatData.sort((a, b) => {
          if (a.seatId < b.seatId) return -1;
          if (a.seatId > b.seatId) return 1;
          return 0;
        });

        setSeats(seatData);
      } catch (error) {
        console.error("Error fetching seats:", error);
        toast.error("Could not load seats.");
      } finally {
        setLoadingSeats(false);
      }
    };

    fetchSeats();
  }, [movie, showtime, navigate]);

  const handleSeatClick = (seat) => {
    if (seat.status !== 'available') return;

    const isSelected = selectedSeats.find(s => s.docId === seat.docId);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.docId !== seat.docId));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => {
      // Use showtime price if available, else standard logic
      const price = showtime?.price || (seat.type === 'VIP' ? 25 : 12);
      return total + price;
    }, 0);
  };

  const handleConfirmBooking = async () => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to book.");
      navigate("/login");
      return;
    }

    if (selectedSeats.length === 0) {
      toast.warn("Please select at least one seat.");
      return;
    }

    setIsBooking(true);
    try {
      // 0. Check for duplicate booking
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", auth.currentUser.uid),
        where("movieId", "==", movie.id)
      );
      const existingBookings = await getDocs(q);

      if (!existingBookings.empty) {
        toast.error("You have already booked tickets for this movie!");
        setIsBooking(false);
        return;
      }

      const batch = writeBatch(db);

      // 1. Create Booking Record
      const bookingRef = doc(collection(db, "bookings"));
      batch.set(bookingRef, {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        movieId: movie.id,
        movieTitle: movie.title,
        theatreId: showtime.theatreId,
        theatreName: showtime.theatreName,
        showtimeId: showtime.id,
        showtimeTime: showtime.time,
        posterPath: movie.poster_path || "",
        seats: selectedSeats.map(s => s.seatId),
        totalAmount: calculateTotal(),
        bookingDate: new Date().toISOString()
      });

      // 2. Update status of each seat to 'booked'
      selectedSeats.forEach(seat => {
        const seatRef = doc(db, "seats", seat.docId);
        batch.update(seatRef, {
          status: 'booked',
          bookedBy: auth.currentUser.uid,
          bookingId: bookingRef.id
        });
      });

      await batch.commit();

      toast.success("Booking Confirmed! Enjoy the movie.");
      navigate("/mybookings");
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  if (!movie || !showtime) return null;

  // Group seats by row for display
  const rows = {};
  seats.forEach(seat => {
    const row = seat.seatId.charAt(0);
    if (!rows[row]) rows[row] = [];
    rows[row].push(seat);
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-red-500 selection:text-white pb-12">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-md sticky top-0 z-50 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition flex items-center gap-2 cursor-pointer"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold tracking-wide uppercase">Select Seats</h1>
          <div className="w-16"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 mt-8 flex flex-col lg:flex-row gap-8">

        {/* LEFT: SEAT MAP */}
        <div className="flex-1 bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-white/5 blur-3xl rounded-full pointer-events-none"></div>

          {/* SCREEN */}
          <div className="flex flex-col items-center mb-16 relative">
            <div
              className="w-3/4 h-16 bg-gradient-to-b from-white/20 to-transparent shadow-[0_20px_50px_rgba(255,255,255,0.1)] rounded-t-full transform perspective-lg rotate-x-12"
              style={{ clipPath: "polygon(0 0, 100% 0, 90% 100%, 10% 100%)" }}
            ></div>
            <div className="text-gray-500 text-xs tracking-[0.5em] mt-2 font-bold opacity-50">SCREEN</div>
          </div>

          {/* SEATS GRID */}
          <div className="flex flex-col gap-4 items-center justify-center mb-12 overflow-x-auto pb-8 custom-scrollbar">
            {loadingSeats ? (
              <div className="flex flex-col gap-4 items-center justify-center mb-12 animate-pulse">
                {/* Skeleton Rows */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <Skeleton className="w-6 h-6 rounded bg-gray-700" />
                    <div className="flex gap-2">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <Skeleton key={j} className="w-8 h-8 md:w-12 md:h-12 rounded-t-2xl rounded-b-lg bg-gray-700" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              Object.keys(rows).sort().map(row => (
                <div key={row} className="flex items-center gap-6">
                  <div className="w-6 text-gray-500 font-bold text-sm transform translate-y-1">{row}</div>
                  <div className="flex gap-2 sm:gap-4">
                    {rows[row].map(seat => {
                      const isSelected = selectedSeats.find(s => s.docId === seat.docId);
                      const isBooked = seat.status !== 'available';

                      // Seat Styles
                      let seatClass = "bg-gray-700 hover:bg-gray-600 hover:scale-110 text-gray-400 shadow-md"; // Default

                      if (isBooked) {
                        seatClass = "bg-gray-800 cursor-not-allowed opacity-40 shadow-none ring-1 ring-gray-700";
                      } else if (isSelected) {
                        seatClass = "bg-red-600 text-white scale-110 shadow-[0_0_15px_rgba(220,38,38,0.6)] ring-2 ring-red-400 z-10";
                      } else if (seat.type === 'VIP') {
                        seatClass = "bg-purple-900/80 border border-purple-500/50 hover:bg-purple-700 text-purple-200 shadow-purple-900/20";
                      }

                      return (
                        <div key={seat.docId} className="relative group">
                          <button
                            onClick={() => handleSeatClick(seat)}
                            disabled={isBooked}
                            className={`
                              w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 
                              rounded-t-2xl rounded-b-lg 
                              transition-all duration-300 ease-out 
                              flex items-center justify-center 
                              text-[10px] md:text-xs font-bold
                              cursor-pointer
                              ${seatClass}
                            `}
                          >
                            {/* Armrests visual trick */}
                            <div className={`absolute -left-1 bottom-1 w-1 h-4 rounded-full ${isSelected ? 'bg-red-700' : isBooked ? 'hidden' : 'bg-black/20'}`}></div>
                            <div className={`absolute -right-1 bottom-1 w-1 h-4 rounded-full ${isSelected ? 'bg-red-700' : isBooked ? 'hidden' : 'bg-black/20'}`}></div>

                            {seat.seatId.substring(1)}
                          </button>

                          {/* Tooltip */}
                          {!isBooked && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-20">
                              {seat.type} • ${showtime.price || (seat.type === 'VIP' ? 25 : 12)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* LEGEND */}
          <div className="flex flex-wrap justify-center gap-6 border-t border-gray-700/50 pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-5 h-5 bg-gray-700 rounded-t-lg"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-5 h-5 bg-red-600 rounded-t-lg shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-5 h-5 bg-purple-900/80 border border-purple-500/50 rounded-t-lg"></div>
              <span>VIP</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-5 h-5 bg-gray-800 opacity-50 border border-gray-700 rounded-t-lg"></div>
              <span>Booked</span>
            </div>
          </div>
        </div>

        {/* RIGHT: BOOKING SUMMARY */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          <div className="bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-700">
            <div className="flex gap-4 mb-6">
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className="w-24 h-36 object-cover rounded-xl shadow-lg"
              />
              <div>
                <h3 className="text-xl font-bold text-white mb-1 leading-tight">{movie.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{showtime.theatreName}</p>
                <div className="inline-block bg-gray-700/50 px-3 py-1 rounded-lg border border-gray-600 text-xs text-gray-300">
                  {new Date().toLocaleDateString()} • {showtime.time}
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-600 my-4"></div>

            <div className="space-y-3">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Tickets ({selectedSeats.length})</span>
                <span>$ {calculateTotal()}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Booking Fee</span>
                <span>$ {selectedSeats.length > 0 ? '2.00' : '0.00'}</span>
              </div>
              <div className="border-t border-gray-600 pt-3 mt-3 flex justify-between items-center text-white">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold text-red-500">$ {selectedSeats.length > 0 ? calculateTotal() + 2 : 0}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmBooking}
              disabled={isBooking || selectedSeats.length === 0}
              className={`
                mt-8 w-full py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-300 
                shadow-lg flex items-center justify-center gap-2 cursor-pointer
                ${isBooking || selectedSeats.length === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 hover:shadow-red-500/30 hover:-translate-y-1'
                }
              `}
            >
              {isBooking ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
            <p className="text-xs text-gray-500">
              By proceeding, you agree to our Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
