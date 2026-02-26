import React, { useState } from 'react'

const ACCENT = '#10b981'
const BG     = '#f0fdf4'

const sections = [
  {
    title: 'Services Offered',
    icon: '⚡',
    items: ['Joint replacement surgery (knee, hip, shoulder)', 'Arthroscopic surgery', 'Spine surgery', 'Fracture fixation & management', 'Sports injury treatment', 'Physiotherapy & rehabilitation', 'Bone density testing', 'Platelet-rich plasma (PRP) therapy', 'Pediatric orthopedics', 'Limb reconstruction'],
  },
  {
    title: 'Conditions We Treat',
    icon: '🩺',
    items: ['Osteoarthritis & rheumatoid arthritis', 'Fractures & dislocations', 'Ligament & tendon tears (ACL, rotator cuff)', 'Spine disorders (scoliosis, herniated disc)', 'Osteoporosis', 'Bone tumors', 'Clubfoot & developmental disorders', 'Carpal tunnel syndrome', 'Tendinitis & bursitis', 'Sports injuries'],
  },
  {
    title: 'Facilities & Equipment',
    icon: '🏥',
    items: ['Dedicated orthopedic OTs', 'Arthroscopy suites', 'Digital X-ray & bone scan', 'DEXA scan for bone density', '3D gait analysis lab', 'Physiotherapy & hydrotherapy pool', 'Sports medicine clinic', 'Plaster & cast room', 'Prosthetics & orthotics unit'],
  },
  {
    title: 'Orthopedic Team',
    icon: '👨‍⚕️',
    items: ['Orthopedic Surgeons', 'Spine Surgeons', 'Sports Medicine Specialists', 'Physiotherapists', 'Occupational Therapists', 'Rheumatologists', 'Prosthetics & Orthotics Specialists', 'Pain Management Specialists'],
  },
  {
    title: 'Sports Medicine',
    icon: '🏃',
    items: ['Sports injury assessment & treatment', 'Performance & fitness evaluation', 'Return-to-sport programs', 'Biomechanical analysis', 'Injury prevention workshops'],
  },
  {
    title: 'Patient Support',
    icon: '🤝',
    items: ['Pre & post-surgery rehabilitation', 'Home physiotherapy guidance', 'Dietary & bone health counseling', 'Long-term follow-up care', 'Insurance and billing assistance'],
  },
]

const Orthopedics = () => {
  const [active, setActive] = useState(0)

  return (
    <div className='flex h-full'>

      <div className='flex flex-col w-3/5 p-8 overflow-y-auto'>
        <div className='mb-8'>
          <span
            className='inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4'
            style={{ background: `${ACCENT}15`, color: ACCENT }}>
            <span className='w-1.5 h-1.5 rounded-full animate-pulse' style={{ background: ACCENT }} />
            Bones, Joints & Muscles
          </span>
          <h2 className='text-5xl font-black text-gray-900 leading-none mb-4'>
            Orthopedics<br />
            <span style={{ color: ACCENT }}>Department</span>
          </h2>
          <p className='text-gray-500 leading-relaxed max-w-xl'>
            Focuses on the prevention, diagnosis, and treatment of disorders of the bones, joints, ligaments, tendons, and muscles.
            Restoring mobility and improving quality of life through both surgical and non-surgical approaches.
          </p>
        </div>

        <div className='flex flex-wrap gap-2 mb-6'>
          {sections.map((s, i) => (
            <button key={i} onClick={() => setActive(i)}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95'
              style={{ background: active === i ? ACCENT : `${ACCENT}10`, color: active === i ? '#fff' : ACCENT }}>
              {s.icon} {s.title}
            </button>
          ))}
        </div>

        <div className='rounded-2xl p-6 flex-1' style={{ background: BG, border: `1px solid ${ACCENT}20` }}>
          <h3 className='font-black text-lg mb-4 flex items-center gap-2' style={{ color: ACCENT }}>
            {sections[active].icon} {sections[active].title}
          </h3>
          <div className='grid grid-cols-2 gap-3'>
            {sections[active].items.map((item, j) => (
              <div key={j} className='flex items-start gap-2'>
                <div className='w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5' style={{ background: `${ACCENT}20` }}>
                  <div className='w-1.5 h-1.5 rounded-full' style={{ background: ACCENT }} />
                </div>
                <p className='text-sm text-gray-600 leading-snug'>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='w-2/5 flex flex-col p-6 gap-5' style={{ background: BG, borderLeft: `1px solid ${ACCENT}15` }}>

        <div className='rounded-2xl overflow-hidden shadow-md' style={{ height: 220 }}>
          <img
            src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=687&auto=format&fit=crop"
            alt="Orthopedics Department"
            className='w-full h-full object-cover'
          />
        </div>

        <div className='bg-white rounded-2xl p-5 shadow-sm' style={{ border: `1px solid ${ACCENT}15` }}>
          <p className='text-xs text-gray-400 uppercase tracking-wider font-bold mb-3'>Department Head</p>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black text-white shadow-md'
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #059669)` }}>
              RK
            </div>
            <div>
              <p className='font-black text-gray-800'>Dr. Robert King</p>
              <p className='text-xs text-gray-400'>Orthopedic Surgeon</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          {[
            { label: 'Team Members', value: '12', icon: '👥' },
            { label: 'OT Suites', value: '4', icon: '🏥' },
            { label: 'Rehab Pool', value: 'Yes', icon: '💧' },
            { label: 'Sports Clinic', value: '24/7', icon: '🏃' },
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

export default Orthopedics