import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { Hospital } from 'lucide-react';

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
  { title: 'Neurology', desc: 'Expert care for brain and nervous system disorders', icon: '🧠', color: 'from-teal-400 to-teal-600' },
  { title: 'Orthopedics', desc: 'Bone, joint and muscle treatment and rehabilitation', icon: '🦴', color: 'from-orange-400 to-amber-500' },
];

const Home = () => {
  const containerRef = useRef();
  const heroRef = useRef();
  const navRef = useRef();
  const taglineRef = useRef();
  const headingRef = useRef();
  const subheadingRef = useRef();
  const paraRef = useRef();
  const btnsRef = useRef();
  const statsRef = useRef();
  const floatingRef = useRef();
  const servicesRef = useRef();
  const ctaRef = useRef();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // ── Navbar drops in ──
      tl.fromTo(navRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }
      )

      // ── Tagline fades in ──
      .fromTo(taglineRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        '-=0.3'
      )

      // ── Heading slides up ──
      .fromTo(headingRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.9 },
        '-=0.2'
      )

      // ── Subheading slides up ──
      .fromTo(subheadingRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.5'
      )

      // ── Paragraph fades ──
      .fromTo(paraRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.4'
      )

      // ── Buttons pop in ──
      .fromTo(btnsRef.current.children,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.15 },
        '-=0.3'
      )

      // ── Stats stagger in ──
      .fromTo(statsRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
        '-=0.2'
      )

      // ── Floating card pops in ──
      .fromTo(floatingRef.current,
        { opacity: 0, scale: 0.8, x: 80 },
        { opacity: 1, scale: 1, x: 0, duration: 0.9, ease: 'back.out(1.7)' },
        '-=0.8'
      )

      // ── Floating loop animation ──
      gsap.to(floatingRef.current, {
        y: -15,
        duration: 2.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 1.5
      });

      // ── Services section scroll trigger ──
      gsap.fromTo(servicesRef.current.children,
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: servicesRef.current,
            start: 'top 80%',
          }
        }
      );

      // ── CTA section ──
      gsap.fromTo(ctaRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 85%',
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className='min-h-screen bg-[#fafaf8] overflow-hidden'>

      {/* ── Navbar ── */}
      <div ref={navRef} className='opacity-0 sticky top-0 z-50'>
        <Header />
      </div>

      {/* ════════════════════════════════
          HERO SECTION
      ════════════════════════════════ */}
      <section ref={heroRef} className='relative min-h-screen flex items-center overflow-hidden px-20'>

        {/* Background blobs */}
        <div className='absolute top-20 right-20 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-60'></div>
        <div className='absolute bottom-20 left-10 w-72 h-72 bg-rose-100 rounded-full blur-3xl opacity-50'></div>
        <div className='absolute top-1/2 left-1/2 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-40'></div>

        {/* ── Left Content ── */}
        <div className='relative z-10 w-1/2 pr-10'>

          {/* Tagline */}
          <div ref={taglineRef} className='opacity-0 mb-6'>
            <span className='inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest'>
              <span className='w-2 h-2 bg-orange-400 rounded-full animate-pulse'></span>
              World Class Healthcare
            </span>
          </div>

          {/* Heading */}
          <h1 ref={headingRef} className='opacity-0 text-7xl font-black text-gray-900 leading-none mb-3'>
            Your Health,
          </h1>
          <h1 ref={subheadingRef} className='opacity-0 text-7xl font-black leading-none mb-6'>
            <span className='text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-rose-500'>
              Our Priority
            </span>
          </h1>

          {/* Para */}
          <p ref={paraRef} className='opacity-0 text-gray-500 text-lg leading-relaxed max-w-lg mb-10'>
            Experience world-class medical care with our team of expert doctors.
            We combine cutting-edge technology with compassionate care to deliver
            <span className='text-gray-700 font-medium'> the best outcomes for you.</span>
          </p>

          {/* Buttons */}
          <div ref={btnsRef} className='flex gap-4 mb-16'>
            <Link to="/appointment"
              className='group relative overflow-hidden flex items-center gap-2 bg-gray-900 text-white font-bold py-4 px-8 rounded-2xl hover:scale-105 active:scale-95 transition-transform duration-300 shadow-xl shadow-gray-900/20'>
              <span className='absolute inset-0 bg-linear-to-r from-orange-500 to-rose-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300'></span>
              <span className='relative z-10'>Book Appointment</span>
              <span className='relative z-10 group-hover:translate-x-1 transition-transform duration-300'>→</span>
            </Link>

            <Link to="/doctors"
              className='group flex items-center gap-2 bg-white text-gray-700 font-bold py-4 px-8 rounded-2xl border-2 border-gray-200 hover:border-orange-300 hover:text-orange-500 active:scale-95 transition-all duration-300 shadow-sm'>
              Meet Our Doctors
              <span className='group-hover:rotate-45 transition-transform duration-300'>↗</span>
            </Link>
          </div>

          {/* Stats */}
          <div ref={statsRef} className='flex gap-8'>
            {stats.map((stat, i) => (
              <div key={i} className='text-center'>
                <p className='text-2xl mb-0.5'>{stat.icon}</p>
                <p className='text-2xl font-black text-gray-800'>{stat.value}</p>
                <p className='text-xs text-gray-400 mt-0.5'>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right — Floating Card ── */}
        <div ref={floatingRef} className='opacity-0 relative w-1/2 flex justify-center items-center'>

          {/* Main card */}
          <div className='bg-white rounded-3xl shadow-2xl shadow-orange-100 p-8 w-80 border border-orange-50'>

            {/* Card header */}
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-12 h-12 bg-linear-to-br from-orange-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg'>
                <span className='text-white text-xl'><Hospital /></span>
              </div>
              <div>
                <p className='font-black text-gray-800'>DELTACARE</p>
                <p className='text-xs text-gray-400'>Hospital Management</p>
              </div>
            </div>

            {/* Appointment preview */}
            <div className='bg-orange-50 rounded-2xl p-4 mb-4'>
              <p className='text-xs text-orange-400 font-semibold uppercase tracking-wider mb-2'>
                Next Appointment
              </p>
              <p className='font-bold text-gray-800'>Dr. Sarah Johnson</p>
              <p className='text-xs text-gray-500'>Cardiology · Today 2:30 PM</p>
              <div className='flex items-center gap-1 mt-2'>
                <div className='w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse'></div>
                <p className='text-xs text-green-600 font-medium'>Confirmed</p>
              </div>
            </div>

            {/* Quick stats */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='bg-gray-50 rounded-xl p-3 text-center'>
                <p className='text-xl font-black text-orange-500'>50+</p>
                <p className='text-xs text-gray-400'>Doctors</p>
              </div>
              <div className='bg-gray-50 rounded-xl p-3 text-center'>
                <p className='text-xl font-black text-rose-500'>24/7</p>
                <p className='text-xs text-gray-400'>Support</p>
              </div>
            </div>

            {/* Ratings */}
            <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-100'>
              <div className='flex -space-x-2'>
                {['bg-orange-400', 'bg-rose-400', 'bg-amber-400', 'bg-teal-400'].map((c, i) => (
                  <div key={i} className={`w-7 h-7 ${c} rounded-full border-2 border-white`}></div>
                ))}
              </div>
              <div className='text-right'>
                <p className='text-xs font-bold text-gray-700'>⭐ 4.9/5</p>
                <p className='text-xs text-gray-400'>10k+ reviews</p>
              </div>
            </div>
          </div>

          {/* Floating mini cards */}
          <div className='absolute -top-6 -right-4 bg-white rounded-2xl shadow-lg p-3 border border-gray-100'>
            <p className='text-xs font-bold text-gray-700'><img src="https://img.icons8.com/ios-filled/24/000000/ambulance.png"/> Emergency</p>
            <p className='text-xs text-gray-400'>Available Now</p>
          </div>

          <div className='absolute -bottom-4 -left-6 bg-white rounded-2xl shadow-lg p-3 border border-gray-100'>
            <p className='text-xs font-bold text-gray-700'><img src="https://img.icons8.com/ios-filled/24/000000/heart-health.png"/> 10k+ Patients</p>
            <p className='text-xs text-gray-400'>Trust Us</p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          SERVICES SECTION
      ════════════════════════════════ */}
      <section className='px-20 py-24 bg-white'>
        <div className='text-center mb-16'>
          <span className='inline-flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-500 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4'>
            What We Offer
          </span>
          <h2 className='text-5xl font-black text-gray-900'>
            Our <span className='text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-rose-500'>Services</span>
          </h2>
          <p className='text-gray-400 mt-4 max-w-xl mx-auto'>
            Comprehensive healthcare services designed to meet all your medical needs
          </p>
        </div>

        <div ref={servicesRef} className='grid grid-cols-3 gap-6'>
          {services.map((service, i) => (
            <div key={i}
              className='group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden relative'>

              {/* Hover background */}
              <div className={`absolute inset-0 bg-linear-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              <div className={`w-14 h-14 bg-linear-to-br ${service.color} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                {service.icon}
              </div>
              <h3 className='font-black text-gray-800 text-lg mb-2'>{service.title}</h3>
              <p className='text-gray-400 text-sm leading-relaxed'>{service.desc}</p>

              <div className='flex items-center gap-1 mt-4 text-orange-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                Learn more <span className='group-hover:translate-x-1 transition-transform duration-300'>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════
          CTA SECTION
      ════════════════════════════════ */}
      <section ref={ctaRef} className='opacity-0 mx-20 mb-20 rounded-3xl bg-linear-to-br from-gray-900 to-gray-800 px-16 py-20 relative overflow-hidden'>

        {/* Background decorations */}
        <div className='absolute top-0 right-0 w-72 h-72 bg-orange-500 rounded-full blur-3xl opacity-10'></div>
        <div className='absolute bottom-0 left-0 w-56 h-56 bg-rose-500 rounded-full blur-3xl opacity-10'></div>

        <div className='relative z-10 flex justify-between items-center'>
          <div>
            <span className='inline-flex items-center gap-2 bg-white/10 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6'>
              <span className='w-2 h-2 bg-orange-400 rounded-full animate-pulse'></span>
              Get Started Today
            </span>
            <h2 className='text-5xl font-black text-white leading-tight mb-4'>
              Ready to take control <br />
              <span className='text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-rose-400'>
                of your health?
              </span>
            </h2>
            <p className='text-gray-400 text-lg max-w-lg'>
              Book an appointment today and experience world-class healthcare at DELTACARE Hospital.
            </p>
          </div>

          <div className='flex flex-col gap-4 shrink-0'>
            <Link to="/appointment"
              className='group flex items-center gap-3 bg-linear-to-r from-orange-500 to-rose-500 text-white font-bold py-4 px-8 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-orange-500/25'>
              Book Appointment
              <span className='group-hover:translate-x-1 transition-transform duration-300'>→</span>
            </Link>
            <Link to="/doctors"
              className='flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white/20 active:scale-95 transition-all duration-300 border border-white/10'>
              Meet Our Doctors
            </Link>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <div className='text-center pb-10'>
        <p className='text-xs text-gray-400'>
          © 2026 DELTACARE Hospital · All rights reserved
        </p>
      </div>
    </div>
  );
};

export default Home;