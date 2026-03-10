import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Header from '../components/Header'
import Cardiology from '../components/Cardiology'
import Neurology from '../components/Neurology'
import Orthopedics from '../components/Orthopedics'
import Pediatrics from '../components/Pediatrics'
import Radiology from '../components/Radiology'
import EmergencyDepartment from '../components/EmergencyDepartment'
import GenericDepartment from '../components/GenericDepartment'
import adminApi from '../api/admin'

gsap.registerPlugin(ScrollTrigger)

const HARDCODED_DEPARTMENTS = [
  { component: EmergencyDepartment, accent: '#2563eb', bg: '#eff6ff', label: 'Emergency',  icon: '🚨', number: '01', members: 10, head: 'Dr. John Doe' },
  { component: Cardiology,          accent: '#0ea5e9', bg: '#ecfeff', label: 'Cardiology',  icon: '❤️', number: '02', members: 18, head: 'Dr. Sarah Lee' },
  { component: Neurology,           accent: '#14b8a6', bg: '#f0fdfa', label: 'Neurology',   icon: '🧠', number: '03', members: 15, head: 'Dr. Alan Foster' },
  { component: Orthopedics,         accent: '#10b981', bg: '#ecfdf5', label: 'Orthopedics', icon: '🦴', number: '04', members: 12, head: 'Dr. Robert King' },
  { component: Pediatrics,          accent: '#22c55e', bg: '#f0fdf4', label: 'Pediatrics',  icon: '👶', number: '05', members: 20, head: 'Dr. Emily Chen' },
  { component: Radiology,           accent: '#0284c7', bg: '#eff6ff', label: 'Radiology',   icon: '🔬', number: '06', members: 14, head: 'Dr. James Parker' },
]

