import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Header from '../components/Header';
import HeroSection from '../components/Home/HeroSection';
import ServicesSection from '../components/Home/ServicesSection';
import CTASection from '../components/Home/CTASection';

const Home = () => {
  const containerRef = useRef();
  const navRef = useRef();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Small global nav animation, letting subcomponents handle their own timelines
      gsap.fromTo(navRef.current, { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}
      className='min-h-screen overflow-hidden'>


      {/* ── Navbar ── */}
      <div ref={navRef} className='opacity-0 sticky top-0 z-50'>
        <Header />
      </div>

      {/* ── Page Sections ── */}
      <HeroSection />
      <ServicesSection />
      <CTASection />

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