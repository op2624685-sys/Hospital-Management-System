import React, { useState } from 'react'
import Header from '../components/Header'
import { Link } from 'react-router-dom'

const services = [
  {
    id: 1,
    title: "24/7 Emergency Care",
    description: "Our Emergency Department provides immediate medical attention for critical and urgent health conditions. We ensure the fastest response time with our trained professionals.",
    details: ["Available 24 hours a day", "Advanced Life Support (ALS)", "Average response time: 15 mins"],
    icon: "🚨",
    number: "01",
    color: "from-rose-400 to-rose-500",
    soft: "bg-rose-50",
    border: "border-rose-100",
    text: "text-rose-500",
  },
  {
    id: 2,
    title: "Inpatient Services",
    description: "We offer comfortable and fully equipped inpatient facilities for all patients requiring extended medical care and supervision.",
    details: ["150 total hospital beds", "ICU 24/7 nursing supervision", "Daily specialist rounds"],
    icon: "🏥",
    number: "02",
    color: "from-teal-400 to-teal-600",
    soft: "bg-teal-50",
    border: "border-teal-100",
    text: "text-teal-500",
  },
  {
    id: 3,
    title: "Outpatient Services",
    description: "We provide a wide range of outpatient services including specialist consultations, examinations and follow-up treatments without admission.",
    details: ["Specialist consultations", "Diagnostic tests", "Therapeutic procedures"],
    icon: "🩺",
    number: "03",
    color: "from-emerald-400 to-emerald-600",
    soft: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-500",
  },
  {
    id: 4,
    title: "Diagnostic Services",
    description: "We offer advanced diagnostic services including the latest imaging technology and comprehensive laboratory tests for accurate results.",
    details: ["CT scans", "MRI scans", "Ultrasound", "PET scans"],
    icon: "🔬",
    number: "04",
    color: "from-violet-400 to-violet-600",
    soft: "bg-violet-50",
    border: "border-violet-100",
    text: "text-violet-500",
  },
  {
    id: 5,
    title: "Medical Services",
    description: "We offer a comprehensive range of medical services including general medicine, internal medicine and specialty care with our expert team.",
    details: ["General medicine", "Internal medicine", "Cardiology", "Neurology"],
    icon: "❤️",
    number: "05",
    color: "from-teal-400 to-emerald-500",
    soft: "bg-teal-50",
    border: "border-teal-100",
    text: "text-teal-500",
  },
  {
    id: 6,
    title: "Pharmacy Services",
    description: "We offer a wide range of pharmacy services including prescription medication, over-the-counter medications and expert pharmaceutical advice.",
    details: ["Prescription medication", "Over-the-counter medications", "Herbal remedies"],
    icon: "💊",
    number: "06",
    color: "from-amber-400 to-orange-400",
    soft: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-500",
  },
];

