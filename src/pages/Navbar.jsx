import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

export const Navbar = () => {
  const navigate = useNavigate();
  const token = Cookies.get("token");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    auth.signOut();
    navigate("/login");
  };

  return (
    <>
      <div className="flex justify-around items-center p-6 bg-black text-white shadow-md">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>CineBook</h1>
        <ul className="flex gap-8 font-medium items-center">
          <li>
            <Link to="/" className="hover:text-red-500 transition">Home</Link>
          </li>
          <li>
            <Link to="/movies" className="hover:text-red-500 transition">Movies</Link>
          </li>
          {token && (
            <li>
              <Link to="/mybookings" className="hover:text-red-500 transition">My Bookings</Link>
            </li>
          )}
          <li>
            <Link to="/admin" className="hover:text-red-500 transition">Admin</Link>
          </li>
          <li>
            <Link to="/moviedashboard" className="hover:text-red-500 transition">Dashboard</Link>
          </li>
        </ul>

        <ul className="flex gap-4 items-center">
          {!token ? (
            <>
              <li>
                <Link to="/login" className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition">Login</Link>
              </li>
              <li>
                <Link to="/register" className="border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-black transition">Register</Link>
              </li>
            </>
          ) : (
            <>
              {user && (
                <li className="flex items-center gap-2 mr-2">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-gray-500" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-xs font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-gray-300 hidden md:block">{user.email}</span>
                </li>
              )}
              <li>
                <button onClick={handleLogout} className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition text-sm">Logout</button>
              </li>
            </>
          )}
        </ul>
      </div>
    </>
  );
};
