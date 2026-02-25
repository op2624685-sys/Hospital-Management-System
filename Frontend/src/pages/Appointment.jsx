import React from 'react'
import Header from '../components/Header'
import AppointmentBooking from '../components/AppointmentBooking'
import { Link } from 'react-router-dom'

const Appointment = () => {
  return (
    <div className='mt-20 px-20 py-5'>
      <Header />
      <div className='flex justify-center items-center m-10 px-30'>
        <div className='section-1 flex flex-col m-10 p-12 h-150 w-1/2 '>
          <h1 className='text-8xl font-semibold m-3 px-2'>Reserve Your Spot</h1>
          <p className='text-2xl m-3 mt-10'>Secure your preferred time slot by booking in advance. Our simple appointment system allows you to plan ahead and avoid waiting in line, so you can focus on what matters most.</p>
          <div className='flex flex-row mt-10'>
            <Link to="/appointment/check"className='bg-green-200 text-black m-1 border-2 border-black text-black py-2 px-4 rounded-lg hover:bg-red-300 hover:text-white'>Check Appointment</Link>
          </div>
        </div>
        <AppointmentBooking />
      </div>
    </div>
  )
}

export default Appointment
