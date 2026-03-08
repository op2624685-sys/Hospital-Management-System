import React from "react";

const MissionVision = () => {
  return (
    <section className='px-5 lg:px-20 pb-12 lg:pb-20'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>

        {/* Mission */}
        <div className='relative rounded-3xl p-10 overflow-hidden border border-white/10'
          style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
          <div className='absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-15'
            style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }}></div>
          <div className='absolute bottom-0 left-0 w-36 h-36 rounded-full blur-3xl opacity-10'
            style={{ background: 'radial-gradient(circle, #e879f9, transparent)' }}></div>
          <div className='relative z-10'>
            <div className='w-14 h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center text-2xl mb-6'>
              🎯
            </div>
            <span className='text-violet-400 text-xs font-black uppercase tracking-widest'>Our Mission</span>
            <h3 className='text-3xl font-black text-white mt-2 mb-4'>
              Healthcare For Everyone
            </h3>
            <p className='text-gray-400 leading-relaxed'>
              To provide high-quality, affordable healthcare services with a
              patient-centered approach and advanced medical technology that
              makes a real difference in people's lives.
            </p>
          </div>
        </div>

        {/* Vision */}
        <div className='relative rounded-3xl p-10 overflow-hidden'
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #e879f9 100%)' }}>
          <div className='absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl opacity-10'></div>
          <div className='absolute bottom-0 left-0 w-36 h-36 bg-fuchsia-300 rounded-full blur-3xl opacity-10'></div>
          <div className='relative z-10'>
            <div className='w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl mb-6'>
              🔭
            </div>
            <span className='text-violet-200 text-xs font-black uppercase tracking-widest'>Our Vision</span>
            <h3 className='text-3xl font-black text-white mt-2 mb-4'>
              Leading The Future
            </h3>
            <p className='text-violet-100 leading-relaxed'>
              To become a leading multi-specialty hospital known for excellence,
              innovation and compassionate care that sets the standard for
              healthcare in the region.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
