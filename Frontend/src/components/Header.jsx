import React from 'react';
import { LogIn } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const Header = () => {
  return (
    <header className='flex justify-between items-center py-6'>
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
  );
};

export default Header;