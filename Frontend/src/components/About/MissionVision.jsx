import React from "react";

const MissionVision = () => {
  return (
    <section className='px-5 lg:px-20 pb-12 lg:pb-20'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>

        {/* Mission */}
        <div className='group relative rounded-3xl p-10 overflow-hidden border bg-[var(--card)] shadow-md hover:shadow-xl hover:-translate-y-2 hover:border-[var(--primary)] transition-all duration-500'
          style={{ borderColor: 'var(--border)' }}>
          <div className='absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-15 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500'
            style={{ background: 'radial-gradient(circle, var(--primary), transparent)' }}></div>
          <div className='absolute bottom-0 left-0 w-36 h-36 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-all duration-500'
            style={{ background: 'radial-gradient(circle, var(--chart-5), transparent)' }}></div>
          <div className='relative z-10'>
            <div className='w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300' style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}>
              🎯
            </div>
            <span className='text-[var(--primary)] text-xs font-black uppercase tracking-widest'>Our Mission</span>
            <h3 className='text-3xl font-black text-[var(--foreground)] mt-2 mb-4'>
              Healthcare For Everyone
            </h3>
            <p className='text-[var(--muted-foreground)] leading-relaxed'>
              To provide high-quality, affordable healthcare services with a
              patient-centered approach and advanced medical technology that
              makes a real difference in people's lives.
            </p>
          </div>
        </div>

        {/* Vision */}
        <div className='group relative rounded-3xl p-10 overflow-hidden border bg-[var(--card)] shadow-md hover:shadow-xl hover:-translate-y-2 hover:border-[var(--chart-5)] transition-all duration-500'
          style={{ borderColor: 'var(--border)' }}>
          <div className='absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-15 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500'
            style={{ background: 'radial-gradient(circle, var(--chart-5), transparent)' }}></div>
          <div className='absolute bottom-0 left-0 w-36 h-36 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-all duration-500'
            style={{ background: 'radial-gradient(circle, var(--primary), transparent)' }}></div>
          <div className='relative z-10'>
            <div className='w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300' style={{ background: 'color-mix(in srgb, var(--chart-5) 15%, transparent)' }}>
              🔭
            </div>
            <span className='text-[var(--chart-5)] text-xs font-black uppercase tracking-widest'>Our Vision</span>
            <h3 className='text-3xl font-black text-[var(--foreground)] mt-2 mb-4'>
              Leading The Future
            </h3>
            <p className='text-[var(--muted-foreground)] leading-relaxed'>
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
