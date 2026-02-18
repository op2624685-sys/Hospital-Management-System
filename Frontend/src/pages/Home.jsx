import React from 'react';
import Header from '../components/Header';
import MainContent from '../components/MainContent';

const Home = () => {
  return (
    <div className=' opacity-80 min-h-screen flex flex-col px-10 py-10 '>
      <div className='background-layer bg-[#194f51]'></div>
      <Header />
      <MainContent />
    </div>
  );
};

export default Home;