const Services = () => {
  const [activeId, setActiveId] = useState(null);

  return (
    <div className='min-h-screen bg-white overflow-x-hidden'>
      <Header />

      {/* ══════════════════════
          HERO
      ══════════════════════ */}
      <section className='relative pt-40 pb-24 px-20 overflow-hidden'>

        {/* Soft background blobs */}
        <div className='absolute top-20 right-0 w-125 h-125 bg-teal-50 rounded-full blur-3xl opacity-80'></div>
        <div className='absolute bottom-0 left-20 w-72 h-72 bg-emerald-50 rounded-full blur-3xl opacity-60'></div>

        <div className='relative z-10 flex justify-between items-end'>
          <div className='max-w-2xl'>
            <span className='inline-flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-600 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6'>
              <span className='w-2 h-2 bg-teal-400 rounded-full animate-pulse'></span>
              HMS · DELTACARE Hospital
            </span>
            <h1 className='text-8xl font-black text-gray-900 leading-none mb-6'>
              Our <br />
              <span className='text-transparent bg-clip-text bg-linear-to-r from-teal-500 to-emerald-500'>
                Services
              </span>
            </h1>
            <p className='text-gray-400 text-xl leading-relaxed max-w-lg'>
              Comprehensive healthcare solutions designed around you — available
              <span className='text-gray-700 font-semibold'> round the clock.</span>
            </p>
          </div>

          {/* Right side — service count pill */}
          <div className='flex flex-col items-end gap-4 shrink-0'>
            <div className='bg-gray-900 text-white px-8 py-6 rounded-3xl text-center'>
              <p className='text-5xl font-black text-teal-400'>{services.length}</p>
              <p className='text-xs text-gray-400 mt-1 uppercase tracking-widest'>Services</p>
            </div>
            <div className='flex gap-3'>
              <div className='bg-teal-50 border border-teal-100 px-5 py-3 rounded-2xl text-center'>
                <p className='text-xl font-black text-teal-600'>50+</p>
                <p className='text-xs text-gray-400'>Doctors</p>
              </div>
              <div className='bg-emerald-50 border border-emerald-100 px-5 py-3 rounded-2xl text-center'>
                <p className='text-xl font-black text-emerald-600'>24/7</p>
                <p className='text-xs text-gray-400'>Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════
          ACCORDION SERVICES LIST
      ══════════════════════ */}
      <section className='px-20 pb-20'>

        {/* Section label row */}
        <div className='flex items-center justify-between border-t-2 border-gray-900 pt-6 mb-2'>
          <p className='text-xs font-black text-gray-400 uppercase tracking-widest'>Service</p>
          <p className='text-xs font-black text-gray-400 uppercase tracking-widest'>Details</p>
        </div>

        {/* Services as expandable rows */}
        <div className='flex flex-col'>
          {services.map((service, i) => (
            <div
              key={service.id}
              className={`border-b border-gray-100 transition-all duration-500 cursor-pointer
                ${activeId === service.id ? 'bg-gray-50' : 'hover:bg-gray-50/50'}`}
              onClick={() => setActiveId(activeId === service.id ? null : service.id)}>

              {/* ── Row Header ── */}
              <div className='flex items-center gap-8 py-7 px-6'>

                {/* Number */}
                <span className={`text-5xl font-black ${service.text} opacity-20 w-16 shrink-0 select-none`}>
                  {service.number}
                </span>

                {/* Icon */}
                <div className={`w-14 h-14 bg-linear-to-br ${service.color} rounded-2xl flex items-center justify-center text-2xl shadow-md shrink-0
                  transition-transform duration-300 ${activeId === service.id ? 'scale-110' : ''}`}>
                  {service.icon}
                </div>

                {/* Title + Description */}
                <div className='flex-1 min-w-0'>
                  <h3 className='text-2xl font-black text-gray-800'>{service.title}</h3>
                  <p className={`text-sm text-gray-400 mt-1 transition-all duration-300
                    ${activeId === service.id ? 'opacity-0 h-0' : 'opacity-100'}`}>
                    {service.description.slice(0, 70)}...
                  </p>
                </div>

                {/* Tags */}
                <div className='hidden lg:flex gap-2 shrink-0'>
                  {service.details.slice(0, 2).map((d, j) => (
                    <span key={j}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl ${service.soft} ${service.text} border ${service.border}`}>
                      {d}
                    </span>
                  ))}
                </div>

                {/* Expand arrow */}
                <div className={`w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center shrink-0
                  transition-all duration-300 ${activeId === service.id ? `bg-linear-to-br ${service.color} border-transparent` : ''}`}>
                  <svg
                    className={`w-4 h-4 transition-all duration-300
                      ${activeId === service.id ? 'text-white rotate-45' : 'text-gray-400'}`}
                    fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M12 4v16m8-8H4' />
                  </svg>
                </div>
              </div>

              {/* ── Expanded Content ── */}
              <div className={`overflow-hidden transition-all duration-500
                ${activeId === service.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className='px-6 pb-8 flex gap-10 items-start'>

                  {/* Left — full description */}
                  <div className='flex-1'>
                    <p className='text-gray-500 leading-relaxed'>{service.description}</p>
                    <Link to='/appointment'
                      className={`inline-flex items-center gap-2 mt-6 bg-linear-to-r ${service.color} text-white text-sm font-bold py-3 px-6 rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-md`}>
                      Book This Service →
                    </Link>
                  </div>

                  {/* Right — all details */}
                  <div className={`${service.soft} border ${service.border} rounded-2xl p-6 min-w-64`}>
                    <p className={`text-xs font-black ${service.text} uppercase tracking-widest mb-4`}>
                      What's Included
                    </p>
                    <ul className='flex flex-col gap-3'>
                      {service.details.map((item, j) => (
                        <li key={j} className='flex items-center gap-3 text-sm text-gray-700 font-medium'>
                          <div className={`w-6 h-6 bg-linear-to-br ${service.color} rounded-lg flex items-center justify-center shrink-0`}>
                            <svg className='w-3 h-3 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                            </svg>
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════
          CTA BANNER
      ══════════════════════ */}
      <section className='mx-20 mb-20 rounded-3xl overflow-hidden relative'>
        <div className='bg-linear-to-br from-teal-500 to-emerald-600 px-16 py-16 relative overflow-hidden'>

          {/* Decorative circles */}
          <div className='absolute -top-10 -right-10 w-64 h-64 bg-white opacity-5 rounded-full'></div>
          <div className='absolute -bottom-10 -left-10 w-48 h-48 bg-white opacity-5 rounded-full'></div>
          <div className='absolute top-1/2 right-1/4 w-32 h-32 bg-emerald-400 opacity-20 rounded-full blur-xl'></div>

          <div className='relative z-10 flex justify-between items-center'>
            <div>
              <span className='inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-5'>
                <span className='w-2 h-2 bg-white rounded-full animate-pulse'></span>
                Ready to Get Started?
              </span>
              <h2 className='text-5xl font-black text-white leading-tight mb-3'>
                Book an Appointment <br /> with Our Experts
              </h2>
              <p className='text-teal-100 text-lg max-w-md'>
                Experience world-class medical care today. Our team is available 24/7.
              </p>
            </div>

            <div className='flex flex-col gap-3 shrink-0'>
              <Link to='/appointment'
                className='group flex items-center gap-2 bg-white text-teal-600 font-black py-4 px-8 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl'>
                Book Appointment
                <span className='group-hover:translate-x-1 transition-transform duration-300'>→</span>
              </Link>
              <Link to='/contact'
                className='flex items-center justify-center gap-2 bg-white/20 text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white/30 active:scale-95 transition-all duration-300 border border-white/20 text-sm'>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className='text-center pb-10'>
        <p className='text-xs text-gray-400'>© 2026 DELTACARE Hospital · All rights reserved</p>
      </div>
    </div>
  )
}

export default Services