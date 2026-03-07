import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from '../components/Header';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    title: 'Emergency Care',
    icon: '🚨',
    desc: 'Round-the-clock emergency services for critical conditions',
    details: ['24/7 Availability', 'Rapid response team', 'ICU support', 'Trauma care'],
    color: 'from-rose-400 to-rose-600'
  },
  {
    title: 'General Surgery',
    icon: '🔬',
    desc: 'Advanced surgical procedures with expert surgeons',
    details: ['Laparoscopic surgery', 'Open surgery', 'Laser surgery', 'Post-op care'],
    color: 'from-violet-400 to-violet-600'
  },
  {
    title: 'Diagnostic Imaging',
    icon: '🖼️',
    desc: 'State-of-the-art imaging technology for accurate diagnosis',
    details: ['MRI & CT Scans', 'X-Ray & Ultrasound', 'Digital Mammography', '3D Imaging'],
    color: 'from-blue-400 to-blue-600'
  },
  {
    title: 'Laboratory Services',
    icon: '🧪',
    desc: 'Comprehensive lab testing with quick results',
    details: ['Blood tests', 'Pathology', 'Microbiology', 'Biochemistry'],
    color: 'from-green-400 to-green-600'
  },
  {
    title: 'Pharmacy',
    icon: '💊',
    desc: 'Full-service pharmacy with medications and consultation',
    details: ['Prescription filling', 'Generic alternatives', 'Drug counseling', 'Home delivery'],
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    title: 'Rehabilitation',
    icon: '🏃',
    desc: 'Physical therapy and rehabilitation programs',
    details: ['Physiotherapy', 'Occupational therapy', 'Speech therapy', 'Home programs'],
    color: 'from-orange-400 to-orange-600'
  },
  {
    title: 'Cardiac Services',
    icon: '💓',
    desc: 'Specialized cardiac care and interventions',
    details: ['Angiography', 'Angioplasty', 'Heart valve surgery', 'Monitoring'],
    color: 'from-pink-400 to-pink-600'
  },
  {
    title: 'Mental Health',
    icon: '🧠',
    desc: 'Psychiatric and psychological counseling services',
    details: ['Therapy sessions', 'Counseling', 'Support groups', 'Crisis intervention'],
    color: 'from-purple-400 to-purple-600'
  },
  {
    title: 'Maternity Care',
    icon: '👨‍👩‍👧',
    desc: 'Full prenatal, natal, and postnatal care',
    details: ['Antenatal care', 'Delivery services', 'Postpartum support', 'Neonatal care'],
    color: 'from-fuchsia-400 to-fuchsia-600'
  },
];

const Services = () => {
  const containerRef = useRef();
  const headingRef = useRef();
  const servicesRef = useRef();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );

      gsap.fromTo(servicesRef.current.children,
        { opacity: 0, y: 60, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: servicesRef.current, start: 'top 75%' } }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}
      className='min-h-screen overflow-hidden'
      style={{ background: 'linear-gradient(160deg, #0f0c29 0%, #1a1040 20%, #24243e 45%, #1e1b4b 65%, #2d1b69 80%, #11071f 100%)' }}>

      <div className='fixed inset-0 pointer-events-none z-0'
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px)',
          backgroundSize: '56px 56px'
        }}></div>

      <Header />

      {/* Hero */}
      <section className='relative min-h-fit py-16 md:py-32 px-5 md:px-20' style={{ zIndex: 1 }}>
        <div className='text-center'>
          <span className='inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6'
            style={{ background: 'rgba(232,121,249,0.10)', border: '1px solid rgba(232,121,249,0.22)', color: '#e879f9' }}>
            Comprehensive Care
          </span>

          <h1 ref={headingRef} className='text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-6' style={{ color: '#f0f0ff' }}>
            Our Medical{' '}
            <span className='text-transparent bg-clip-text'
              style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #e879f9)' }}>
              Services
            </span>
          </h1>

          <p className='text-base md:text-lg max-w-2xl mx-auto' style={{ color: '#9ca3af' }}>
            We provide a wide range of medical services to ensure complete healthcare for all ages
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className='px-5 md:px-20 py-12 md:py-20 relative' style={{ zIndex: 1 }}>
        <div ref={servicesRef} className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
          {services.map((service, i) => (
            <div key={i}
              className='group rounded-2xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-2 cursor-pointer'
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 48px rgba(0,0,0,0.35)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.20)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>

              <div className={`w-14 md:w-16 h-14 md:h-16 bg-linear-to-br ${service.color} rounded-2xl flex items-center justify-center text-2xl md:text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {service.icon}
              </div>

              <h3 className='font-black text-lg md:text-xl mb-2' style={{ color: '#f0f0ff' }}>{service.title}</h3>
              <p className='text-sm leading-relaxed mb-4' style={{ color: '#9ca3af' }}>{service.desc}</p>

              <div className='mb-4 pb-4' style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <p className='text-xs font-semibold uppercase tracking-wider mb-2' style={{ color: '#a78bfa' }}>What's included:</p>
                <ul className='space-y-1'>
                  {service.details.map((detail, j) => (
                    <li key={j} className='text-xs flex items-center gap-2' style={{ color: '#9ca3af' }}>
                      <span style={{ color: '#a78bfa' }}>✓</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className='w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300 opacity-0 group-hover:opacity-100'
                style={{ background: 'rgba(167,139,250,0.10)', color: '#a78bfa' }}>
                Learn More
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className='text-center py-10 px-5' style={{ zIndex: 1, position: 'relative' }}>
        <p className='text-xs' style={{ color: '#4b5563' }}>
          © 2026 DELTACARE Hospital · All rights reserved
        </p>
      </div>
    </div>
  );
};

export default Services;