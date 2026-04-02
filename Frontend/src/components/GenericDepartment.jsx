import React, { useMemo, useState, useEffect, useRef } from 'react'
import gsap from 'gsap'

const GenericDepartment = ({ name, icon, description, members, headDoctor, accent, bg, imageUrl, sectionsJson }) => {
  const [active, setActive] = useState(0)
  const containerRef = useRef(null)
  
  const sections = useMemo(() => {
    try {
      const parsed = sectionsJson ? JSON.parse(sectionsJson) : null
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch { }
    return [
      { title: 'Core Function', icon: '⚡', items: [description || 'Advanced clinical unit managing specialized medical protocols.'] },
      { title: 'Authority', icon: '🛡️', items: [`Chief: ${headDoctor || 'Dr. Pending'}`, `Operational Force: ${members || 0} Staff`] },
      { title: 'Methods', icon: '📡', items: ['Digital Diagnostics', 'Tele-consultation', 'Acute Care Management'] }
    ]
  }, [sectionsJson, description, headDoctor, members])

  const ACCENT = accent || 'var(--primary)'

  // GSAP Entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gd-glass', { opacity: 0, y: 30, duration: 1, stagger: 0.2, ease: 'power4.out' })
      gsap.from('.gd-glow', { opacity: 0, scale: 0.8, duration: 2, ease: 'elastic.out' })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className='w-full h-full flex flex-col md:flex-row relative bg-[var(--background)] overflow-hidden font-["Outfit"]'>
      {/* ── Background Aura ── */}
      <div className='gd-glow absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full blur-[160px] pointer-events-none' style={{ background: `${ACCENT}15` }} />
      <div className='gd-glow absolute bottom-[-15%] right-[-10%] w-[50%] h-[60%] rounded-full blur-[140px] pointer-events-none' style={{ background: 'var(--chart-5)10' }} />

      {/* ── Left Control Panel (Metrics & Nav) ── */}
      <div className='w-full md:w-[400px] p-8 md:p-12 flex flex-col justify-between border-r border-[var(--border)] relative z-10'>
        <div className='gd-glass'>
          <div className='inline-flex items-center gap-3 px-4 py-1.5 rounded-full mb-8 border transition-all duration-500' 
            style={{ background: `${ACCENT}10`, borderColor: `${ACCENT}25`, color: ACCENT }}>
            <span className='w-2 h-2 rounded-full animate-pulse' style={{ background: ACCENT }} />
            <span className='text-[10px] font-black uppercase tracking-[0.3em]'>System Core</span>
          </div>
          
          <h2 className='text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-4 flex items-center gap-4'>
            <span className='w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-2xl' style={{ background: 'var(--card)', border: `1px solid ${ACCENT}20` }}>{icon}</span>
            {name}
          </h2>
          <p className='text-sm text-[var(--muted-foreground)] leading-relaxed mb-12 font-medium opacity-60'>{description}</p>

          <div className='space-y-4'>
            {sections.map((s, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className='w-full group relative flex items-center justify-between p-4 rounded-2xl transition-all duration-500 overflow-hidden'
                style={{ 
                   background: active === i ? 'var(--card)' : 'transparent',
                   border: `1px solid ${active === i ? ACCENT : 'transparent'}`
                }}>
                {active === i && <div className='absolute left-0 top-0 w-1 h-full' style={{ background: ACCENT }} />}
                <div className='flex items-center gap-4'>
                  <span className='text-2xl opacity-80 group-hover:scale-125 transition-transform'>{s.icon}</span>
                  <span className={`text-xs font-black uppercase tracking-[0.2em] transition-colors ${active === i ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]'}`}>
                    {s.title}
                  </span>
                </div>
                {active === i && <div className='w-1.5 h-1.5 rounded-full' style={{ background: ACCENT }} />}
              </button>
            ))}
          </div>
        </div>

        <div className='gd-glass pt-8 border-t border-[var(--border)] flex items-center gap-4'>
           <div className='w-12 h-12 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-xl'>📊</div>
           <div>
             <p className='text-[8px] font-black text-[var(--muted-foreground)] uppercase tracking-widest'>Operational Load</p>
             <p className='text-xs font-black text-emerald-500 uppercase tracking-widest'>Optimal Range</p>
           </div>
        </div>
      </div>

      {/* ── Right Immersive Canvas ── */}
      <div className='flex-1 p-8 md:p-16 relative overflow-y-auto gd-custom-scroll'>
        {imageUrl && (
          <div className='gd-glass relative mb-12 group'>
            <div className='absolute inset-[-2px] rounded-[3rem] opacity-20' style={{ background: `linear-gradient(45deg, ${ACCENT}, var(--chart-5))` }} />
            <div className='relative h-64 md:h-80 rounded-[3rem] overflow-hidden border border-[var(--border)] shadow-2xl'>
               <img src={imageUrl} alt={name} className='w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110' />
               <div className='absolute inset-0 bg-gradient-to-t from-[var(--background)]/80 via-transparent to-transparent' />
               <div className='absolute bottom-8 left-8 right-8 flex items-end justify-between'>
                 <div>
                   <h3 className='text-3xl font-black text-white tracking-tighter mb-1 uppercase'>{name}</h3>
                   <span className='text-[10px] font-black tracking-[0.4em] text-white/60 uppercase italic'>Unit Digital Twin</span>
                 </div>
               </div>
            </div>
          </div>
        )}

        <div className='gd-glass mb-16'>
           <p className='text-[12px] font-black text-[var(--primary)] uppercase tracking-[0.5em] mb-6'>Department Active Data</p>
           <h4 className='text-5xl font-black text-[var(--foreground)] tracking-tighter mb-12'>{sections[active].title}</h4>
           
           <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
             {sections[active].items.map((item, j) => (
               <div key={j} className='group flex flex-col p-8 rounded-[2.5rem] bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-500 shadow-xl shadow-black/[0.02]'>
                  <div className='w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-xs font-black' style={{ background: 'var(--sidebar)', color: ACCENT }}>0{j + 1}</div>
                  <p className='text-base text-[var(--foreground)] font-semibold leading-relaxed tracking-tight opacity-80 group-hover:opacity-100 transition-opacity'>{item}</p>
               </div>
             ))}
           </div>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
           {[
             { label: 'Personnel', val: members || 0 },
             { label: 'Cases', val: '1.2k' },
             { label: 'Uptime', val: '99.9%' },
             { label: 'Latency', val: '12ms' }
           ].map((stat, i) => (
             <div key={i} className='p-6 rounded-3xl bg-[var(--sidebar)] border border-[var(--border)] text-center'>
               <p className='text-[8px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-2'>{stat.label}</p>
               <p className='text-xl font-black text-[var(--foreground)] tracking-tight' style={{ color: i===0 ? ACCENT : 'inherit' }}>{stat.val}</p>
             </div>
           ))}
        </div>
      </div>

      <style>{`
        .gd-custom-scroll::-webkit-scrollbar { width: 4px; }
        .gd-custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .gd-custom-scroll::-webkit-scrollbar-thumb { background: ${ACCENT}22; border-radius: 10px; }
      `}</style>
    </div>
  )
}

export default GenericDepartment;