const ACCENT_COLORS = ['#2563eb', '#0ea5e9', '#14b8a6', '#10b981', '#22c55e', '#0284c7', '#06b6d4', '#f59e0b', '#d97706', '#ef4444']
const BG_COLORS = ['#eff6ff', '#ecfeff', '#f0fdfa', '#ecfdf5', '#f0fdf4', '#eff6ff', '#ecfeff', '#fffbeb', '#fffbeb', '#fff5f5']

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
  
  const [departments, setDepartments] = useState(HARDCODED_DEPARTMENTS)

  // Fetch departments from backend
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        // Fetch departments from backend
        // Since there's no specific endpoint for all departments, we'll use a mock fetch
        // In production, this would be: const res = await adminApi.getDepartments();
        // For now, we'll just use the hardcoded departments
        // But we'll keep this structure for when the backend endpoint is ready
        
        // Simulating loading created departments from localStorage/context if they exist
        const createdDepts = localStorage.getItem('createdDepartments');
        if (createdDepts) {
          try {
            const parsed = JSON.parse(createdDepts);
            const customDepts = parsed.map((dept, idx) => {
              const colorIdx = (HARDCODED_DEPARTMENTS.length + idx) % ACCENT_COLORS.length;
              const number = String(HARDCODED_DEPARTMENTS.length + idx + 1).padStart(2, '0');
              return {
                component: (props) => (
                  <GenericDepartment 
                    name={dept.name}
                    icon="🏥"
                    description={`${dept.name} - Created via Admin Panel`}
                    members={dept.members || 0}
                    headDoctor={dept.headDoctorName || 'Not assigned'}
                  />
                ),
                accent: ACCENT_COLORS[colorIdx],
                bg: BG_COLORS[colorIdx],
                label: dept.name,
                icon: '🏥',
                number: number,
                members: dept.members || 0,
                head: dept.headDoctorName || 'Not assigned',
              };
            });
            setDepartments([...HARDCODED_DEPARTMENTS, ...customDepts]);
          } catch (err) {
            console.log('No custom departments found');
            setDepartments(HARDCODED_DEPARTMENTS);
          }
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments(HARDCODED_DEPARTMENTS);
      }
    };

    fetchDepartments();
  }, [])

  // Animation and ScrollTrigger setup
  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean)
    const total = cards.length

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
      style={{
        height: `${departments.length * 130}vh`
      }}>

      <Header />

      {/* ═══════════════════════════════════
          PINNED VIEWPORT
      ═══════════════════════════════════ */}
      <div
        ref={containerRef}
        className='relative w-full overflow-hidden'
        style={{ height: '100vh', perspective: '1600px', perspectiveOrigin: 'center 20%', zIndex: 1 }}>

        {/* ── Top accent bar ── */}
        <div
          ref={accentBarRef}
          className='absolute top-0 left-0 w-full h-0.5 z-50'
          style={{ background: departments[0]?.accent || '#2563eb' }}
        />

        {/* ── Progress line ── */}
        <div className='absolute top-0.5 left-0 w-full h-0.5 z-50'
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            ref={progressRef}
            className='h-full rounded-full'
            style={{ width: '0%', background: departments[0]?.accent || '#2563eb', transition: 'background 0.4s' }}
          />
        </div>

        {/* ══════════════════
            LEFT SIDEBAR
        ══════════════════ */}
        <div className='hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-50 flex-col items-start gap-3'>
          <p
            ref={counterRef}
            className='text-[10px] font-black tracking-widest mb-1 font-mono'
            style={{ color: '#64748b' }}>
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
            style={{ color: departments[0]?.accent || '#2563eb' }}>
            {departments[0]?.label || 'Department'}
          </p>
        </div>

        {/* ══════════════════
            SCROLL HINT
        ══════════════════ */}
        <div className='absolute bottom-5 right-8 z-50 flex items-center gap-2 opacity-30'>
          <p className='text-[10px] uppercase tracking-widest font-semibold' style={{ color: '#64748b' }}>Scroll</p>
          <div className='w-4 h-7 border rounded-full flex items-start justify-center pt-1' style={{ borderColor: '#94a3b8' }}>
            <div className='w-0.5 h-1.5 rounded-full animate-bounce' style={{ background: '#2563eb' }} />
          </div>
        </div>

        {/* ══════════════════
            CARDS
        ══════════════════ */}
        {departments.map((dept, i) => {
          const DeptComponent = dept.component
          return (
            <div
              key={dept.label}
              ref={el => (cardRefs.current[i] = el)}
              className='absolute overflow-hidden'
              style={{
                top:             84,
                left:            20,  /* adjusted for mobile, original was 52 */
                right:           20,
                bottom:          16,
                borderRadius:    20,
                background:      '#ffffff',
                border:          '1px solid #dbe6ff',
                willChange:      'transform, opacity',
                transformOrigin: 'center top',
                boxShadow:       `0 8px 60px rgba(0,0,0,0.60), 0 2px 8px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.04)`,
              }}>

              {/* ── Card top strip ── */}
              <div
                className='flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-8 py-3 border-b gap-3 sm:gap-0'
                style={{
                  borderColor: `${dept.accent}18`,
                  background:  dept.bg,
                }}>

                <div className='flex items-center gap-3 sm:gap-4'>
                  {/* Number */}
                  <span
                    className='text-4xl font-black leading-none select-none'
                    style={{ color: `${dept.accent}25` }}>
                    {dept.number}
                  </span>

                  {/* Icon + name */}
                  <div
                    className='w-10 h-10 rounded-xl flex items-center justify-center text-xl'
                    style={{ background: `${dept.accent}15`, boxShadow: `0 0 12px ${dept.accent}20` }}>
                    {dept.icon}
                  </div>
                  <div>
                    <p className='font-black text-lg leading-none' style={{ color: '#0f172a' }}>{dept.label}</p>
                    <p className='text-xs mt-0.5 font-medium' style={{ color: '#64748b' }}>Department</p>
                  </div>
                </div>

                {/* Right meta */}
                <div className='flex items-center gap-6'>
                  <div className='text-right hidden md:block'>
                    <p className='text-xs' style={{ color: '#64748b' }}>Head</p>
                    <p className='text-sm font-bold' style={{ color: '#334155' }}>{dept.head}</p>
                  </div>
                  <div className='text-right hidden md:block'>
                    <p className='text-xs' style={{ color: '#64748b' }}>Members</p>
                    <p className='text-sm font-black' style={{ color: dept.accent }}>{dept.members}</p>
                  </div>

                  {/* Active pill */}
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

              {/* ── Dept content ── */}
              <div
                className='overflow-y-auto'
                style={{ height: 'calc(100% - 62px)', background: '#f8fafc' }}>
                <DeptComponent />
              </div>

              {/* ── Bottom left accent line ── */}
              <div
                className='absolute bottom-0 left-0 h-0.5 rounded-br-xl'
                style={{ width: '30%', background: `linear-gradient(to right, ${dept.accent}, transparent)` }}
              />

              {/* ── Subtle top-right glow ── */}
              <div
                className='absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none'
                style={{ background: `radial-gradient(circle, ${dept.accent}10, transparent 70%)` }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Department

