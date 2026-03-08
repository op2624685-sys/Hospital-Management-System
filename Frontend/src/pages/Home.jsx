import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { Hospital } from 'lucide-react';
import Doctor3D from '../components/Doctor3D';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: '50+', label: 'Expert Doctors', icon: '👨‍⚕️' },
  { value: '10k+', label: 'Happy Patients', icon: '❤️' },
  { value: '15+', label: 'Departments', icon: '🏥' },
  { value: '24/7', label: 'Emergency Care', icon: '🚑' },
];

const services = [
  { title: 'Emergency Care', desc: 'Round-the-clock emergency services for critical conditions', icon: '🚨', color: 'from-rose-400 to-rose-600' },
  { title: 'Surgery', desc: 'Advanced surgical procedures with expert surgeons', icon: '🔬', color: 'from-violet-400 to-violet-600' },
  { title: 'Cardiology', desc: 'Comprehensive heart care and cardiac treatments', icon: '❤️', color: 'from-pink-400 to-rose-500' },
  { title: 'Pediatrics', desc: 'Specialized healthcare for infants and children', icon: '👶', color: 'from-amber-400 to-orange-500' },
  { title: 'Neurology', desc: 'Expert care for brain and nervous system disorders', icon: '🧠', color: 'from-fuchsia-400 to-purple-600' },
  { title: 'Orthopedics', desc: 'Bone, joint and muscle treatment and rehabilitation', icon: '🦴', color: 'from-purple-400 to-violet-600' },
];

