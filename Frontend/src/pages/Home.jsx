import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Header from '../components/Header';
import MainContent from '../components/MainContent';
import Appointment from '../pages/Appointment';
import Doctor from '../pages/Doctor';

const Home = () => {

  const container = useRef();
  const zoomIn = useRef();

  // this was for zoom in content
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      gsap.from(".animate-item", {
        scale: 0,
        opacity: 0,
        transformOrigin: "center center",
        duration: 1,
        ease: "power3.out"
      });

    }, zoomIn);

    return () => ctx.revert();
  }, []);

  // this is navbar animation
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".navbar", {
        opacity: 0,
        y: -100,
        duration: 0.8,
        delay: 0.6,
        stagger: 1,
        onStart: () => {
        }
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div className='min-h-screen flex flex-col'>

      <img
        className='fixed h-screen w-full top-0 right-0 opacity-70'
        src="https://i.pinimg.com/736x/0e/35/f0/0e35f02109614b1eed3422055c9307d6.jpg"
      />

      <div ref={zoomIn} className='relative min-h-screen will-change-transform'>
        <div className='animate-item'>
          <div ref={container} className='navbar'>
            <Header />
          </div>
          <MainContent />
        </div>
      </div>
    </div>
  );
};

export default Home;