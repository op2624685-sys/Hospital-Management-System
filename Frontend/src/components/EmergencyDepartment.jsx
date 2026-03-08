import React, { useState } from 'react'

const ACCENT = '#ef4444'
const BG     = '#fff5f5'

const sections = [
  {
    title: 'Services Offered',
    icon: '⚡',
    items: ['Rapid triage and patient assessment', 'Advanced cardiac life support (ACLS)', 'Trauma care and resuscitation', 'Emergency minor & major procedures', 'Suturing and wound management', 'Emergency intubation and ventilation', 'Emergency obstetric care', 'Pediatric emergency care'],
  },
  {
    title: 'Conditions We Treat',
    icon: '🩺',
    items: ['Chest pain & heart attack', 'Stroke symptoms', 'Severe breathing difficulties', 'Trauma & accidents', 'Fractures & dislocations', 'Severe bleeding', 'Burns', 'Poisoning & drug overdose', 'High fever with complications', 'Seizures'],
  },
  {
    title: 'Facilities & Equipment',
    icon: '🏥',
    items: ['Fully equipped resuscitation bays', 'Cardiac monitors & defibrillators', 'Ventilators', 'Portable X-ray & ultrasound', 'CT scan access', 'Minor procedure room', 'Emergency pharmacy support', 'Dedicated trauma beds'],
  },
  {
    title: 'Emergency Team',
    icon: '👨‍⚕️',
    items: ['Emergency Medicine Specialists', 'Trained Emergency Nurses', 'Trauma Surgeons (on-call)', 'Anesthesiologists (on-call)', 'Critical Care Specialists', 'Paramedical & Ambulance Team'],
  },
  {
    title: 'Ambulance Services',
    icon: '🚑',
    items: ['24/7 ambulance availability', 'Basic & Advanced Life Support (BLS & ALS) ambulances', 'GPS-enabled rapid response'],
  },
  {
    title: 'Patient Support',
    icon: '🤝',
    items: ['Immediate admission to ICU if required', 'Coordination with specialty departments', 'Family counseling and updates', 'Insurance and billing assistance'],
  },
]

const EmergencyDepartment = () => {
  const [active, setActive] = useState(0)

  return (
    <div className='flex flex-col md:flex-row h-full overflow-y-auto md:overflow-visible' style={{ fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Left Panel ── */}
      <div className='flex flex-col w-full md:w-3/5 p-5 md:p-8 md:overflow-y-auto'>

        {/* Hero */}
        <div className='mb-6 md:mb-8'>
          <span
            className='inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4'
            style={{ background: `${ACCENT}15`, color: ACCENT }}>
            <span className='w-1.5 h-1.5 rounded-full animate-pulse' style={{ background: ACCENT }} />
            24/7 Emergency Care
          </span>
          <h2 className='text-3xl md:text-5xl font-black text-gray-900 leading-none mb-3 md:mb-4'>
            Emergency<br />
            <span style={{ color: ACCENT }}>Department</span>
          </h2>
          <p className='text-sm md:text-base text-gray-500 leading-relaxed max-w-xl'>
            Provides immediate medical care for acute illnesses, injuries, and life-threatening conditions.
            Operates 24/7 with physicians, nurses, and trauma specialists trained in rapid assessment and stabilization.
          </p>
        </div>

        {/* Section tabs */}
        <div className='flex flex-wrap gap-2 mb-6'>
          {sections.map((s, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95'
              style={{
                background: active === i ? ACCENT : `${ACCENT}10`,
                color:      active === i ? '#fff' : ACCENT,
              }}>
              {s.icon} {s.title}
            </button>
          ))}
        </div>

        {/* Active section content */}
        <div
          className='rounded-2xl p-5 md:p-6 flex-1'
          style={{ background: BG, border: `1px solid ${ACCENT}20` }}>
          <h3
            className='font-black text-base md:text-lg mb-4 flex items-center gap-2'
            style={{ color: ACCENT }}>
            {sections[active].icon} {sections[active].title}
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            {sections[active].items.map((item, j) => (
              <div key={j} className='flex items-start gap-2'>
                <div
                  className='w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5'
                  style={{ background: `${ACCENT}20` }}>
                  <div className='w-1.5 h-1.5 rounded-full' style={{ background: ACCENT }} />
                </div>
                <p className='text-sm text-gray-600 leading-snug'>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div
        className='w-full md:w-2/5 flex flex-col p-5 md:p-6 gap-5 bg-white md:bg-transparent'
        style={{ borderLeft: `1px solid ${ACCENT}15` }}>

        {/* Image */}
        <div className='rounded-2xl overflow-hidden shadow-md h-48 md:h-56'>
          <img
            src="https://images.unsplash.com/photo-1712215544003-af10130f8eb3?q=80&w=687&auto=format&fit=crop"
            alt="Emergency Department"
            className='w-full h-full object-cover'
          />
        </div>

        {/* Dept Head card */}
        <div className='bg-white rounded-2xl p-5 shadow-sm' style={{ border: `1px solid ${ACCENT}15` }}>
          <p className='text-xs text-gray-400 uppercase tracking-wider font-bold mb-3'>Department Head</p>
          <div className='flex items-center gap-3'>
            <div
              className='w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black text-white shadow-md'
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #dc2626)` }}>
              JD
            </div>
            <div>
              <p className='font-black text-gray-800'>Dr. John Doe</p>
              <p className='text-xs text-gray-400'>Emergency Medicine Specialist</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 gap-3'>
          {[
            { label: 'Team Members', value: '10', icon: '👥' },
            { label: 'Beds Available', value: '20', icon: '🛏️' },
            { label: 'Response Time', value: '15m', icon: '⚡' },
            { label: 'Availability', value: '24/7', icon: '🕐' },
          ].map((stat, i) => (
            <div key={i} className='bg-white rounded-xl p-4 shadow-sm text-center' style={{ border: `1px solid ${ACCENT}15` }}>
              <p className='text-xl mb-1'>{stat.icon}</p>
              <p className='text-xl font-black' style={{ color: ACCENT }}>{stat.value}</p>
              <p className='text-xs text-gray-400 mt-0.5'>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmergencyDepartment