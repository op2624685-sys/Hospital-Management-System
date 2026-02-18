import React from 'react'
import './index.css'
import Login from './pages/AuthPages/Login'
import Signup from './pages/AuthPages/Signup'
import ForgotPassword from './pages/AuthPages/ForgotPassword'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Appointment from './pages/Appointment'

const App = () => {
  return (
    <div>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path='/appointment' element={<Appointment />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path='/login/forgotpassword' element={<ForgotPassword />} />
    </Routes>
    </div>
  )
}

export default App