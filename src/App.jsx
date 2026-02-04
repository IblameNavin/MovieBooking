import React, { useEffect } from 'react'
import { Routes, Route } from "react-router-dom"
import { Home } from './components/Home'
import { MovieDashboard } from './pages/MovieDashboard'
import { Register } from './pages/Register'
import { Navbar } from './pages/Navbar'
import { Movies } from './pages/Movies'
import { MovieDetails } from './pages/MovieDetails'
import { Admin } from './pages/Admin'
import { Login } from './pages/Login'
import { MyBookings } from './pages/MyBookings'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { seedFirestore } from './seed/seedData'

const App = () => {
  useEffect(() => {
  seedFirestore()
  }, [])
  
  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/movies" element={<ProtectedRoute><Movies /></ProtectedRoute>} />
        <Route path="/movies/:id" element={<ProtectedRoute><MovieDetails /></ProtectedRoute>} />
        <Route path="/moviedashboard" element={<ProtectedRoute><MovieDashboard /></ProtectedRoute>} />
        <Route path="/mybookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

        {/* Admin Route */}
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      </Routes>
    </>
  )
}

export default App