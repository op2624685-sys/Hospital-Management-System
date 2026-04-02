import React from "react";

const AboutHero = () => {
  return (
    <section className='relative pt-32 lg:pt-40 pb-16 lg:pb-24 px-5 lg:px-20 overflow-hidden'>
      <div className='absolute top-10 right-0 w-96 h-96 rounded-full blur-3xl opacity-20'
        style={{ background: 'radial-gradient(circle, var(--primary), transparent)' }}></div>
      <div className='absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl opacity-15'
        style={{ background: 'radial-gradient(circle, var(--chart-5), transparent)' }}></div>

      <div className='relative z-10 max-w-5xl'>
        <span className='inline-flex items-center gap-2 border text-[var(--primary)] text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6'
          style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)' }}>
          <span className='w-2 h-2 rounded-full animate-pulse' style={{ background: 'var(--primary)' }}></span>
          Est. 2005 · DELTACARE Hospital
        </span>

        <h1 className='text-5xl lg:text-8xl font-black leading-none mb-6 text-[var(--foreground)]'>
          About <br className="hidden lg:block"/>
          <span className='text-transparent bg-clip-text'
            style={{ backgroundImage: 'linear-gradient(135deg, var(--primary), var(--chart-5))' }}>
            Our Hospital
          </span>
        </h1>

        <p className='text-[var(--muted-foreground)] text-xl leading-relaxed max-w-2xl'>
          Established in 2005, DELTACARE is committed to providing world-class
          healthcare services with
          <span className='text-[var(--foreground)] font-semibold'> compassion, innovation, and excellence.</span>
        </p>
      </div>
    </section>
  );
};

export default AboutHero;
