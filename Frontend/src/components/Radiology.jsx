import React, { useState } from 'react'

const ACCENT = '#14b8a6'
const BG     = '#f0fdfa'

const sections = [
  {
    title: 'Services Offered',
    icon: '⚡',
    items: ['Digital X-ray', 'CT scan (multi-slice)', 'MRI (1.5T & 3T)', 'Ultrasound & Doppler', 'PET-CT scan', 'Mammography', 'Bone densitometry (DEXA)', 'Interventional radiology', 'Fluoroscopy', 'Nuclear medicine imaging'],
  },
  {
    title: 'Conditions We Diagnose',
    icon: '🩺',
    items: ['Cancer & tumor detection', 'Fractures & bone injuries', 'Internal bleeding', 'Vascular diseases', 'Liver & kidney disorders', 'Brain & spinal abnormalities', 'Lung & chest diseases', 'Abdominal & pelvic conditions', 'Thyroid & gland disorders', 'Joint & soft tissue injuries'],
  },
  {
    title: 'Facilities & Equipment',
    icon: '🏥',
    items: ['3 Tesla MRI scanner', '128-slice CT scanner', '3D mammography unit', 'Portable ultrasound & X-ray', 'Digital subtraction angiography (DSA)', 'PET-CT suite', 'Nuclear medicine gamma camera', 'Dedicated pediatric imaging room', 'PACS digital reporting system'],
  },
  {
    title: 'Radiology Team',
    icon: '👨‍⚕️',
    items: ['Consultant Radiologists', 'Interventional Radiologists', 'Nuclear Medicine Specialists', 'Radiographers & Technologists', 'Sonographers', 'Medical Physicists', 'Radiology Nurses', 'Report Coordinators'],
  },
  {
    title: 'Interventional Radiology',
    icon: '🔬',
    items: ['Image-guided biopsies', 'Tumor ablation', 'Angioplasty & embolization', 'Drainage procedures', 'Pain management injections', 'TIPS procedure'],
  },
  {
    title: 'Patient Support',
    icon: '🤝',
    items: ['Online appointment booking', 'Same-day emergency reporting', 'Digital report delivery', 'Radiation safety protocols', 'Insurance and billing assistance'],
  },
]

const Radiology = () => {
  const [active, setActive] = useState(0)

  return (
    <div className='flex h-full'>

      <div className='flex flex-col w-3/5 p-8 overflow-y-auto'>
        <div className='mb-8'>
          <span
            className='inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4'
            style={{ background: `${ACCENT}15`, color: ACCENT }}>
            <span className='w-1.5 h-1.5 rounded-full animate-pulse' style={{ background: ACCENT }} />
            Advanced Imaging & Diagnostics
          </span>
          <h2 className='text-5xl font-black text-gray-900 leading-none mb-4'>
            Radiology<br />
            <span style={{ color: ACCENT }}>Department</span>
          </h2>
          <p className='text-gray-500 leading-relaxed max-w-xl'>
            Provides advanced medical imaging services essential for accurate diagnosis and guided treatment.
            Our board-certified radiologists operate state-of-the-art equipment for fast, precise, and reliable results.
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
            src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=687&auto=format&fit=crop"
            alt="Radiology Department"
            className='w-full h-full object-cover'
          />
        </div>

        <div className='bg-white rounded-2xl p-5 shadow-sm' style={{ border: `1px solid ${ACCENT}15` }}>
          <p className='text-xs text-gray-400 uppercase tracking-wider font-bold mb-3'>Department Head</p>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black text-white shadow-md'
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #0d9488)` }}>
              JP
            </div>
            <div>
              <p className='font-black text-gray-800'>Dr. James Parker</p>
              <p className='text-xs text-gray-400'>Consultant Radiologist</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          {[
            { label: 'Team Members', value: '14', icon: '👥' },
            { label: 'MRI Tesla', value: '3T', icon: '🔬' },
            { label: 'CT Slices', value: '128', icon: '⚡' },
            { label: 'Same Day', value: 'Reports', icon: '📋' },
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

export default Radiology