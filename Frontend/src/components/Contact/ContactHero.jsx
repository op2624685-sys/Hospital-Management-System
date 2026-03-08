import React from "react";

const ContactHero = () => {
  return (
    <>
      <div className='text-center mb-14'>
        <span className='inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-violet-400/30 text-violet-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-5'>
          <span className='w-2 h-2 bg-violet-400 rounded-full animate-pulse'></span>
          We're Here For You
        </span>
        <h1 className='text-4xl lg:text-7xl font-black text-white leading-none mb-4'>
          Let{' '}
          <span className='text-transparent bg-clip-text'
            style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #06b6d4)' }}>
            Us Help
          </span>
        </h1>
        <p className='text-gray-400 text-lg max-w-lg mx-auto leading-relaxed'>
          Our dedicated team is ready to assist you with
          appointments, queries, or any medical emergency.
        </p>
      </div>

      <div className='w-full max-w-4xl mb-10'>
        <div className='bg-white/10 backdrop-blur-md border border-red-400/20 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4 sm:gap-0'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-lg'>
              🚨
            </div>
            <div>
              <p className='font-bold text-white text-sm'>Medical Emergency?</p>
              <p className='text-xs text-gray-400'>Don't wait — our emergency team is on standby</p>
            </div>
          </div>
          <a href="tel:+919876543210"
            className='flex items-center gap-2 bg-red-500 text-white font-bold py-2.5 px-5 rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 text-sm shadow-md shadow-red-200'>
            📞 Call Now
          </a>
        </div>
      </div>
    </>
  );
};

export default ContactHero;
