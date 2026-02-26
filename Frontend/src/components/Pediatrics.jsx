import React, { useState } from 'react'

const ACCENT = '#f59e0b'
const BG     = '#fffbeb'

const sections = [
  {
    title: 'Services Offered',
    icon: '⚡',
    items: ['Newborn care & neonatology', 'Routine well-child check-ups', 'Vaccination & immunization', 'Growth & developmental monitoring', 'Pediatric surgery', 'Child nutrition counseling', 'Allergy & asthma management', 'Pediatric cardiology', 'Pediatric neurology', 'Adolescent medicine'],
  },
  {
    title: 'Conditions We Treat',
    icon: '🩺',
    items: ['Fever & infections', 'Respiratory illnesses (asthma, bronchiolitis)', 'Diarrhea & dehydration', 'Malnutrition', 'Congenital disorders', 'Childhood diabetes', 'ADHD & behavioral issues', 'Developmental delays', 'Anemia', 'Ear & throat infections'],
  },
  {
    title: 'Facilities & Equipment',
    icon: '🏥',
    items: ['Neonatal ICU (NICU)', 'Pediatric ICU (PICU)', 'Child-friendly ward & playroom', 'Pediatric OT & procedure room', 'Incubators & warmers', 'Pediatric ventilators', 'Dedicated pediatric pharmacy', 'Growth & nutrition clinic'],
  },
  {
    title: 'Pediatric Team',
    icon: '👨‍⚕️',
    items: ['Consultant Pediatricians', 'Neonatologists', 'Pediatric Surgeons', 'Pediatric Cardiologists', 'Pediatric Neurologists', 'Child Psychologists', 'Pediatric Nurses', 'Nutritionists & Dieticians'],
  },
  {
    title: 'Neonatal Care',
    icon: '👶',
    items: ['High-dependency NICU for premature babies', 'Kangaroo mother care support', 'Newborn screening programs', 'Phototherapy for jaundice', 'Breastfeeding support & lactation counseling'],
  },
  {
    title: 'Family Support',
    icon: '🤝',
    items: ['Parenting education & counseling', 'School health programs', 'Childhood vaccination schedules', '24/7 pediatric helpline', 'Insurance and billing assistance'],
  },
]

const Pediatrics = () => {
  const [active, setActive] = useState(0)

  return (
    <div className='flex h-full'>

      <div className='flex flex-col w-3/5 p-8 overflow-y-auto'>
        <div className='mb-8'>
          <span
            className='inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4'
            style={{ background: `${ACCENT}15`, color: ACCENT }}>
            <span className='w-1.5 h-1.5 rounded-full animate-pulse' style={{ background: ACCENT }} />
            Child & Infant Healthcare
          </span>
          <h2 className='text-5xl font-black text-gray-900 leading-none mb-4'>
            Pediatrics<br />
            <span style={{ color: ACCENT }}>Department</span>
          </h2>
          <p className='text-gray-500 leading-relaxed max-w-xl'>
            Provides comprehensive medical care for infants, children, and adolescents from birth to 18 years.
            Our pediatric specialists address the unique physical, emotional, and developmental needs of young patients.
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
            src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?q=80&w=687&auto=format&fit=crop"
            alt="Pediatrics Department"
            className='w-full h-full object-cover'
          />
        </div>

        <div className='bg-white rounded-2xl p-5 shadow-sm' style={{ border: `1px solid ${ACCENT}15` }}>
          <p className='text-xs text-gray-400 uppercase tracking-wider font-bold mb-3'>Department Head</p>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black text-white shadow-md'
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #d97706)` }}>
              EC
            </div>
            <div>
              <p className='font-black text-gray-800'>Dr. Emily Chen</p>
              <p className='text-xs text-gray-400'>Consultant Pediatrician</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          {[
            { label: 'Team Members', value: '20', icon: '👥' },
            { label: 'NICU Beds', value: '10', icon: '👶' },
            { label: 'PICU Beds', value: '8', icon: '🏥' },
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

export default Pediatrics