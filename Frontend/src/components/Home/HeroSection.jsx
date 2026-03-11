import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import Doctor3D from '../Doctor3D';

const HeroSection = () => {
  const heroRef = useRef();
  const taglineRef = useRef();
  const headingRef = useRef();
  const subheadingRef = useRef();
  const paraRef = useRef();
  const btnsRef = useRef();
  const statsRef = useRef();
  const floatingRef = useRef();

  useLayoutEffect(() => {
    // We pass the refs back up to Home.jsx or run the timeline locally.
    // For encapsulation, we can run the GSAP timeline locally for this component's mount.
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(taglineRef.current,      { opacity: 0, y: 20 },   { opacity: 1, y: 0, duration: 0.5 }, '+=0.8')
        .fromTo(headingRef.current,      { opacity: 0, y: 60 },   { opacity: 1, y: 0, duration: 0.9 }, '-=0.2')
        .fromTo(subheadingRef.current,   { opacity: 0, y: 40 },   { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
        .fromTo(paraRef.current,         { opacity: 0, y: 30 },   { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .fromTo(btnsRef.current.children,{ opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.15 }, '-=0.3')
        .fromTo(statsRef.current.children,{ opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.2')
        .fromTo(floatingRef.current,     { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, '-=0.8');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    { value: '50+', label: 'Expert Doctors', icon: '👨‍⚕️' },
    { value: '10k+', label: 'Happy Patients', icon: '❤️' },
    { value: '15+', label: 'Departments', icon: '🏥' },
    { value: '24/7', label: 'Emergency Care', icon: '🚑' },
  ];

  return (
    <section ref={heroRef} className='relative min-h-screen flex flex-col lg:flex-row items-center overflow-hidden px-5 lg:px-20 pt-24 lg:pt-0' style={{ zIndex: 1 }}>

      {/* Extra hero-local blobs */}
      <div className='absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none'
        style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }}></div>
      <div className='absolute bottom-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none'
        style={{ background: 'radial-gradient(circle, #e879f9, transparent)' }}></div>

      {/* ── Left Content ── */}
      <div className='relative z-10 w-full lg:w-1/2 lg:pr-10 mb-12 lg:mb-0'>

        {/* Tagline */}
        <div ref={taglineRef} className='opacity-0 mb-6'>
          <span className='inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest'
            style={{ background: 'rgba(192,132,252,0.10)', border: '1px solid rgba(192,132,252,0.25)', color: '#c084fc' }}>
            <span className='w-2 h-2 bg-violet-400 rounded-full animate-pulse'></span>
            World Class Healthcare
          </span>
        </div>

        {/* Heading */}
        <h1 ref={headingRef} className='opacity-0 text-5xl lg:text-7xl font-black leading-none mb-3' style={{ color: '#f0f0ff' }}>
          Your Health,
        </h1>
        <h1 ref={subheadingRef} className='opacity-0 text-5xl lg:text-7xl font-black leading-none mb-6'>
          <span className='text-transparent bg-clip-text'
            style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #e879f9)' }}>
            Our Priority
          </span>
        </h1>

        {/* Para */}
        <p ref={paraRef} className='opacity-0 text-lg leading-relaxed max-w-lg mb-10' style={{ color: '#9ca3af' }}>
          Experience world-class medical care with our team of expert doctors.
          We combine cutting-edge technology with compassionate care to deliver
          <span style={{ color: '#e5e7eb', fontWeight: 500 }}> the best outcomes for you.</span>
        </p>

        {/* Buttons */}
        <div ref={btnsRef} className='flex gap-4 mb-16'>
          <Link to="/appointment"
            className='group relative overflow-hidden flex items-center gap-2 text-white font-bold py-4 px-8 rounded-2xl hover:scale-105 active:scale-95 transition-transform duration-300'
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 8px 28px rgba(124,58,237,0.40)' }}>
            <span className='absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300'
              style={{ background: 'linear-gradient(135deg, #a855f7, #e879f9)' }}></span>
            <span className='relative z-10'>Book Appointment</span>
            <span className='relative z-10 group-hover:translate-x-1 transition-transform duration-300'>→</span>
          </Link>

          <Link to="/doctors"
            className='group flex items-center gap-2 font-bold py-4 px-8 rounded-2xl active:scale-95 transition-all duration-300'
            style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)', color: '#d1d5db', backdropFilter: 'blur(8px)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(167,139,250,0.45)'; e.currentTarget.style.color = '#a78bfa'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#d1d5db'; }}>
            Meet Our Doctors
            <span className='group-hover:rotate-45 transition-transform duration-300'>↗</span>
          </Link>
        </div>

        {/* Stats */}
        <div ref={statsRef} className='flex flex-wrap lg:flex-nowrap gap-6 lg:gap-8'>
          {stats.map((stat, i) => (
            <div key={i} className='text-center'>
              <p className='text-2xl mb-0.5'>{stat.icon}</p>
              <p className='text-2xl font-black' style={{ color: '#e5e7eb' }}>{stat.value}</p>
              <p className='text-xs mt-0.5' style={{ color: '#6b7280' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right — 3D Model Canvas ── */}
      <div ref={floatingRef} className='opacity-0 relative w-full lg:w-1/2 h-[50vh] lg:h-[80vh] rounded-3xl overflow-hidden'
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)' }}>
        <div className="absolute inset-0">
          <Doctor3D />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
