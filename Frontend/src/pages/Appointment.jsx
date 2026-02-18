import React from 'react'
import Header from '../components/Header'

const Appointment = () => {
  return (
    <div>
      <Header />
      <div className='section-1'>
        <h1 className='text-3xl'>Reserve Your Spot</h1>
        <p>Secure your preferred time slot by booking in advance. Our simple appointment system allows you to plan ahead and avoid waiting in line, so you can focus on what matters most.</p>
      </div>
      <div className='section-2'>
        <div className='logo'>

        </div>
        <div className='form'>
          <form className=''>
            <label htmlFor="doctor">Doctor name</label>
            <input type="text" name="doctor" id="doctor" />
            <label htmlFor="date">Patient name</label>
            <input type="date" name="date" id="date" />
            <label htmlFor="time">Date & Time</label>
            <input type="time" name="time" id="time" />
            <button type="submit">Book Now</button>
          </form>

        </div>
      </div>
    </div>
  )
}

export default Appointment
