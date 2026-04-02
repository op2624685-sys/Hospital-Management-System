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
        style={{ background: 'radial-gradient(circle, var(--secondary), transparent)' }}></div>
      <div className='absolute bottom-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none'
        style={{ background: 'radial-gradient(circle, var(--chart-4), transparent)' }}></div>

      {/* ── Left Content ── */}
      <div className='relative z-10 w-full lg:w-1/2 lg:pr-10 mb-12 lg:mb-0'>

        {/* Tagline */}
        <div ref={taglineRef} className='opacity-0 mb-6'>
          <span className='inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest'
            style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--primary) 22%, transparent)', color: 'var(--primary)' }}>
            <span className='w-2 h-2 rounded-full animate-pulse' style={{ background: 'var(--chart-5)' }}></span>
            World Class Healthcare
          </span>
        </div>

        {/* Heading */}
        <h1 ref={headingRef} className='opacity-0 text-5xl lg:text-7xl font-black leading-none mb-3' style={{ color: 'var(--foreground)' }}>
          Your Health,
        </h1>
        <h1 ref={subheadingRef} className='opacity-0 text-5xl lg:text-7xl font-black leading-none mb-6'>
          <span className='text-transparent bg-clip-text'
            style={{ backgroundImage: 'linear-gradient(135deg, var(--primary), var(--chart-5))' }}>
            Our Priority
          </span>
        </h1>

        {/* Para */}
        <p ref={paraRef} className='opacity-0 text-lg leading-relaxed max-w-lg mb-10' style={{ color: 'var(--muted-foreground)' }}>
          Experience world-class medical care with our team of expert doctors.
          We combine cutting-edge technology with compassionate care to deliver
          <span style={{ color: 'var(--foreground)', fontWeight: 500 }}> the best outcomes for you.</span>
        </p>

        {/* Buttons */}
        <div ref={btnsRef} className='flex gap-4 mb-16'>
          <Link to="/appointment"
            className='group relative overflow-hidden flex items-center gap-2 text-white font-bold py-4 px-8 rounded-2xl hover:scale-105 active:scale-95 transition-transform duration-300'
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--chart-5))', boxShadow: '0 8px 28px color-mix(in srgb, var(--primary) 30%, transparent)' }}>
            <span className='absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300'
              style={{ background: 'linear-gradient(135deg, var(--chart-5), var(--primary))' }}></span>
            <span className='relative z-10'>Book Appointment</span>
            <span className='relative z-10 group-hover:translate-x-1 transition-transform duration-300'>→</span>
          </Link>

          <Link to="/doctors"
            className='group flex items-center gap-2 font-bold py-4 px-8 rounded-2xl active:scale-95 transition-all duration-300'
            style={{ background: 'color-mix(in srgb, var(--primary) 7%, transparent)', border: '1.5px solid color-mix(in srgb, var(--primary) 20%, transparent)', color: 'var(--chart-5)', backdropFilter: 'blur(8px)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary) 40%, transparent)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary) 20%, transparent)'; e.currentTarget.style.color = 'var(--chart-5)'; }}>
            Meet Our Doctors
            <span className='group-hover:rotate-45 transition-transform duration-300'>↗</span>
          </Link>
        </div>

        {/* Stats */}
        <div ref={statsRef} className='flex flex-wrap lg:flex-nowrap gap-6 lg:gap-8'>
          {stats.map((stat, i) => (
            <div key={i} className='text-center'>
              <p className='text-2xl mb-0.5'>{stat.icon}</p>
              <p className='text-2xl font-black' style={{ color: 'var(--foreground)' }}>{stat.value}</p>
              <p className='text-xs mt-0.5' style={{ color: 'var(--muted-foreground)' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right — 3D Model Canvas ── */}
      <div ref={floatingRef} className='opacity-0 relative w-full lg:w-1/2 h-[50vh] lg:h-[80vh] rounded-3xl overflow-hidden'
        style={{ background: 'color-mix(in srgb, var(--primary) 4%, transparent)', border: '1px solid color-mix(in srgb, var(--primary) 12%, transparent)', backdropFilter: 'blur(10px)', boxShadow: 'inset 0 0 40px color-mix(in srgb, var(--primary) 8%, transparent)' }}>
        <div className="absolute inset-0">
          <Doctor3D />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
