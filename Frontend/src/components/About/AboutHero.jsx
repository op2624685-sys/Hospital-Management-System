import React from "react";

const AboutHero = () => {
  return (
    <section className='relative pt-32 lg:pt-40 pb-16 lg:pb-24 px-5 lg:px-20 overflow-hidden'>
      <div className='absolute top-10 right-0 w-96 h-96 rounded-full blur-3xl opacity-20'
        style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }}></div>
      <div className='absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl opacity-15'
        style={{ background: 'radial-gradient(circle, #f472b6, transparent)' }}></div>

      <div className='relative z-10 max-w-5xl'>
        <span className='inline-flex items-center gap-2 bg-white/10 border border-violet-400/30 text-violet-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6'>
          <span className='w-2 h-2 bg-violet-400 rounded-full animate-pulse'></span>
          Est. 2005 · DELTACARE Hospital
        </span>

        <h1 className='text-5xl lg:text-8xl font-black leading-none mb-6' style={{ color: '#fff' }}>
          About <br className="hidden lg:block"/>
          <span className='text-transparent bg-clip-text'
            style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #e879f9)' }}>
            Our Hospital
          </span>
        </h1>

        <p className='text-gray-400 text-xl leading-relaxed max-w-2xl'>
          Established in 2005, DELTACARE is committed to providing world-class
          healthcare services with
          <span className='text-gray-200 font-semibold'> compassion, innovation, and excellence.</span>
        </p>
      </div>
    </section>
  );
};

export default AboutHero;
