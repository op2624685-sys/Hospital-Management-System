import React from 'react';
import { LogIn } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const Header = () => {
  return (
    <header className='navbar flex justify-between top-0 left-0 fixed w-full items-center py-6 px-10 z-9999 '>
      <RouterLink to="/">
        <h1 className='text-3xl font-bold text-orange-400'>DELTACARE</h1>
      </RouterLink>
      <nav className='space-x-10'>
        <RouterLink to="/" className='text-blue-600 hover:text-gray-300'>Home</RouterLink>
        <RouterLink to="/appointment" className='text-blue-600 hover:text-gray-300'>Appointment</RouterLink>
        <RouterLink to="/doctors" className='text-blue-600 hover:text-gray-300'>Doctor</RouterLink>
        <RouterLink to="/branches" className='text-blue-600 hover:text-gray-300'>Branches</RouterLink>
        <RouterLink to="/departments" className='text-blue-600 hover:text-gray-300'>Departments</RouterLink>
        <RouterLink to="/services" className='text-blue-600 hover:text-gray-300'>Services</RouterLink>
        <RouterLink to="/about" className='text-blue-600 hover:text-gray-300'>About Us</RouterLink>
        <RouterLink to="/contact" className='text-blue-600 hover:text-gray-300'>Contact Us</RouterLink>
      </nav>
      <RouterLink to="/login" className='flex items-center gap-2 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600'>
        <LogIn size={16} />Login
      </RouterLink>
    </header>
  );
};

export default Header;