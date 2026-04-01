import React, { useEffect, useRef } from 'react'
import Header from '../components/Header'
import AppointmentBooking from '../components/AppointmentBooking'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ToastContainer, Bounce } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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
          background: var(--background);
          font-family: 'Outfit', sans-serif;
          overflow-x: hidden;
        }

        .ap-ambient { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .ap-orb { position: absolute; border-radius: 50%; filter: blur(90px); }
        .ap-orb-1 { width: 650px; height: 650px; top: -240px; left: -170px; opacity: 0.40; background: radial-gradient(circle, var(--secondary), var(--chart-4) 55%, transparent); animation: apO1 14s ease-in-out infinite; }
        .ap-orb-2 { width: 500px; height: 500px; bottom: -160px; right: -130px; opacity: 0.35; background: radial-gradient(circle, var(--chart-4), var(--chart-2) 60%, transparent); animation: apO2 18s ease-in-out infinite; }
        .ap-orb-3 { width: 380px; height: 380px; top: 35%; right: 10%; opacity: 0.25; background: radial-gradient(circle, var(--secondary), transparent); animation: apO1 22s ease-in-out infinite reverse; }
        .ap-orb-4 { width: 300px; height: 300px; bottom: 20%; left: 8%; opacity: 0.22; background: radial-gradient(circle, var(--chart-4), transparent); animation: apO2 16s ease-in-out infinite; }
        .ap-orb-5 { width: 240px; height: 240px; top: 55%; left: 40%; opacity: 0.18; background: radial-gradient(circle, var(--secondary), transparent); animation: apO1 20s ease-in-out infinite; }

        @keyframes apO1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(32px,-42px)} }
        @keyframes apO2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-24px,34px)} }

        .ap-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: linear-gradient(rgba(100,74,64,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(100,74,64,.04) 1px, transparent 1px);
          background-size: 56px 56px;
        }

        .ap-body { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; min-height: calc(100vh - 72px); padding: 60px 80px; gap: 80px; }
        .ap-deco-line { position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; background: linear-gradient(to bottom, transparent, var(--border), transparent); pointer-events: none; }
        .ap-left { flex: 1; max-width: 540px; display: flex; flex-direction: column; }

        .ap-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
          color: var(--primary); background: color-mix(in srgb, var(--primary) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--primary) 22%, transparent);
          padding: 6px 18px; border-radius: 999px; margin-bottom: 26px; width: fit-content; backdrop-filter: blur(8px);
        }

        .ap-live-dot { width: 7px; height: 7px; background: #22c55e; border-radius: 50%; position: relative; flex-shrink: 0; }
        .ap-live-dot::after { content: ''; position: absolute; inset: -2px; border-radius: 50%; background: rgba(34,197,94,0.35); animation: ldP 1.8s ease-in-out infinite; }
        @keyframes ldP { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.8);opacity:0} }

        .ap-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(3.5rem, 5.5vw, 6.5rem); font-weight: 700; color: var(--foreground); line-height: 1.0; margin: 0 0 20px; }
        .ap-title em { font-style: italic; background: linear-gradient(135deg, var(--primary), var(--chart-5)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        .ap-para { font-size: 1.05rem; color: var(--muted-foreground); line-height: 1.78; max-width: 440px; margin-bottom: 36px; }
        .ap-para strong { color: var(--foreground); font-weight: 500; }

        .ap-stats { display: flex; gap: 12px; margin-bottom: 36px; }
        .ap-stat {
          display: flex; flex-direction: column; align-items: center;
          background: var(--card); border: 1px solid var(--border);
          border-radius: 18px; padding: 18px 26px;
          box-shadow: 0 4px 24px color-mix(in srgb, var(--primary) 8%, transparent);
          backdrop-filter: blur(12px); transition: transform .25s, box-shadow .25s, border-color .25s;
        }
        .ap-stat:hover { transform: translateY(-4px); box-shadow: 0 12px 32px color-mix(in srgb, var(--primary) 14%, transparent); border-color: var(--ring); }
        .ap-stat-val { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 700; line-height: 1; }
        .ap-stat-val.red   { color: var(--destructive); }
        .ap-stat-val.green { color: #16a34a; }
        .ap-stat-val.amber { color: var(--primary); }
        .ap-stat-label { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted-foreground); margin-top: 5px; }

        .ap-btns { display: flex; gap: 12px; margin-bottom: 40px; }
        .ap-btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--card); border: 1.5px solid var(--border); color: var(--foreground);
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
          padding: 12px 22px; border-radius: 14px; text-decoration: none; backdrop-filter: blur(8px);
          transition: border-color .2s, color .2s, transform .15s, background .2s;
        }
        .ap-btn-outline:hover { border-color: var(--ring); color: var(--primary); background: color-mix(in srgb, var(--primary) 8%, transparent); transform: translateY(-2px); }

        .ap-btn-solid {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--primary); color: var(--primary-foreground);
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
          padding: 12px 22px; border-radius: 14px; text-decoration: none;
          transition: opacity .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 4px 20px color-mix(in srgb, var(--primary) 30%, transparent);
        }
        .ap-btn-solid:hover { opacity: 0.88; transform: translateY(-2px); box-shadow: 0 8px 28px color-mix(in srgb, var(--primary) 42%, transparent); }

        .ap-trust { display: flex; align-items: center; gap: 12px; }
        .ap-trust-avatars { display: flex; }
        .ap-trust-avatar { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--primary-foreground); margin-left: -8px; display: flex; align-items: center; justify-content: center; font-family: 'Cormorant Garamond', serif; font-size: .75rem; font-weight: 700; color: var(--primary-foreground); background: var(--primary); }
        .ap-trust-avatars .ap-trust-avatar:first-child { margin-left: 0; }
        .ap-trust-text { font-size: 13px; color: var(--muted-foreground); }
        .ap-trust-text strong { color: var(--foreground); font-weight: 600; }

        .ap-right { flex-shrink: 0; width: 460px; margin-top: 22px; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--muted); }
        ::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 3px; }

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
          <div className="ap-orb ap-orb-4" />
          <div className="ap-orb ap-orb-5" />
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
                {['A','B','C','D'].map((l, i) => (
                  <div key={i} className="ap-trust-avatar">{l}</div>
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

        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="light"
          transition={Bounce}
        />
      </div>
    </>
  )
}

export default Appointment
