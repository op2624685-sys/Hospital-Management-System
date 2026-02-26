import React from 'react'
import './index.css'
import Login from './pages/AuthPages/Login'
import Signup from './pages/AuthPages/Signup'
import ForgotPassword from './pages/AuthPages/ForgotPassword'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import AppointmentDetails from './pages/AppointmentDetails'
import Appointment from './pages/Appointment'
import Doctor from './pages/Doctor'
import Branch from './pages/Branch'
import Department from './pages/Department'
import Services from './pages/Services'
import About from './pages/About'
import Contact from './pages/Contact'
import EmergencyDepartment from './components/EmergencyDepartment'
import Cardiology from './components/Cardiology'
import Neurology from './components/Neurology'
import Orthopedics from './components/Orthopedics'
import Pediatrics from './components/Pediatrics'
import Radiology from './components/Radiology'
import CheckAppointments from './pages/CheckAppointments'

const App = () => {
  return (
    <div>
    <Routes>
      <Route path="/" element={<Home />} />
      {/* appointment page link */}
      <Route path='/appointment' element={<Appointment />} />
      <Route path='/appointment/check' element={<CheckAppointments />} />
      <Route path='/appointment/:appointmentId' element={<AppointmentDetails />} />
      <Route path='/doctors' element={<Doctor />} />
      <Route path='/branches' element={<Branch />} />
      <Route path='/services' element={<Services />} />
      <Route path='/about' element={<About />} />
      <Route path='contact' element={<Contact />} />
      {/* departments page link */}
      <Route path='departments' element={<Department />} />
      <Route path='departments/emergency' element={<EmergencyDepartment />} />
      <Route path='departments/cardiology' element={<Cardiology />} />
      <Route path='departments/neurology' element={<Neurology />} />
      <Route path='departments/orthopedics' element={<Orthopedics />} />
      <Route path='departments/pediatrics' element={<Pediatrics />} />
      <Route path='departments/radiology' element={<Radiology />} />

      {/* Auth pages link */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path='/login/forgotpassword' element={<ForgotPassword />} />
    </Routes>
    </div>
  )
}

export default App