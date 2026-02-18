import React from 'react'
import Header from '../components/Header'
import AppointmentBooking from '../components/AppointmentBooking'

const Appointment = () => {
  return (
    <div className='px-20 py-5'>
      <Header />
      <div className='flex justify-center items-center m-10 px-30'>
        <div className='section-1 flex flex-col m-10 p-12 h-150 w-1/2 '>
          <h1 className='text-8xl font-semibold m-3 px-2'>Reserve Your Spot</h1>
          <p className='text-2xl m-3 mt-10'>Secure your preferred time slot by booking in advance. Our simple appointment system allows you to plan ahead and avoid waiting in line, so you can focus on what matters most.</p>
        </div>
        <AppointmentBooking />
      </div>
    </div>
  )
}

export default Appointment
