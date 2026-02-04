import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { addDoc, collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
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
  // Assume seatId is like "A1", "B2"
  const rows = {};
  seats.forEach(seat => {
    const row = seat.seatId.charAt(0);
    if (!rows[row]) rows[row] = [];
    rows[row].push(seat);
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold mb-8 text-center border-b border-gray-700 pb-4">
          Complete Your Booking
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Movie Info Sidebar */}
          <div className="lg:w-1/3 bg-gray-800 p-6 rounded-xl h-fit shadow-xl">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full rounded-lg mb-4 shadow-lg"
            />
            <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
            <div className="text-gray-400 space-y-2 text-sm border-t border-gray-700 pt-4 mt-4">
              <p><span className="text-white font-semibold">Theatre:</span> {showtime.theatreName}</p>
              <p><span className="text-white font-semibold">Time:</span> {showtime.time}</p>
              <p><span className="text-white font-semibold">Price per Ticket:</span> ${showtime.price}</p>
            </div>
          </div>

          {/* Seat Selection */}
          <div className="lg:w-2/3 bg-gray-800 p-6 rounded-xl shadow-xl flex flex-col">
            <h3 className="text-xl font-bold mb-6 text-center text-gray-200">Select Seats</h3>

            {/* Screen Visual */}
            <div className="w-full h-8 bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 mb-12 rounded-lg text-center text-xs flex items-center justify-center tracking-[0.5em] text-black font-bold shadow-lg opacity-80 shadow-gray-600/50">
              SCREEN
            </div>

            {loadingSeats ? (
              <div className="text-center py-10">Loading Seats...</div>
            ) : (
              <div className="flex flex-col gap-3 items-center mb-8 overflow-x-auto pb-4">
                {Object.keys(rows).sort().map(row => (
                  <div key={row} className="flex items-center gap-4">
                    <div className="w-6 text-center font-bold text-gray-500">{row}</div>
                    <div className="flex gap-2">
                      {rows[row].map(seat => {
                        const isSelected = selectedSeats.find(s => s.docId === seat.docId);
                        const isBooked = seat.status !== 'available';

                        let seatColor = "bg-white hover:bg-gray-300"; // default available
                        if (isBooked) seatColor = "bg-gray-600 cursor-not-allowed opacity-50";
                        if (isSelected) seatColor = "bg-red-600 text-white scale-110 shadow-lg shadow-red-500/50";

                        return (
                          <button
                            key={seat.docId}
                            onClick={() => handleSeatClick(seat)}
                            disabled={isBooked}
                            className={`w-8 h-8 md:w-10 md:h-10 rounded-t-lg transition-all text-xs font-semibold flex items-center justify-center ${seatColor}`}
                            title={`Row ${row}, Seat ${seat.seatId.substring(1)} - ${seat.type}`}
                          >
                            {seat.seatId.substring(1)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto border-t border-gray-700 pt-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Selected Seats:</p>
                  <p className="font-bold text-lg text-white">
                    {selectedSeats.length > 0 ? selectedSeats.map(s => s.seatId).join(', ') : '-'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Total Price:</p>
                  <p className="font-bold text-3xl text-red-500">${calculateTotal()}</p>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={isBooking || selectedSeats.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-xl uppercase tracking-widest transition shadow-lg ${isBooking || selectedSeats.length === 0
                    ? 'bg-gray-600 cursor-not-allowed opacity-70'
                    : 'bg-red-600 hover:bg-red-700 hover:shadow-red-900/50 transform hover:-translate-y-1'
                  }`}
              >
                {isBooking ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
