import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const services = [
  { title: 'Emergency Care', desc: 'Round-the-clock emergency services for critical conditions', icon: '🚨', color: 'from-rose-400 to-rose-600' },
  { title: 'Surgery', desc: 'Advanced surgical procedures with expert surgeons', icon: '🔬', color: 'from-amber-500 to-orange-600' },
  { title: 'Cardiology', desc: 'Comprehensive heart care and cardiac treatments', icon: '❤️', color: 'from-pink-400 to-rose-500' },
  { title: 'Pediatrics', desc: 'Specialized healthcare for infants and children', icon: '👶', color: 'from-amber-400 to-yellow-500' },
  { title: 'Neurology', desc: 'Expert care for brain and nervous system disorders', icon: '🧠', color: 'from-orange-400 to-amber-600' },
  { title: 'Orthopedics', desc: 'Bone, joint and muscle treatment and rehabilitation', icon: '🦴', color: 'from-stone-400 to-stone-600' },
];

const ServicesSection = () => {
  const servicesRef = useRef();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(servicesRef.current.children,
        { opacity: 0, y: 60, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: servicesRef.current, start: 'top 80%' } }
      );
    }, servicesRef); // Scope to component
    
    return () => ctx.revert();
  }, []);

  return (
    <section className='px-5 lg:px-20 py-16 lg:py-24 relative' style={{ zIndex: 1, background: 'rgba(100,74,64,0.04)', borderTop: '1px solid rgba(100,74,64,0.10)', borderBottom: '1px solid rgba(100,74,64,0.10)' }}>
      <div className='text-center mb-16'>
        <span className='inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4'
          style={{ background: 'rgba(100,74,64,0.10)', border: '1px solid rgba(100,74,64,0.20)', color: '#644a40' }}>
          What We Offer
        </span>
        <h2 className='text-5xl font-black' style={{ color: '#202020' }}>
          Our{' '}
          <span className='text-transparent bg-clip-text'
            style={{ backgroundImage: 'linear-gradient(135deg, #644a40, #8b5e52)' }}>
            Services
          </span>
        </h2>
        <p className='mt-4 max-w-xl mx-auto' style={{ color: '#646464' }}>
          Comprehensive healthcare services designed to meet all your medical needs
        </p>
      </div>

      <div ref={servicesRef} className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {services.map((service, i) => (
          <div key={i}
            className='group rounded-2xl p-6 hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden relative'
            style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(100,74,64,0.12)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 48px rgba(100,74,64,0.15)'; e.currentTarget.style.borderColor = 'rgba(100,74,64,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(100,74,64,0.12)'; }}>

            <div className={`w-14 h-14 bg-linear-to-br ${service.color} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              {service.icon}
            </div>
            <h3 className='font-black text-lg mb-2' style={{ color: '#202020' }}>{service.title}</h3>
            <p className='text-sm leading-relaxed' style={{ color: '#646464' }}>{service.desc}</p>

            <div className='flex items-center gap-1 mt-4 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300'
              style={{ color: '#644a40' }}>
              Learn more <span className='group-hover:translate-x-1 transition-transform duration-300'>→</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
