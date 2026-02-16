import React from 'react';
import { LogIn, PhoneCall, Hospital } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom'; 
const Home = () => {
  return (
    <div className=' opacity-80 min-h-screen flex flex-col'>
      <div className='background-layer bg-[#194f51]'></div>
      {/* Header Section */}
      <header className='flex justify-between items-center p-6'>
        <h1 className='text-3xl font-bold text-orange-400'>DELTACARE</h1>
        <nav className='space-x-10'>
          <a href="#" className='text-white hover:text-gray-300'>Appointment</a>
          <a href="#" className='text-white hover:text-gray-300'>Services</a>
          <a href="#" className='text-white hover:text-gray-300'>Departments</a>
          <a href="#" className='text-white hover:text-gray-300'>About us</a>
          <a href="#" className='text-white hover:text-gray-300'>Doctors</a>
          <a href="#" className='text-white hover:text-gray-300'>Branches</a>
        </nav>
        <RouterLink to="/login" className='bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600'><LogIn />Login</RouterLink>
      </header>

      {/* Main Content Section */}
      <main className='grow flex flex-col justify-center m-3 p-4 md:flex-row '>
        <div className='p-10'>
          <h2 className='text-[100px] font-semibold text-orange-300 mb-4 leading-tight'>
            The trusted &<br />
            friendly<br />
            professionals<br />
            are for you
          </h2>
          <div className='flex flex-row items-center space-x-20 mt-4 p-10'>
            <button className='bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600'>
              <PhoneCall /> Call for appointment
            </button>
            <button className='bg-transparent border-2 border-orange-500 text-orange-500 py-2 px-4 rounded-lg hover:bg-orange-500 hover:text-white'>
              <Hospital />Find Branches Near You
            </button>
          </div>
        </div>
        <div className='border-[#76aaab] border-2 border-dashed'>
          <img src="https://images.unsplash.com/photo-1640876777002-badf6aee5bcc?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Image not loaded" />
        </div>
      </main>

      {/* Footer Section */}
      <footer className='flex justify-center items-center bg-[#194f51] h-20 border-t-2 border-gray-600 mx-auto max-w-5xl w-full'>
        <div className='flex justify-between items-center space-x-4 w-full p-4'>
          <select className='bg-gray-700 text-white p-2 rounded'>
            <option>Specialty</option>
            <option>Neurology</option>
            <option>Cardiology</option>
            <option>Orthopedics</option>
          </select>
          <select className='bg-gray-700 text-white p-2 rounded'>
            <option>Branch</option>
            <option>Washington Ave</option>
            <option>Main St</option>
          </select>
          <input type='date' className='bg-gray-700 text-white p-2 rounded' />
          <button className='bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600'>
            Find Doctors
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Home;
