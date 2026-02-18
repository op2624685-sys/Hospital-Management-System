import React from 'react';
import { PhoneCall, Hospital } from 'lucide-react';

const MainContent = () => {
  return (
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
      <div className='border-[#76aaab] border-2 border-dashed w-xl'>
        <img className='w-full object-cover' src="https://images.unsplash.com/photo-1640876777002-badf6aee5bcc?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Image not loaded" />
      </div>
    </main>
  );
};

export default MainContent;