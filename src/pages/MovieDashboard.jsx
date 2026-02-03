import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { addDoc, collection } from "firebase/firestore";
import { toast } from "react-toastify";

export const MovieDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const movie = location.state?.movie;
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isBooking, setIsBooking] = useState(false);

  // Generate mock seats
  const rows = ['A', 'B', 'C', 'D'];
  const seatsPerRow = 8;
  const seatPrice = 12;

  const handleSeatClick = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const calculateTotal = () => selectedSeats.length * seatPrice;

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
      await addDoc(collection(db, "bookings"), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        movieId: movie?.id,
        movieTitle: movie?.title || "Unknown Movie",
        posterPath: movie?.poster_path || "",
        seats: selectedSeats,
        totalAmount: calculateTotal(),
        bookingDate: new Date().toISOString()
      });

      toast.success("Booking Confirmed! Enjoy the movie.");
      navigate("/mybookings");
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  if (!movie) return <div className="p-8 text-center text-xl">No movie selected. please go back to select a movie.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center border-b border-gray-700 pb-4">Booking Dashboard</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Movie Info */}
          <div className="md:w-1/3 bg-gray-800 p-6 rounded-xl h-fit">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full rounded-lg mb-4 shadow-lg"
            />
            <h2 className="text-xl font-bold mb-2">{movie.title}</h2>
            <div className="text-gray-400 text-sm space-y-2">
              <p>Runtime: {movie.runtime} min</p>
              <p>Rating: {movie.vote_average.toFixed(1)}/10</p>
            </div>
          </div>

          {/* Seat Selection */}
          <div className="md:w-2/3 bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-6 text-center">Select Seats</h3>

            {/* Screen Visual */}
            <div className="w-full h-8 bg-gray-600 mb-8 rounded-lg text-center text-xs flex items-center justify-center tracking-widest text-gray-300">SCREEN</div>

            <div className="flex flex-col gap-4 items-center">
              {rows.map(row => (
                <div key={row} className="flex gap-2">
                  {Array.from({ length: seatsPerRow }).map((_, idx) => {
                    const seatId = `${row}${idx + 1}`;
                    const isSelected = selectedSeats.includes(seatId);
                    return (
                      <button
                        key={seatId}
                        onClick={() => handleSeatClick(seatId)}
                        className={`w-8 h-8 rounded-t-lg transition-all ${isSelected
                            ? 'bg-red-600 scale-110'
                            : 'bg-white hover:bg-gray-300'
                          }`}
                        title={seatId}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-gray-700 pt-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-gray-400">Selected Seats:</p>
                  <p className="font-bold text-lg">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Price:</p>
                  <p className="font-bold text-2xl text-red-500">${calculateTotal()}</p>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className={`w-full py-3 rounded-lg font-bold text-lg transition ${isBooking
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-red-900/50'
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
