import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export const Navbar = () => {
  const navigate = useNavigate();
  const token = Cookies.get("token");

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    navigate("/login");
  };

  return (
    <>
      <div className="flex justify-around items-center p-8 bg-black text-white shadow-md">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>CineBook</h1>
        <ul className="flex gap-10 font-medium">
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
            <Link to="/moviedashboard" className="hover:text-red-500 transition">Movie Dashboard</Link>
          </li>
        </ul>

        <ul className="flex gap-5">
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
            <li>
              <button onClick={handleLogout} className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition">Logout</button>
            </li>
          )}
        </ul>
      </div>
    </>
  );
};
