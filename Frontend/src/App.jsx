import React from 'react'
import './index.css'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import AdminDashboard from './pages/AdminDashboard'

const App = () => {
  return (
    <div>
    {/* <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path='/login/forgotpassword' element={<ForgotPassword />} />
    </Routes> */}
    <AdminDashboard />
    </div>
  )
}

export default App