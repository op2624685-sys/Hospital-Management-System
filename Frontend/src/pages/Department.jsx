import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Header from '../components/Header'
import GenericDepartment from '../components/GenericDepartment'
import API from '../api/api'
import { useQuery } from '@tanstack/react-query'

gsap.registerPlugin(ScrollTrigger)

const DEFAULT_ACCENT = 'var(--primary)'
const DEFAULT_BG = 'var(--secondary)'

const getApiErrorMessage = (err, fallback) =>
  err?.response?.data?.error || err?.response?.data?.message || fallback

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
  
  const [error, setError] = useState('')

  const {
    data: departments = [],
    error: departmentsError,
  } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await API.get('/departments')
      const source = Array.isArray(res.data) ? res.data : []

      return source.map((dept, idx) => {
        const name = dept.name || 'Department'
        const accent = dept.accentColor || DEFAULT_ACCENT
        const bg = dept.bgColor || DEFAULT_BG
        const icon = dept.icon || 'DEPT'
        const description = dept.description
        const members = dept.memberCount ?? dept.members ?? 0
        const head = dept.headDoctorName || 'Not assigned'
        const imageUrl = dept.imageUrl || ''
        const number = String(idx + 1).padStart(2, '0')

        return {
          component: () => (
            <GenericDepartment
              name={name}
              icon={icon}
              description={description}
              members={members}
              headDoctor={head}
              accent={accent}
              bg={bg}
              imageUrl={imageUrl}
              sectionsJson={dept.sectionsJson}
            />
          ),
          accent,
          bg,
          label: name,
          icon,
          number,
          members,
          head,
        }
      })
    },
  })

  useEffect(() => {
    if (!departmentsError) {
      setError('')
      return
    }
    setError(getApiErrorMessage(departmentsError, 'Failed to load departments'))
  }, [departmentsError])

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean)
    const total = cards.length
    if (total === 0) return

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

    const syncUI = (index) => {
      if (currentIdx.current === index) return
      currentIdx.current = index
      const dept = departments[index]

      dotRefs.current.forEach((dot, j) => {
        if (!dot) return
        gsap.to(dot, {
          scaleX:     j === index ? 3 : 1,
          opacity:    j === index ? 1 : 0.3,
          background: j === index ? dept.accent : '#94a3b8',
          duration:   0.35, ease: 'power2.out',
        })
      })

      if (labelRef.current) {
        gsap.fromTo(labelRef.current,
          { y: 8, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
        )
        labelRef.current.textContent  = dept.label
        labelRef.current.style.color  = dept.accent
      }

      if (counterRef.current) {
        gsap.fromTo(counterRef.current,
          { y: 8, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
        )
        counterRef.current.textContent = `${String(index + 1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`
      }

      if (accentBarRef.current) {
        gsap.to(accentBarRef.current, {
          background: dept.accent, duration: 0.4, ease: 'power2.out',
        })
      }
    }

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

          if (progressRef.current) {
            progressRef.current.style.width      = `${((i + p) / (total - 1)) * 100}%`
            progressRef.current.style.background = departments[i].accent
          }

          gsap.set(card, {
            y:       `-${80 * p}%`,
            scale:   1 - 0.1 * p,
            opacity: 1 - p * 1.3,
            rotateX: -20 * p,
          })

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

    ScrollTrigger.create({
      trigger:       wrapperRef.current,
      start:         'top top',
      end:           `+=${(total - 1) * window.innerHeight * 1.3}`,
      pin:           containerRef.current,
      anticipatePin: 1,
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [departments])

  return (
    <div
      ref={wrapperRef}
      style={{ height: `${departments.length * 130}vh` }}>

      <Header />

      <div
        ref={containerRef}
        className='relative w-full overflow-hidden'
        style={{ height: '100vh', perspective: '1600px', perspectiveOrigin: 'center 20%', zIndex: 1 }}>

        {/* Top accent bar */}
        <div
          ref={accentBarRef}
          className='absolute top-0 left-0 w-full h-0.5 z-50'
          style={{ background: departments[0]?.accent || 'var(--primary)' }}
        />

        {/* Progress line */}
        <div className='absolute top-0.5 left-0 w-full h-0.5 z-50'
          style={{ background: 'var(--border)' }}>
          <div
            ref={progressRef}
            className='h-full rounded-full'
            style={{ width: '0%', background: departments[0]?.accent || 'var(--primary)', transition: 'background 0.4s' }}
          />
        </div>

        {/* Left sidebar */}
        <div className='hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-50 flex-col items-start gap-3'>
          <p
            ref={counterRef}
            className='text-[10px] font-black tracking-widest mb-1 font-mono'
            style={{ color: 'var(--muted-foreground)' }}>
            01 / {String(departments.length).padStart(2,'0')}
          </p>

          {departments.map((dept, i) => (
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
            style={{ color: departments[0]?.accent || 'var(--primary)' }}>
            {departments[0]?.label || 'Department'}
          </p>
        </div>

        {/* Scroll hint */}
        <div className='absolute bottom-5 right-8 z-50 flex items-center gap-2 opacity-30'>
          <p className='text-[10px] uppercase tracking-widest font-semibold' style={{ color: 'var(--muted-foreground)' }}>Scroll</p>
          <div className='w-4 h-7 border rounded-full flex items-start justify-center pt-1' style={{ borderColor: 'var(--border)' }}>
            <div className='w-0.5 h-1.5 rounded-full animate-bounce' style={{ background: 'var(--primary)' }} />
          </div>
        </div>

        {/* Cards */}
        {departments.map((dept, i) => {
          const DeptComponent = dept.component
          return (
            <div
              key={dept.label}
              ref={el => (cardRefs.current[i] = el)}
              className='absolute overflow-hidden'
              style={{
                top:             84,
                left:            20,
                right:           20,
                bottom:          16,
                borderRadius:    20,
                background:      'var(--card)',
                border:          '1px solid var(--border)',
                willChange:      'transform, opacity',
                transformOrigin: 'center top',
                boxShadow:       `0 8px 60px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)`,
              }}>

              {/* Card top strip */}
              <div
                className='flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-8 py-3 border-b gap-3 sm:gap-0'
                style={{
                  borderColor: `${dept.accent}18`,
                  background:  dept.bg,
                }}>

                <div className='flex items-center gap-3 sm:gap-4'>
                  <span
                    className='text-4xl font-black leading-none select-none'
                    style={{ color: `${dept.accent}25` }}>
                    {dept.number}
                  </span>

                  <div
                    className='w-10 h-10 rounded-xl flex items-center justify-center text-xl'
                    style={{ background: `${dept.accent}15`, boxShadow: `0 0 12px ${dept.accent}20` }}>
                    {dept.icon}
                  </div>
                  <div>
                    <p className='font-black text-lg leading-none' style={{ color: 'var(--foreground)' }}>{dept.label}</p>
                    <p className='text-xs mt-0.5 font-medium' style={{ color: 'var(--muted-foreground)' }}>Department</p>
                  </div>
                </div>

                <div className='flex items-center gap-6'>
                  <div className='text-right hidden md:block'>
                    <p className='text-xs' style={{ color: 'var(--muted-foreground)' }}>Head</p>
                    <p className='text-sm font-bold' style={{ color: 'var(--foreground)' }}>{dept.head}</p>
                  </div>
                  <div className='text-right hidden md:block'>
                    <p className='text-xs' style={{ color: 'var(--muted-foreground)' }}>Members</p>
                    <p className='text-sm font-black' style={{ color: dept.accent }}>{dept.members}</p>
                  </div>

                  <div
                    className='flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold'
                    style={{ background: `${dept.accent}12`, color: dept.accent, border: `1px solid ${dept.accent}25` }}>
                    <span
                      className='w-1.5 h-1.5 rounded-full animate-pulse'
                      style={{ background: dept.accent }}
                    />
                    Active
                  </div>
                </div>
              </div>

              {/* Dept content */}
              <div
                className='overflow-y-auto'
                style={{ height: 'calc(100% - 62px)', background: 'var(--background)' }}>
                <DeptComponent />
              </div>

              {/* Bottom left accent line */}
              <div
                className='absolute bottom-0 left-0 h-0.5 rounded-br-xl'
                style={{ width: '30%', background: `linear-gradient(to right, ${dept.accent}, transparent)` }}
              />

              {/* Subtle top-right glow */}
              <div
                className='absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none'
                style={{ background: `radial-gradient(circle, ${dept.accent}10, transparent 70%)` }}
              />
            </div>
          )
        })}
        {departments.length === 0 && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div
              className='px-6 py-4 rounded-2xl text-center'
              style={{
                background: 'var(--card)',
                border: '1px dashed var(--border)',
                color: 'var(--foreground)',
              }}>
              <p className='text-sm font-semibold'>
                {error ? 'Unable to load departments' : 'No departments available'}
              </p>
              <p className='text-xs mt-1' style={{ color: 'var(--muted-foreground)' }}>
                {error || 'Ask admin to add departments to branches to see them here.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Department
