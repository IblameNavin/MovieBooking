import React from 'react'
import { Routes, Route } from "react-router-dom"
import {Home} from './components/Home'
import {Login} from './components/Login'
import { MovieDashboard } from './pages/MovieDashboard'
import { Register } from './pages/Register'
import { Navbar } from './pages/Navbar'
import { Movies } from './pages/Movies'
import { MovieDetails } from './pages/MovieDetails'
import { Admin } from './pages/Admin'

const App = () => {
  return (
   <>
    <Navbar/>
   <Routes>
    <Route path = "/" element = {<Home/>} />
    <Route path = "/login" element = {<Login/>} />
    <Route path = "/movies" element = {<Movies/>} />
    <Route path = "/moviedetails" element = {<MovieDetails/>} />
    <Route path = "/admin" element = {<Admin/>} />
    <Route path = "/moviedashboard" element = {<MovieDashboard/>} />
    <Route path = "/register" element = {<Register/>} />
   </Routes>
   </>
  )
}

export default App