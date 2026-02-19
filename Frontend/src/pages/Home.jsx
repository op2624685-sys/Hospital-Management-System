import React from 'react';
import Header from '../components/Header';
import MainContent from '../components/MainContent';
import Appointment from '../pages/Appointment';
import Doctor from '../pages/Doctor';

const Home = () => {
  return (
    <div className=' min-h-screen flex flex-col  '>
        <img className='fixed h-screen w-full top-0 right-0 opacity-70' src="https://i.pinimg.com/736x/0e/35/f0/0e35f02109614b1eed3422055c9307d6.jpg" />
      <div className='relative'>
      <Header />
      <MainContent />
      <Appointment />
      <Doctor />
      </div>
    </div>
  );
};

export default Home;