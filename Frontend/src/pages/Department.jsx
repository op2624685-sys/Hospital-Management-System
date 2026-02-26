import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Header from '../components/Header'
import Cardiology from '../components/Cardiology'
import Neurology from '../components/Neurology'
import Orthopedics from '../components/Orthopedics'
import Pediatrics from '../components/Pediatrics'
import Radiology from '../components/Radiology'
import EmergencyDepartment from '../components/EmergencyDepartment'

gsap.registerPlugin(ScrollTrigger)

const DEPARTMENTS = [
  { component: EmergencyDepartment, accent: '#ef4444', bg: '#fff5f5', label: 'Emergency',  icon: '🚨', number: '01', members: 10, head: 'Dr. John Doe' },
  { component: Cardiology,          accent: '#f97316', bg: '#fff7ed', label: 'Cardiology',  icon: '❤️', number: '02', members: 18, head: 'Dr. Sarah Lee' },
  { component: Neurology,           accent: '#8b5cf6', bg: '#faf5ff', label: 'Neurology',   icon: '🧠', number: '03', members: 15, head: 'Dr. Alan Foster' },
  { component: Orthopedics,         accent: '#10b981', bg: '#f0fdf4', label: 'Orthopedics', icon: '🦴', number: '04', members: 12, head: 'Dr. Robert King' },
  { component: Pediatrics,          accent: '#f59e0b', bg: '#fffbeb', label: 'Pediatrics',  icon: '👶', number: '05', members: 20, head: 'Dr. Emily Chen' },
  { component: Radiology,           accent: '#14b8a6', bg: '#f0fdfa', label: 'Radiology',   icon: '🔬', number: '06', members: 14, head: 'Dr. James Parker' },
]

