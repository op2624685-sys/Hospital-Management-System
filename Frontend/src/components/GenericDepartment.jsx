import React, { useMemo, useState } from 'react'

const GenericDepartment = ({ name, icon, description, members, headDoctor, accent, bg, imageUrl, sectionsJson }) => {
  const [active, setActive] = useState(0)

  const sections = useMemo(() => {
    try {
      const parsed = sectionsJson ? JSON.parse(sectionsJson) : null
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    } catch {
      // ignore invalid JSON, fall back to defaults
    }
    return [
      {
        title: 'About',
        icon: '📋',
        items: [description || 'Department providing specialized medical services'],
      },
      {
        title: 'Team',
        icon: '👥',
        items: [
          `Head Doctor: ${headDoctor || 'TBD'}`,
          `Total Members: ${members || 0}`,
          'Specialized medical professionals',
        ],
      },
      {
        title: 'Services',
        icon: '⚕️',
        items: [
          'Specialized medical care',
          'Patient consultation',
          'Treatment and diagnosis',
          'Follow-up support',
        ],
      },
    ]
  }, [sectionsJson, description, headDoctor, members])

  const ACCENT = accent || 'var(--primary)'
  const BG = bg || 'var(--secondary)'

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
            Department
          </span>
          <h2 className='text-3xl md:text-5xl font-black text-gray-900 leading-none mb-3 md:mb-4'>
            {icon} {name}
          </h2>
          <p className='text-sm md:text-base text-gray-500 leading-relaxed max-w-xl'>
            {description || 'Provides specialized medical services and care for patients.'}
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

        {/* Content */}
        <div>
          <h3 className='text-lg font-bold text-gray-900 mb-4'>
            {sections[active].title}
          </h3>
          <ul className='space-y-3'>
            {sections[active].items.map((item, j) => (
              <li key={j} className='flex items-start gap-3'>
                <span className='text-gray-400 font-bold mt-0.5'>•</span>
                <span className='text-sm text-gray-600'>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right Panel (Info) ── */}
      <div className='w-full md:w-2/5 p-5 md:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l' style={{ borderColor: `${ACCENT}15`, background: BG }}>
        <div>
          {imageUrl && (
            <div
              className='w-full h-36 rounded-2xl mb-5'
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                border: `1px solid ${ACCENT}22`,
              }}
            />
          )}
          <p className='text-xs font-black uppercase tracking-widest text-gray-400 mb-4'>Department Info</p>
          <h3 className='text-2xl font-black text-gray-900 mb-6'>{name}</h3>

          <div className='space-y-6'>
            <div>
              <p className='text-xs font-bold text-gray-400 uppercase mb-2'>Head Doctor</p>
              <p className='text-sm font-semibold text-gray-900'>{headDoctor || 'Not assigned'}</p>
            </div>
            <div>
              <p className='text-xs font-bold text-gray-400 uppercase mb-2'>Team Members</p>
              <p className='text-sm font-semibold text-gray-900'>{members || 0} professionals</p>
            </div>
          </div>
        </div>

        <div className='pt-8 border-t' style={{ borderColor: `${ACCENT}18` }}>
          <p className='text-xs text-gray-500'>Department Status: <span style={{ color: ACCENT }} className='font-bold'>Active</span></p>
        </div>
      </div>
    </div>
  )
}

export default GenericDepartment