const Home = () => {
  const containerRef    = useRef();
  const heroRef         = useRef();
  const navRef          = useRef();
  const taglineRef      = useRef();
  const headingRef      = useRef();
  const subheadingRef   = useRef();
  const paraRef         = useRef();
  const btnsRef         = useRef();
  const statsRef        = useRef();
  const floatingRef     = useRef();
  const servicesRef     = useRef();
  const ctaRef          = useRef();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(navRef.current,         { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
        .fromTo(taglineRef.current,      { opacity: 0, y: 20 },   { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
        .fromTo(headingRef.current,      { opacity: 0, y: 60 },   { opacity: 1, y: 0, duration: 0.9 }, '-=0.2')
        .fromTo(subheadingRef.current,   { opacity: 0, y: 40 },   { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
        .fromTo(paraRef.current,         { opacity: 0, y: 30 },   { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .fromTo(btnsRef.current.children,{ opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.15 }, '-=0.3')
        .fromTo(statsRef.current.children,{ opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.2')
        .fromTo(floatingRef.current,     { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, '-=0.8');

      gsap.fromTo(servicesRef.current.children,
        { opacity: 0, y: 60, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: servicesRef.current, start: 'top 80%' } }
      );

      gsap.fromTo(ctaRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 85%' } }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}
      className='min-h-screen overflow-hidden'
      style={{ background: 'linear-gradient(160deg, #0f0c29 0%, #1a1040 20%, #24243e 45%, #1e1b4b 65%, #2d1b69 80%, #11071f 100%)' }}>

      {/* ── Grid texture ── */}
      <div className='fixed inset-0 pointer-events-none z-0'
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px)',
          backgroundSize: '56px 56px'
        }}></div>

      {/* ── Global ambient blobs ── */}
      <div className='fixed inset-0 pointer-events-none z-0 overflow-hidden'>
        <div className='absolute rounded-full' style={{ width: 640, height: 640, top: -220, left: -180, opacity: 0.45, background: 'radial-gradient(circle, #7c3aed, #4c1d95 55%, transparent)', filter: 'blur(90px)', animation: 'hBlob1 13s ease-in-out infinite' }}></div>
        <div className='absolute rounded-full' style={{ width: 520, height: 520, bottom: -160, right: -140, opacity: 0.40, background: 'radial-gradient(circle, #a855f7, #6b21a8 60%, transparent)', filter: 'blur(90px)', animation: 'hBlob2 17s ease-in-out infinite' }}></div>
        <div className='absolute rounded-full' style={{ width: 400, height: 400, top: '30%', right: '5%', opacity: 0.28, background: 'radial-gradient(circle, #e879f9, #a21caf 55%, transparent)', filter: 'blur(90px)', animation: 'hBlob1 21s ease-in-out infinite reverse' }}></div>
        <div className='absolute rounded-full' style={{ width: 320, height: 320, bottom: '20%', left: '5%', opacity: 0.24, background: 'radial-gradient(circle, #f472b6, #9d174d 60%, transparent)', filter: 'blur(90px)', animation: 'hBlob2 19s ease-in-out infinite' }}></div>
      </div>

      <style>{`
        @keyframes hBlob1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(32px,-42px)} }
        @keyframes hBlob2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-24px,34px)} }
      `}</style>

      {/* ── Navbar ── */}
      <div ref={navRef} className='opacity-0 sticky top-0 z-50'>
        <Header />
      </div>

      {/* ════════════════════════════════
          HERO SECTION
      ════════════════════════════════ */}
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

        {/* ── Right — 3D Doctor Canvas ── */}
        <div ref={floatingRef} className='opacity-0 relative w-full lg:w-1/2 h-[50vh] lg:h-[80vh] rounded-3xl overflow-hidden'
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)' }}>
          <Doctor3D />
        </div>
      </section>

      {/* ════════════════════════════════
          SERVICES SECTION
      ════════════════════════════════ */}
      <section className='px-5 lg:px-20 py-16 lg:py-24 relative' style={{ zIndex: 1, background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className='text-center mb-16'>
          <span className='inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4'
            style={{ background: 'rgba(232,121,249,0.10)', border: '1px solid rgba(232,121,249,0.22)', color: '#e879f9' }}>
            What We Offer
          </span>
          <h2 className='text-5xl font-black' style={{ color: '#f0f0ff' }}>
            Our{' '}
            <span className='text-transparent bg-clip-text'
              style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #e879f9)' }}>
              Services
            </span>
          </h2>
          <p className='mt-4 max-w-xl mx-auto' style={{ color: '#6b7280' }}>
            Comprehensive healthcare services designed to meet all your medical needs
          </p>
        </div>

        <div ref={servicesRef} className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {services.map((service, i) => (
            <div key={i}
              className='group rounded-2xl p-6 hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden relative'
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 48px rgba(0,0,0,0.35)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.20)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>

              <div className={`w-14 h-14 bg-linear-to-br ${service.color} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {service.icon}
              </div>
              <h3 className='font-black text-lg mb-2' style={{ color: '#f0f0ff' }}>{service.title}</h3>
              <p className='text-sm leading-relaxed' style={{ color: '#9ca3af' }}>{service.desc}</p>

              <div className='flex items-center gap-1 mt-4 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                style={{ color: '#a78bfa' }}>
                Learn more <span className='group-hover:translate-x-1 transition-transform duration-300'>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════
          CTA SECTION
      ════════════════════════════════ */}
      <section ref={ctaRef} className='opacity-0 mx-5 lg:mx-20 mb-10 lg:mb-20 rounded-3xl px-8 lg:px-16 py-12 lg:py-20 relative overflow-hidden' style={{ zIndex: 1 }}>

        {/* CTA background */}
        <div className='absolute inset-0 rounded-3xl'
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #e879f9 100%)' }}></div>

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
                style={{ backgroundImage: 'linear-gradient(135deg, #fde68a, #fca5a5)' }}>
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
              style={{ color: '#7c3aed', boxShadow: '0 8px 28px rgba(0,0,0,0.20)' }}>
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

      {/* Footer note */}
      <div className='text-center pb-10' style={{ zIndex: 1, position: 'relative' }}>
        <p className='text-xs' style={{ color: '#4b5563' }}>
          © 2026 DELTACARE Hospital · All rights reserved
        </p>
      </div>
    </div>
  );
};

export default Home;