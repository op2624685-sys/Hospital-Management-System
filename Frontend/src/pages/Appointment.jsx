import React, { useEffect, useRef } from 'react'
import Header from '../components/Header'
import AppointmentBooking from '../components/AppointmentBooking'
import { Link} from 'react-router-dom'
import { gsap } from 'gsap'

const Appointment = () => {

  const eyebrowRef = useRef(null)
  const titleRef   = useRef(null)
  const paraRef    = useRef(null)
  const statsRef   = useRef(null)
  const btnsRef    = useRef(null)
  const trustRef   = useRef(null)
  const formRef    = useRef(null)
  const decoRef    = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl
      .fromTo(decoRef.current,    { opacity: 0 }, { opacity: 1, duration: 1 })
      .fromTo(eyebrowRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: .5 }, '-=.8')
      .fromTo(titleRef.current,   { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: .8 }, '-=.3')
      .fromTo(paraRef.current,    { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: .7 }, '-=.5')
      .fromTo(statsRef.current.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .4, stagger: .12 }, '-=.4')
      .fromTo(btnsRef.current,    { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .5 }, '-=.2')
      .fromTo(trustRef.current,   { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .4 }, '-=.2')
      .fromTo(formRef.current,    { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: .8 }, '-=.9')
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .ap-page {
          min-height: 100vh;
          background: #f9f6f2;
          font-family: 'Outfit', sans-serif;
          overflow-x: hidden;
        }

        /* ambient */
        .ap-ambient { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .ap-orb { position: absolute; border-radius: 50%; filter: blur(90px); }
        .ap-orb-1 {
          width: 650px; height: 650px; top: -250px; left: -150px;
          background: radial-gradient(circle, rgba(228,35,32,.18), transparent);
          animation: apO1 15s ease-in-out infinite;
        }
        .ap-orb-2 {
          width: 450px; height: 450px; bottom: -150px; right: -100px;
          background: radial-gradient(circle, rgba(245,158,11,.14), transparent);
          animation: apO2 19s ease-in-out infinite;
        }
        .ap-orb-3 {
          width: 300px; height: 300px; top: 45%; left: 45%;
          background: radial-gradient(circle, rgba(16,185,129,.1), transparent);
          animation: apO1 23s ease-in-out infinite reverse;
        }
        @keyframes apO1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-40px)} }
        @keyframes apO2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,30px)} }

        .ap-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,.03) 1px, transparent 1px);
          background-size: 56px 56px;
        }

        /* layout */
        .ap-body {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: center;
          min-height: calc(100vh - 72px);
          padding: 60px 80px;
          gap: 80px;
        }
        .ap-deco-line {
          position: absolute; top: 0; bottom: 0; left: 50%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(0,0,0,.07), transparent);
          pointer-events: none;
        }

        /* left */
        .ap-left { flex: 1; max-width: 540px; display: flex; flex-direction: column; }

        .ap-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase;
          color: #e42320;
          background: rgba(228,35,32,.07);
          border: 1px solid rgba(228,35,32,.18);
          padding: 5px 16px; border-radius: 999px;
          margin-bottom: 24px; width: fit-content;
        }
        .ap-live-dot {
          width: 7px; height: 7px; background: #22c55e; border-radius: 50%; position: relative;
        }
        .ap-live-dot::after {
          content: ''; position: absolute; inset: -2px; border-radius: 50%;
          background: #22c55e40; animation: ldP 1.8s ease-in-out infinite;
        }
        @keyframes ldP { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.8);opacity:0} }

        .ap-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3.5rem, 5.5vw, 6.5rem);
          font-weight: 700; color: #1a1a1a; line-height: 1.0;
          margin: 0 0 20px;
        }
        .ap-title em { font-style: italic; color: #e42320; }

        .ap-para {
          font-size: 1.05rem; color: #888; line-height: 1.75;
          max-width: 440px; margin-bottom: 36px;
        }
        .ap-para strong { color: #1a1a1a; font-weight: 500; }

        /* stats */
        .ap-stats { display: flex; gap: 12px; margin-bottom: 36px; }
        .ap-stat {
          display: flex; flex-direction: column; align-items: center;
          background: #fff; border: 1.5px solid #ebe8e2;
          border-radius: 18px; padding: 16px 24px;
          box-shadow: 0 4px 16px rgba(0,0,0,.05);
          transition: transform .25s, box-shadow .25s;
        }
        .ap-stat:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(0,0,0,.09); }
        .ap-stat-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem; font-weight: 700; line-height: 1; color: #1a1a1a;
        }
        .ap-stat-val.red   { color: #e42320; }
        .ap-stat-val.green { color: #22c55e; }
        .ap-stat-val.amber { color: #d97706; }
        .ap-stat-label {
          font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: #bbb; margin-top: 4px;
        }

        /* buttons */
        .ap-btns { display: flex; gap: 12px; margin-bottom: 40px; }
        .ap-btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; border: 1.5px solid #ebe8e2; color: #555;
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
          padding: 12px 22px; border-radius: 14px; text-decoration: none;
          transition: border-color .2s, color .2s, transform .15s;
        }
        .ap-btn-outline:hover { border-color: #e42320; color: #e42320; transform: translateY(-2px); }
        .ap-btn-solid {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1a1a1a; color: #fff;
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
          padding: 12px 22px; border-radius: 14px; text-decoration: none;
          transition: background .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 4px 16px rgba(0,0,0,.15);
        }
        .ap-btn-solid:hover { background: #333; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.2); }

        /* trust */
        .ap-trust { display: flex; align-items: center; gap: 12px; }
        .ap-trust-avatars { display: flex; }
        .ap-trust-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          border: 2px solid #f9f6f2; margin-left: -8px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: .75rem; font-weight: 700; color: #fff;
        }
        .ap-trust-avatars .ap-trust-avatar:first-child { margin-left: 0; }
        .ap-trust-text { font-size: 13px; color: #aaa; }
        .ap-trust-text strong { color: #1a1a1a; font-weight: 600; }

        /* right */
        .ap-right { flex-shrink: 0; width: 460px; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f0f0f0; }
        ::-webkit-scrollbar-thumb { background: #e42320; border-radius: 3px; }

        @media (max-width: 1024px) {
          .ap-body { flex-direction: column; padding: 40px 24px 60px; gap: 48px; }
          .ap-right { width: 100%; max-width: 460px; }
          .ap-deco-line { display: none; }
        }
      `}</style>

      <div className="ap-page">
        <div className="ap-ambient" ref={decoRef}>
          <div className="ap-orb ap-orb-1" />
          <div className="ap-orb ap-orb-2" />
          <div className="ap-orb ap-orb-3" />
        </div>
        <div className="ap-grid" />

        <Header />

        <div className="ap-body">
          <div className="ap-deco-line" />

          {/* ── Left ── */}
          <div className="ap-left">
            <div ref={eyebrowRef} style={{ opacity: 0 }}>
              <span className="ap-eyebrow">
                <div className="ap-live-dot" />
                Sarda Heart Hospital · Appointments
              </span>
            </div>

            <h1 ref={titleRef} className="ap-title" style={{ opacity: 0 }}>
              Reserve <br /><em>Your</em> Slot
            </h1>

            <p ref={paraRef} className="ap-para" style={{ opacity: 0 }}>
              Secure your preferred time with one of our specialists.
              Book in advance, skip the wait, and focus on{' '}
              <strong>what matters most — your health.</strong>
            </p>

            <div className="ap-stats" ref={statsRef}>
              <div className="ap-stat">
                <span className="ap-stat-val red">50+</span>
                <span className="ap-stat-label">Doctors</span>
              </div>
              <div className="ap-stat">
                <span className="ap-stat-val green">24/7</span>
                <span className="ap-stat-label">Available</span>
              </div>
              <div className="ap-stat">
                <span className="ap-stat-val amber">10k+</span>
                <span className="ap-stat-label">Patients</span>
              </div>
            </div>

            <div className="ap-btns" ref={btnsRef} style={{ opacity: 0 }}>
              <Link to="/appointment/check" className="ap-btn-outline">
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Check Status
              </Link>
              <Link to="/doctors" className="ap-btn-solid">
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Browse Doctors
              </Link>
            </div>

            <div className="ap-trust" ref={trustRef} style={{ opacity: 0 }}>
              <div className="ap-trust-avatars">
                {[['#e42320','#a01a18'],['#22c55e','#16a34a'],['#d97706','#b45309'],['#7c3aed','#5b21b6']].map(([c1,c2],i) => (
                  <div key={i} className="ap-trust-avatar"
                    style={{ background: `linear-gradient(135deg,${c1},${c2})` }}>
                    {['A','B','C','D'][i]}
                  </div>
                ))}
              </div>
              <p className="ap-trust-text"><strong>10,000+</strong> patients trust us</p>
            </div>
          </div>

          {/* ── Right ── */}
          <div className="ap-right" ref={formRef} style={{ opacity: 0 }}>
            <AppointmentBooking />
          </div>
        </div>
      </div>
    </>
  )
}

export default Appointment