import React, { useState } from 'react'

const ACCENT = '#8b5cf6'
const BG     = '#faf5ff'

const sections = [
  {
    title: 'Services Offered',
    icon: '⚡',
    items: ['EEG & nerve conduction studies', 'Brain MRI & CT imaging', 'Lumbar puncture', 'Botox therapy for migraines', 'Deep brain stimulation', 'Epilepsy monitoring', 'Stroke thrombolysis', 'Memory & cognitive assessments', 'Sleep studies', 'Neurovascular intervention'],
  },
  {
    title: 'Conditions We Treat',
    icon: '🩺',
    items: ['Stroke & TIA', 'Epilepsy & seizures', 'Migraine & headache disorders', "Parkinson's disease", 'Multiple sclerosis', "Alzheimer's & dementia", 'Neuropathy', 'Brain tumors', 'Meningitis', 'Movement disorders'],
  },
  {
    title: 'Facilities & Equipment',
    icon: '🏥',
    items: ['Dedicated Stroke Unit', 'Advanced EEG lab', 'High-field MRI (3 Tesla)', 'Intraoperative neuromonitoring', 'Neurophysiology lab', 'Video-EEG epilepsy unit', 'Neurosurgery OT', 'Neurorehabilitation gym'],
  },
  {
    title: 'Neurology Team',
    icon: '👨‍⚕️',
    items: ['Consultant Neurologists', 'Neurosurgeons', 'Epileptologists', 'Neuropsychologists', 'Neuroradiologists', 'Speech & Language Therapists', 'Physiotherapists', 'Occupational Therapists'],
  },
  {
    title: 'Stroke & Emergency Care',
    icon: '🚨',
    items: ['24/7 Stroke Response Team', 'Rapid CT & MRI protocol', 'IV thrombolysis & thrombectomy', 'Stroke ICU (NICU)', 'Dedicated stroke helpline'],
  },
  {
    title: 'Patient Support',
    icon: '🤝',
    items: ['Neurorehabilitation programs', 'Caregiver counseling & training', 'Long-term follow-up clinics', "Support groups for Parkinson's & MS", 'Insurance and billing assistance'],
  },
]

const Neurology = () => {
  const [active, setActive] = useState(0)

  return (
    <div className='flex h-full'>

      {/* ── Left Panel ── */}
      <div className='flex flex-col w-3/5 p-8 overflow-y-auto'>
        <div className='mb-8'>
          <span
            className='inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4'
            style={{ background: `${ACCENT}15`, color: ACCENT }}>
            <span className='w-1.5 h-1.5 rounded-full animate-pulse' style={{ background: ACCENT }} />
            Brain & Nervous System
          </span>
          <h2 className='text-5xl font-black text-gray-900 leading-none mb-4'>
            Neurology<br />
            <span style={{ color: ACCENT }}>Department</span>
          </h2>
          <p className='text-gray-500 leading-relaxed max-w-xl'>
            Dedicated to the diagnosis and treatment of disorders affecting the brain, spinal cord, nerves, and muscles.
            Our neurologists use cutting-edge diagnostic tools and minimally invasive techniques.
          </p>
        </div>

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

      {/* ── Right Panel ── */}
      <div className='w-2/5 flex flex-col p-6 gap-5' style={{ background: BG, borderLeft: `1px solid ${ACCENT}15` }}>

        <div className='rounded-2xl overflow-hidden shadow-md' style={{ height: 220 }}>
          <img
            src="https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=687&auto=format&fit=crop"
            alt="Neurology Department"
            className='w-full h-full object-cover'
          />
        </div>

        <div className='bg-white rounded-2xl p-5 shadow-sm' style={{ border: `1px solid ${ACCENT}15` }}>
          <p className='text-xs text-gray-400 uppercase tracking-wider font-bold mb-3'>Department Head</p>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black text-white shadow-md'
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #7c3aed)` }}>
              AF
            </div>
            <div>
              <p className='font-black text-gray-800'>Dr. Alan Foster</p>
              <p className='text-xs text-gray-400'>Consultant Neurologist</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          {[
            { label: 'Team Members', value: '15', icon: '👥' },
            { label: 'Stroke Unit', value: '24/7', icon: '🧠' },
            { label: 'MRI Tesla', value: '3T', icon: '🔬' },
            { label: 'Helpline', value: '24/7', icon: '📞' },
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

export default Neurology