import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const CTASection = () => {
  const ctaRef = useRef();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(ctaRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 85%' } }
      );
    }, ctaRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ctaRef} className='opacity-0 mx-5 lg:mx-20 mb-10 lg:mb-20 rounded-3xl px-8 lg:px-16 py-12 lg:py-20 relative overflow-hidden' style={{ zIndex: 1 }}>

      {/* CTA background */}
      <div className='absolute inset-0 rounded-3xl'
        style={{ background: 'linear-gradient(135deg, #644a40 0%, #8b5e52 50%, #a07060 100%)' }}></div>

      {/* Decorative circles */}
      <div className='absolute -top-10 -right-10 w-64 h-64 bg-white opacity-5 rounded-full pointer-events-none'></div>
      <div className='absolute -bottom-10 -left-10 w-48 h-48 bg-white opacity-5 rounded-full pointer-events-none'></div>
      <div className='absolute top-1/2 right-1/4 w-32 h-32 rounded-full blur-xl pointer-events-none'
        style={{ background: 'rgba(255,255,255,0.10)' }}></div>

      <div className='relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 lg:gap-0'>
        <div>
          <span className='inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6'>
            <span className='w-2 h-2 bg-white rounded-full animate-pulse'></span>
            Get Started Today
          </span>
          <h2 className='text-5xl font-black text-white leading-tight mb-4'>
            Ready to take control <br />
            <span className='text-transparent bg-clip-text'
              style={{ backgroundImage: 'linear-gradient(135deg, #ffdfb5, #ffe6c4)' }}>
              of your health?
            </span>
          </h2>
          <p className='text-lg max-w-lg' style={{ color: 'rgba(255,255,255,0.75)' }}>
            Book an appointment today and experience world-class healthcare at DELTACARE Hospital.
          </p>
        </div>

        <div className='flex flex-col gap-4 shrink-0'>
          <Link to="/appointment"
            className='group flex items-center gap-3 bg-white font-black py-4 px-8 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300'
            style={{ color: '#644a40', boxShadow: '0 8px 28px rgba(0,0,0,0.20)' }}>
            Book Appointment
            <span className='group-hover:translate-x-1 transition-transform duration-300'>→</span>
          </Link>
          <Link to="/doctors"
            className='flex items-center justify-center gap-2 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 active:scale-95'
            style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}>
            Meet Our Doctors
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
