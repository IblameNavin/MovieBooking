import React, { useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Footer } from "../components/Footer";

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!auth.currentUser) return;

      try {
        const q = query(
          collection(db, "bookings"),
          where("userId", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const bookingData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(bookingData);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8 text-center">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center text-gray-600 text-xl mt-12">
            No bookings found. Start exploring movies!
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row gap-6 hover:shadow-lg transition"
              >
                <div className="flex-shrink-0 w-32 h-48 bg-gray-200 rounded-lg overflow-hidden">
                  {booking.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${booking.posterPath}`}
                      alt={booking.movieTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                  )}
                </div>

                <div className="flex-grow">
                  <h2 className="text-2xl font-bold mb-2">{booking.movieTitle}</h2>
                  <p className="text-gray-500 text-sm mb-4">Booked on: {new Date(booking.bookingDate).toLocaleDateString()}</p>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Seats</p>
                      <p className="font-medium">{booking.seats.join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Total Paid</p>
                      <p className="font-medium text-red-600">${booking.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Booking ID</p>
                      <p className="font-medium text-xs text-gray-600 break-all">{booking.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