const Department = () => {
  const wrapperRef    = useRef(null)
  const containerRef  = useRef(null)
  const cardRefs      = useRef([])
  const dotRefs       = useRef([])
  const labelRef      = useRef(null)
  const counterRef    = useRef(null)
  const progressRef   = useRef(null)
  const accentBarRef  = useRef(null)
  const currentIdx    = useRef(0)

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean)
    const total = cards.length

    // ── Initial stack: cards piled, each slightly smaller & offset ──
    cards.forEach((card, i) => {
      gsap.set(card, {
        y:               i * 10,
        scale:           1 - i * 0.025,
        zIndex:          total - i,
        transformOrigin: 'center top',
        opacity:         i === 0 ? 1 : Math.max(0, 1 - i * 0.2),
        rotateX:         0,
        x:               0,
      })
    })

    // ── Sync sidebar UI ──
    const syncUI = (index) => {
      if (currentIdx.current === index) return
      currentIdx.current = index
      const dept = DEPARTMENTS[index]

      // Dots
      dotRefs.current.forEach((dot, j) => {
        if (!dot) return
        gsap.to(dot, {
          scaleX:     j === index ? 3 : 1,
          opacity:    j === index ? 1 : 0.3,
          background: j === index ? dept.accent : '#94a3b8',
          duration:   0.35, ease: 'power2.out',
        })
      })

      // Label
      if (labelRef.current) {
        gsap.fromTo(labelRef.current,
          { y: 8, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
        )
        labelRef.current.textContent  = dept.label
        labelRef.current.style.color  = dept.accent
      }

      // Counter
      if (counterRef.current) {
        gsap.fromTo(counterRef.current,
          { y: 8, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
        )
        counterRef.current.textContent = `${String(index + 1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`
      }

      // Accent bar color
      if (accentBarRef.current) {
        gsap.to(accentBarRef.current, {
          background: dept.accent, duration: 0.4, ease: 'power2.out',
        })
      }
    }

    // ── One trigger per card transition ──
    cards.forEach((card, i) => {
      if (i === total - 1) return
      const nextCards = cards.slice(i + 1)

      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start:   `top+=${i * window.innerHeight * 1.3} top`,
        end:     `top+=${(i + 1) * window.innerHeight * 1.3} top`,
        scrub:   1.2,

        onUpdate: (self) => {
          const p   = self.progress
          const dep = p > 0.5 ? i + 1 : i
          syncUI(dep)

          // Progress bar
          if (progressRef.current) {
            progressRef.current.style.width      = `${((i + p) / (total - 1)) * 100}%`
            progressRef.current.style.background = DEPARTMENTS[i].accent
          }

          // ── Current card sweeps up & scales away ──
          gsap.set(card, {
            y:       `-${80 * p}%`,
            scale:   1 - 0.1 * p,
            opacity: 1 - p * 1.3,
            rotateX: -20 * p,
          })

          // ── Remaining cards rise to fill the gap ──
          nextCards.forEach((nc, j) => {
            const shift = Math.max(0, j - p)
            gsap.set(nc, {
              y:       shift * 10,
              scale:   1 - shift * 0.025,
              opacity: Math.min(1, Math.max(0, 1 - shift * 0.2)),
            })
          })
        },
      })
    })

    // ── Pin the stack on screen ──
    ScrollTrigger.create({
      trigger:       wrapperRef.current,
      start:         'top top',
      end:           `+=${(total - 1) * window.innerHeight * 1.3}`,
      pin:           containerRef.current,
      anticipatePin: 1,
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return (
    <div
      ref={wrapperRef}
      className='bg-[#f7f6f3]'
      style={{ height: `${DEPARTMENTS.length * 130}vh` }}>

      <Header />

      {/* ═══════════════════════════════════
          PINNED VIEWPORT
      ═══════════════════════════════════ */}
      <div
        ref={containerRef}
        className='relative w-full overflow-hidden'
        style={{ height: '100vh', perspective: '1600px', perspectiveOrigin: 'center 20%' }}>

        {/* ── Top accent bar (color shifts per dept) ── */}
        <div
          ref={accentBarRef}
          className='absolute top-0 left-0 w-full h-1 z-50 transition-colors duration-500'
          style={{ background: DEPARTMENTS[0].accent }}
        />

        {/* ── Thin progress line ── */}
        <div className='absolute top-1 left-0 w-full h-0.5 bg-black/5 z-50'>
          <div
            ref={progressRef}
            className='h-full rounded-full'
            style={{ width: '0%', background: DEPARTMENTS[0].accent, transition: 'background 0.4s' }}
          />
        </div>

        {/* ══════════════════
            LEFT SIDEBAR
        ══════════════════ */}
        <div className='absolute left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-start gap-3'>
          <p
            ref={counterRef}
            className='text-[10px] font-black tracking-widest text-gray-400 mb-1 font-mono'>
            01 / {String(DEPARTMENTS.length).padStart(2,'0')}
          </p>

          {DEPARTMENTS.map((dept, i) => (
            <div
              key={i}
              ref={el => (dotRefs.current[i] = el)}
              className='h-1.5 w-1.5 rounded-full origin-left'
              style={{
                background: i === 0 ? dept.accent : '#94a3b8',
                opacity:    i === 0 ? 1 : 0.3,
                transform:  i === 0 ? 'scaleX(3)' : 'scaleX(1)',
              }}
            />
          ))}

          <p
            ref={labelRef}
            className='text-[10px] font-black tracking-widest uppercase mt-1'
            style={{ color: DEPARTMENTS[0].accent }}>
            {DEPARTMENTS[0].label}
          </p>
        </div>

        {/* ══════════════════
            SCROLL HINT
        ══════════════════ */}
        <div className='absolute bottom-5 right-8 z-50 flex items-center gap-2 opacity-40'>
          <p className='text-[10px] uppercase tracking-widest text-gray-500 font-semibold'>Scroll</p>
          <div className='w-4 h-7 border border-gray-400 rounded-full flex items-start justify-center pt-1'>
            <div className='w-0.5 h-1.5 bg-gray-400 rounded-full animate-bounce' />
          </div>
        </div>

        {/* ══════════════════
            CARDS
        ══════════════════ */}
        {DEPARTMENTS.map((dept, i) => {
          const DeptComponent = dept.component
          return (
            <div
              key={dept.label}
              ref={el => (cardRefs.current[i] = el)}
              className='absolute overflow-hidden'
              style={{
                top:             84,
                left:            52,
                right:           20,
                bottom:          16,
                borderRadius:    20,
                background:      '#ffffff',
                willChange:      'transform, opacity',
                transformOrigin: 'center top',
                boxShadow:       '0 8px 60px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
              }}>

              {/* ── Card top strip ── */}
              <div
                className='flex items-center justify-between px-8 py-3 border-b'
                style={{
                  borderColor:     `${dept.accent}22`,
                  background:      dept.bg,
                }}>

                <div className='flex items-center gap-4'>
                  {/* Number */}
                  <span
                    className='text-4xl font-black leading-none select-none'
                    style={{ color: `${dept.accent}30` }}>
                    {dept.number}
                  </span>

                  {/* Icon + name */}
                  <div
                    className='w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm'
                    style={{ background: `${dept.accent}18` }}>
                    {dept.icon}
                  </div>
                  <div>
                    <p className='font-black text-gray-800 text-lg leading-none'>{dept.label}</p>
                    <p className='text-xs text-gray-400 mt-0.5 font-medium'>Department</p>
                  </div>
                </div>

                {/* Right meta */}
                <div className='flex items-center gap-6'>
                  <div className='text-right hidden md:block'>
                    <p className='text-xs text-gray-400'>Head</p>
                    <p className='text-sm font-bold text-gray-700'>{dept.head}</p>
                  </div>
                  <div className='text-right hidden md:block'>
                    <p className='text-xs text-gray-400'>Members</p>
                    <p className='text-sm font-black' style={{ color: dept.accent }}>{dept.members}</p>
                  </div>

                  {/* Active pill */}
                  <div
                    className='flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold'
                    style={{ background: `${dept.accent}15`, color: dept.accent }}>
                    <span
                      className='w-1.5 h-1.5 rounded-full animate-pulse'
                      style={{ background: dept.accent }}
                    />
                    Active
                  </div>
                </div>
              </div>

              {/* ── Dept content ── */}
              <div
                className='overflow-y-auto'
                style={{ height: 'calc(100% - 62px)' }}>
                <DeptComponent />
              </div>

              {/* ── Bottom left accent line ── */}
              <div
                className='absolute bottom-0 left-0 h-1 rounded-br-xl'
                style={{ width: '30%', background: `linear-gradient(to right, ${dept.accent}, transparent)` }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Department