import React, { useState } from 'react'

const ACCENT = '#f97316'
const BG     = '#fff7ed'

const sections = [
  {
    title: 'Services Offered',
    icon: '⚡',
    items: ['Echocardiography & cardiac imaging', 'Coronary angiography & angioplasty', 'Cardiac catheterization', 'Pacemaker implantation', 'Electrophysiology studies', 'Heart failure management', 'Cardiac rehabilitation', 'Preventive cardiology', 'Holter monitoring', 'Stress testing'],
  },
  {
    title: 'Conditions We Treat',
    icon: '🩺',
    items: ['Coronary artery disease', 'Heart failure & cardiomyopathy', 'Arrhythmias & atrial fibrillation', 'Valvular heart disease', 'Congenital heart defects', 'Hypertension', 'Aortic disorders', 'Peripheral artery disease', 'Pericardial diseases', 'Cardiac infections'],
  },
  {
    title: 'Facilities & Equipment',
    icon: '🏥',
    items: ['Cardiac ICU (CICU)', 'Cardiac catheterization lab', 'Electrophysiology lab', 'Echocardiography suite', 'Nuclear cardiology unit', 'Cardiac MRI & CT', '24-hour Holter monitoring', 'Treadmill stress test lab', 'Pacemaker clinic'],
  },
  {
    title: 'Cardiology Team',
    icon: '👨‍⚕️',
    items: ['Interventional Cardiologists', 'Electrophysiologists', 'Cardiac Surgeons', 'Echocardiographers', 'Cardiac Nurses', 'Cardiac Rehabilitation Specialists', 'Cardiac Dieticians', 'Cardiac Physiologists'],
  },
  {
    title: 'Cardiac Emergency',
    icon: '🚨',
    items: ['24/7 cardiac emergency team', 'Primary PCI for heart attacks', 'Emergency pacemaker insertion', 'Cardiac arrest resuscitation', 'Dedicated cardiac emergency helpline'],
  },
  {
    title: 'Patient Support',
    icon: '🤝',
    items: ['Cardiac rehabilitation programs', 'Lifestyle counseling', 'Medication management', 'Heart failure clinics', 'Insurance and billing assistance'],
  },
]

const Cardiology = () => {
  const [active, setActive] = useState(0)

  return (
    <div className='flex flex-col md:flex-row h-full overflow-y-auto md:overflow-visible'>

      <div className='flex flex-col w-full md:w-3/5 p-5 md:p-8 md:overflow-y-auto'>
        <div className='mb-6 md:mb-8'>
          <span
            className='inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4'
            style={{ background: `${ACCENT}15`, color: ACCENT }}>
            <span className='w-1.5 h-1.5 rounded-full animate-pulse' style={{ background: ACCENT }} />
            Heart & Cardiovascular Care
          </span>
          <h2 className='text-3xl md:text-5xl font-black text-gray-900 leading-none mb-3 md:mb-4'>
            Cardiology<br />
            <span style={{ color: ACCENT }}>Department</span>
          </h2>
          <p className='text-sm md:text-base text-gray-500 leading-relaxed max-w-xl'>
            Comprehensive cardiovascular care combining the latest interventional techniques with compassionate
            patient management. Our cardiologists are dedicated to your heart health at every stage.
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

        <div className='rounded-2xl p-5 md:p-6 flex-1' style={{ background: BG, border: `1px solid ${ACCENT}20` }}>
          <h3 className='font-black text-base md:text-lg mb-4 flex items-center gap-2' style={{ color: ACCENT }}>
            {sections[active].icon} {sections[active].title}
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
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

      <div className='w-full md:w-2/5 flex flex-col p-5 md:p-6 gap-5 bg-white md:bg-transparent' style={{ borderLeft: `1px solid ${ACCENT}15` }}>

        <div className='rounded-2xl overflow-hidden shadow-md h-48 md:h-56'>
          <img
            src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=687&auto=format&fit=crop"
            alt="Cardiology Department"
            className='w-full h-full object-cover'
          />
        </div>

        <div className='bg-white rounded-2xl p-5 shadow-sm' style={{ border: `1px solid ${ACCENT}15` }}>
          <p className='text-xs text-gray-400 uppercase tracking-wider font-bold mb-3'>Department Head</p>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black text-white shadow-md'
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #ea580c)` }}>
              SL
            </div>
            <div>
              <p className='font-black text-gray-800'>Dr. Sarah Lee</p>
              <p className='text-xs text-gray-400'>Interventional Cardiologist</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          {[
            { label: 'Team Members', value: '18', icon: '👥' },
            { label: 'Cath Labs', value: '2', icon: '❤️' },
            { label: 'CICU Beds', value: '15', icon: '🏥' },
            { label: 'Emergency', value: '24/7', icon: '🚨' },
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

export default Cardiology