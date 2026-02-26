import React, { useEffect, useRef } from 'react'
import Header from '../components/Header'
import AppointmentBooking from '../components/AppointmentBooking'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'

const Appointment = () => {
  // refs for animation targets
  const headingRef = useRef(null)
  const taglineRef = useRef(null)
  const paraRef = useRef(null)
  const btnRef = useRef(null)
  const formRef = useRef(null)
  const badgesRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // ── Left side animations ──
    tl.fromTo(taglineRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5 }
    )
    .fromTo(headingRef.current,
      { opacity: 0, x: -80 },
      { opacity: 1, x: 0, duration: 0.8 },
      '-=0.2'
    )
    .fromTo(paraRef.current,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.7 },
      '-=0.4'
    )
    .fromTo(badgesRef.current.children,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.15 },
      '-=0.3'
    )
    .fromTo(btnRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 },
      '-=0.2'
    )

    // ── Right side form ──
    .fromTo(formRef.current,
      { opacity: 0, x: 80 },
      { opacity: 1, x: 0, duration: 0.8 },
      '-=0.8'
    )
  }, [])

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='flex justify-center items-center min-h-screen px-20 py-10 gap-16'>

        {/* ── Left Section ── */}
        <div className='flex flex-col w-1/2 py-10'>

          {/* Tagline pill */}
          <div ref={taglineRef} className='opacity-0'>
            <span className='inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold px-4 py-2 rounded-full mb-6'>
              <span className='w-2 h-2 bg-blue-400 rounded-full animate-pulse'></span>
              HMS Hospital · Appointment System
            </span>
          </div>

          {/* Main heading */}
          <h1 ref={headingRef} className='opacity-0 text-7xl font-bold text-gray-800 leading-tight mb-6'>
            Reserve <br />
            <span className='text-blue-500'>Your</span> Spot
          </h1>

          {/* Paragraph */}
          <p ref={paraRef} className='opacity-0 text-lg text-gray-500 leading-relaxed mb-8 max-w-md'>
            Secure your preferred time slot by booking in advance.
            Our simple appointment system allows you to plan ahead
            and avoid waiting in line, so you can focus on
            <span className='text-gray-700 font-medium'> what matters most.</span>
          </p>

          {/* Stats badges */}
          <div ref={badgesRef} className='flex gap-4 mb-10'>
            <div className='flex flex-col items-center bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm'>
              <span className='text-2xl font-bold text-blue-500'>50+</span>
              <span className='text-xs text-gray-400 mt-1'>Doctors</span>
            </div>
            <div className='flex flex-col items-center bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm'>
              <span className='text-2xl font-bold text-green-500'>24/7</span>
              <span className='text-xs text-gray-400 mt-1'>Available</span>
            </div>
            <div className='flex flex-col items-center bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm'>
              <span className='text-2xl font-bold text-purple-500'>10k+</span>
              <span className='text-xs text-gray-400 mt-1'>Patients</span>
            </div>
          </div>

          {/* Buttons */}
          <div ref={btnRef} className='opacity-0 flex gap-3'>
            <Link
              to="/appointment/check"
              className='flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:border-blue-500 hover:text-blue-500 transition-all duration-300 active:scale-95 text-sm'>
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                  d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
              </svg>
              Check Appointment
            </Link>

            <Link
              to="/doctors"
              className='flex items-center gap-2 bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all duration-300 active:scale-95 text-sm'>
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
              </svg>
              View Doctors
            </Link>
          </div>

          {/* Trust badges */}
          <div className='flex items-center gap-3 mt-10'>
            <div className='flex -space-x-2'>
              {['bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-yellow-400'].map((color, i) => (
                <div key={i} className={`w-8 h-8 ${color} rounded-full border-2 border-white`}></div>
              ))}
            </div>
            <p className='text-sm text-gray-400'>
              <span className='font-semibold text-gray-600'>10,000+</span> patients trust us
            </p>
          </div>
        </div>

        {/* ── Right Section — Form ── */}
        <div ref={formRef} className='opacity-0 w-auto'>
          <AppointmentBooking />
        </div>

      </div>
    </div>
  )
}

export default Appointment
