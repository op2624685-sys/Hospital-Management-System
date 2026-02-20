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
  { component: EmergencyDepartment, accent: '#ef4444', label: 'Emergency' },
  { component: Cardiology,          accent: '#f97316', label: 'Cardiology' },
  { component: Neurology,           accent: '#8b5cf6', label: 'Neurology' },
  { component: Orthopedics,         accent: '#0ea5e9', label: 'Orthopedics' },
  { component: Pediatrics,          accent: '#10b981', label: 'Pediatrics' },
  { component: Radiology,           accent: '#f59e0b', label: 'Radiology' },
]

const Department = () => {
  const containerRef = useRef(null)
  const cardRefs = useRef([])

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean)
    const total = cards.length

    // Stack all cards perfectly on top of each other — no peeking
    cards.forEach((card, i) => {
      gsap.set(card, {
        y:               0,
        scale:           1 - i * 0.04,
        zIndex:          total - i,
        transformOrigin: 'center bottom',
        opacity:         1,
      })
    })

    // One ScrollTrigger per card flip
    cards.forEach((card, i) => {
      if (i === total - 1) return

      const remainingCards = cards.slice(i + 1)

      ScrollTrigger.create({
        trigger:  containerRef.current,
        start:    `top+=${i * window.innerHeight * 1.5} top`,
        end:      `top+=${(i + 1) * window.innerHeight * 1.5} top`,
        scrub:    0.8,
        onUpdate: (self) => {
          const p = self.progress

          // Flip current card upward and away
          gsap.set(card, {
            rotateX: -100 * p,
            y:       `${-60 * p}%`,
            scale:   1 - 0.12 * p,
            opacity: 1 - p,
          })

          // Bring remaining cards forward
          remainingCards.forEach((rc, j) => {
            gsap.set(rc, {
              y:     0,
              scale: 1 - j * 0.04,
            })
          })
        },
      })
    })

    // Pin the whole section
    ScrollTrigger.create({
      trigger:       containerRef.current,
      start:         'top top',
      end:           `+=${(total - 1) * window.innerHeight * 1.5}`,
      pin:           true,
      anticipatePin: 1,
      scrub:         true,
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    // Total scroll height for all card transitions
    <div style={{ height: `${DEPARTMENTS.length * 150}vh` }}>

      {/* Header is OUTSIDE the pinned container so cards never cover it */}
      <Header />

      {/* Pinned container — stays on screen while user scrolls */}
      <div
        ref={containerRef}
        className="relative w-full"
        style={{
          height:            '100vh',
          paddingTop:        '96px',   /* matches navbar height (py-6 = 96px total) */
          perspective:       '1200px',
          perspectiveOrigin: 'center 40%',
          overflow:          'hidden',
        }}
      >
        {DEPARTMENTS.map((dept, i) => {
          const DeptComponent = dept.component
          return (
            <div
              key={dept.label}
              ref={el => (cardRefs.current[i] = el)}
              className="absolute inset-0 w-full rounded-2xl overflow-hidden"
              style={{
                top:             '96px',   /* start below navbar */
                height:          'calc(100vh - 96px)',
                background:      '#ffffff',
                borderTop:       `4px solid ${dept.accent}`,
                boxShadow:       '0 -8px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
                willChange:      'transform, opacity',
                transformOrigin: 'center bottom',
              }}
            >
              {/* Coloured department badge */}
              <div
                className="sticky top-3 w-fit mx-auto z-10 text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
                style={{ background: dept.accent, color: '#fff' }}
              >
                {dept.label}
              </div>

              <DeptComponent />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Department