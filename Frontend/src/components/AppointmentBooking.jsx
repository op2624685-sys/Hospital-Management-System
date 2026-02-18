import React from 'react'

const AppointmentBooking = () => {
  return (
    <div className='w-1/3 h-150 m-10 p-12 border-2 border-gray-300 rounded-2xl'>
          <div className='logo flex justify-center items-center mb-15 '>
              <img className='h-30 w-30 rounded-full' src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=847&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
          </div>
          <div className='form relative'>
            <form className='flex flex-col'>
              <label className='relative text-sm duration-300 transform -translate scale-75 top-3 -z-10 origin-left peer-focus:text-blue-500' htmlFor="doctor">Doctor name</label>
              <input className='block w-full py-2.5 px-0 text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-gray-600 focus:border-blue-500 peer' type="text" name="doctor" id="doctor" />

              <label className='relative text-sm duration-300 transform -translate scale-75 top-3 -z-10 origin-left peer-focus:text-blue-500' htmlFor="doctor">Patient name</label>
              <input className='block w-full py-2.5 px-0 text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-gray-600 focus:border-blue-500 peer' type="text" name="patient" id="patient" />

              <label className='relative text-sm duration-300 transform -translate scale-75 top-3 -z-10 origin-left peer-focus:text-blue-500' htmlFor="date">Date</label>
              <input className='block w-full py-2.5 px-0 text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-gray-600 focus:border-blue-500 peer' type="date" name="date" id="date" />

              <label className='relative text-sm duration-300 transform -translate scale-75 top-3 -z-10 origin-left peer-focus:text-blue-500' htmlFor="time">Time</label>
              <input className='block w-full py-2.5 px-0 text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-gray-600 focus:border-blue-500 peer' type="time" name="time" id="time" />

              <button className='w-full mb-4 mt-6 text-[18px] rounded bg-blue-500 py-2 hover:bg-blue-600 transition-colors duration-300 active:scale-90' type="submit">Book Now</button>
            </form>
          </div>
        </div>
  )
}

export default AppointmentBooking
