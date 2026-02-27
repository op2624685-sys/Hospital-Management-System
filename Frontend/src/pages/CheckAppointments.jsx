import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/api'

const statusConfig = {
  PENDING: {
    label: 'Pending Confirmation',
    banner: 'linear-gradient(135deg, #b45309, #d97706, #f59e0b)',
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  },
  CONFIRMED: {
    label: 'Confirmed',
    banner: 'linear-gradient(135deg, #047857, #059669, #10b981)',
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  },
  CANCELLED: {
    label: 'Cancelled',
    banner: 'linear-gradient(135deg, #9b1c1c, #e42320, #ef4444)',
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  },
}

const CheckAppointment = () => {
  const [appointmentId, setAppointmentId] = useState('')
  const [appointment, setAppointment]     = useState(null)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)
  const [pasted, setPasted]               = useState(false)
  const [shake, setShake]                 = useState(false)
  const resultRef = useRef(null)

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setAppointmentId(text.trim())
      setPasted(true)
      setTimeout(() => setPasted(false), 2200)
    } catch (err) { console.error('Clipboard denied:', err) }
  }

  const handleCheck = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null); setAppointment(null)
    try {
      const res = await API.get(`/patients/appointments/check/${appointmentId}`)
      setAppointment(res.data)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120)
    } catch {
      setError('No appointment found. Please verify your ID and try again.')
      setShake(true); setTimeout(() => setShake(false), 500)
    } finally { setLoading(false) }
  }

  const reset = () => { setAppointment(null); setAppointmentId(''); setError(null) }

  const formattedDate = appointment
    ? new Date(appointment.appointmentTime).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })
    : null

  const status = appointment ? (statusConfig[appointment.status] || statusConfig.PENDING) : null
  const initials = (n='') => n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || '??'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ck-page {
          min-height: 100vh;
          background: #0f0f0f;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          overflow-x: hidden;
        }

        .ck-grain {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: .7;
        }

        .ck-ambient { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
        .ck-glow { position: absolute; border-radius: 50%; filter: blur(120px); }
        .ck-glow-1 {
          width: 700px; height: 700px; top: -300px; right: -200px;
          background: radial-gradient(circle, rgba(228,35,32,.2), transparent);
          animation: ckG1 16s ease-in-out infinite;
        }
        .ck-glow-2 {
          width: 500px; height: 500px; bottom: -200px; left: -150px;
          background: radial-gradient(circle, rgba(124,58,237,.12), transparent);
          animation: ckG2 20s ease-in-out infinite;
        }
        @keyframes ckG1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,50px)} }
        @keyframes ckG2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }

        .ck-wrap {
          position: relative; z-index: 1;
          display: grid; grid-template-columns: 1fr 1fr;
          min-height: calc(100vh - 72px);
        }

        /* ── LEFT ── */
        .ck-left {
          display: flex; flex-direction: column; justify-content: center;
          padding: 60px 56px; position: relative;
          border-right: 1px solid rgba(255,255,255,.06);
        }
        .ck-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(228,35,32,.1); border: 1px solid rgba(228,35,32,.22);
          color: #ff6b6b; font-size: 11px; font-weight: 600; letter-spacing: .16em;
          text-transform: uppercase; padding: 5px 14px; border-radius: 999px;
          margin-bottom: 28px; width: fit-content;
        }
        .ck-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; position: relative; }
        .ck-tag-dot::after {
          content: ''; position: absolute; inset: -2px; border-radius: 50%;
          background: rgba(34,197,94,.4); animation: ckPulse 2s ease-in-out infinite;
        }
        @keyframes ckPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.8);opacity:0} }

        .ck-heading {
          font-family: 'Fraunces', serif;
          font-size: clamp(3rem, 4.5vw, 5.5rem);
          font-weight: 900; line-height: .95; color: #fff;
          margin-bottom: 24px; letter-spacing: -.02em;
        }
        .ck-heading .red { color: #e42320; font-style: italic; }
        .ck-heading .ghost { -webkit-text-stroke: 1.5px rgba(255,255,255,.25); color: transparent; }

        .ck-desc { font-size: 15px; color: rgba(255,255,255,.35); line-height: 1.75; max-width: 360px; margin-bottom: 48px; }

        .ck-steps { display: flex; flex-direction: column; gap: 16px; }
        .ck-step { display: flex; align-items: flex-start; gap: 16px; }
        .ck-step-num {
          width: 30px; height: 30px; border-radius: 9px;
          background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: rgba(255,255,255,.4);
          flex-shrink: 0; font-family: 'Fraunces', serif; margin-top: 2px;
        }
        .ck-step-text { font-size: 13px; color: rgba(255,255,255,.35); line-height: 1.55; }
        .ck-step-text strong { color: rgba(255,255,255,.7); font-weight: 600; }

        /* ── RIGHT ── */
        .ck-right { display: flex; flex-direction: column; justify-content: center; padding: 60px 56px; }

        .ck-form-label {
          font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
          color: rgba(255,255,255,.25); margin-bottom: 12px;
          display: flex; align-items: center; gap: 10px;
        }
        .ck-form-label::before { content:''; width:20px; height:1px; background: rgba(228,35,32,.5); }

        .ck-input-group {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09);
          border-radius: 16px; padding: 5px; display: flex; gap: 6px; align-items: center;
          margin-bottom: 10px; transition: border-color .2s, box-shadow .2s;
        }
        .ck-input-group:focus-within { border-color: rgba(228,35,32,.45); box-shadow: 0 0 0 4px rgba(228,35,32,.07); }
        .ck-input-group.shake { animation: ckShake .45s ease; }
        @keyframes ckShake {
          0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)}
          40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)}
        }

        .ck-input {
          flex:1; background:transparent; border:none; outline:none;
          font-family:'DM Sans',monospace; font-size:13px; color:#fff;
          padding:13px 16px; letter-spacing:.02em;
        }
        .ck-input::placeholder { color:rgba(255,255,255,.18); }

        .ck-paste-btn {
          display:flex; align-items:center; gap:6px; padding:10px 14px;
          border-radius:11px; border:1px solid rgba(255,255,255,.09);
          background:rgba(255,255,255,.05); color:rgba(255,255,255,.35);
          font-size:12px; font-weight:600; cursor:pointer;
          transition:all .2s; white-space:nowrap; font-family:'DM Sans',sans-serif;
          flex-shrink:0;
        }
        .ck-paste-btn:hover { border-color:rgba(255,255,255,.2); color:rgba(255,255,255,.65); }
        .ck-paste-btn.pasted { border-color:rgba(34,197,94,.4); background:rgba(34,197,94,.1); color:#22c55e; }

        .ck-hint { font-size:11.5px; color:rgba(255,255,255,.18); margin-bottom:22px; padding-left:2px; }

        .ck-submit {
          width:100%; padding:16px; background:linear-gradient(135deg,#e42320,#c41c1a);
          color:#fff; border:none; border-radius:14px;
          font-family:'DM Sans',sans-serif; font-size:14px; font-weight:700;
          cursor:pointer; letter-spacing:.03em;
          display:flex; align-items:center; justify-content:center; gap:10px;
          transition:opacity .2s, transform .15s, box-shadow .2s;
          box-shadow:0 8px 32px rgba(228,35,32,.3);
        }
        .ck-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 14px 40px rgba(228,35,32,.45); }
        .ck-submit:active:not(:disabled) { transform:scale(.98); }
        .ck-submit:disabled { opacity:.3; cursor:not-allowed; }
        .ck-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }

        .ck-error {
          margin-top:16px; padding:14px 18px;
          background:rgba(228,35,32,.08); border:1px solid rgba(228,35,32,.22);
          border-radius:12px; display:flex; align-items:center; gap:12px;
          animation:ckFadeUp .3s ease both;
        }
        @keyframes ckFadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .ck-error-msg { font-size:13px; color:#ff9090; }

        /* ── RESULT ── */
        .ck-result {
          margin-top:28px; border-radius:18px; overflow:hidden;
          border:1px solid rgba(255,255,255,.09);
          animation:ckFadeUp .5s ease both;
        }

        .ck-result-banner {
          position:relative; padding:20px 24px; overflow:hidden;
        }
        .ck-rbn-bg { position:absolute; inset:0; z-index:0; }
        .ck-rbn-noise {
          position:absolute; inset:0; z-index:1; opacity:.12;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .ck-banner-inner {
          position:relative; z-index:2;
          display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;
        }
        .ck-banner-left { display:flex; align-items:center; gap:12px; }
        .ck-banner-icon {
          width:42px; height:42px; border-radius:12px;
          background:rgba(255,255,255,.15); backdrop-filter:blur(8px);
          border:1px solid rgba(255,255,255,.2);
          display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0;
        }
        .ck-banner-title { font-family:'Fraunces',serif; font-size:1.2rem; font-weight:700; color:#fff; line-height:1.2; }
        .ck-banner-sub { font-size:11.5px; color:rgba(255,255,255,.5); margin-top:2px; }
        .ck-banner-badge {
          background:rgba(255,255,255,.15); backdrop-filter:blur(8px);
          border:1px solid rgba(255,255,255,.2); color:#fff;
          font-size:11px; font-weight:700; padding:6px 14px; border-radius:999px; white-space:nowrap;
        }

        .ck-result-body {
          background:rgba(255,255,255,.03); border-top:1px solid rgba(255,255,255,.07); padding:20px 24px;
        }

        .ck-id-strip {
          background:rgba(255,255,255,.04); border:1px dashed rgba(255,255,255,.1);
          border-radius:10px; padding:12px 16px; margin-bottom:18px;
          display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;
        }
        .ck-id-label { font-size:10px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,255,255,.22); }
        .ck-id-val { font-family:monospace; font-size:12px; font-weight:700; color:#ff6b6b; word-break:break-all; }

        .ck-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; }
        .ck-info-cell {
          background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07);
          border-radius:14px; padding:14px 16px; transition:background .2s, border-color .2s;
        }
        .ck-info-cell:hover { background:rgba(255,255,255,.07); border-color:rgba(255,255,255,.12); }
        .ck-cell-top { display:flex; align-items:center; gap:7px; margin-bottom:10px; }
        .ck-cell-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
        .ck-cell-lbl { font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.28); }
        .ck-cell-avatar {
          width:34px; height:34px; border-radius:50%; margin-bottom:8px;
          display:flex; align-items:center; justify-content:center;
          font-family:'Fraunces',serif; font-size:.8rem; font-weight:900; color:#fff;
        }
        .ck-cell-name { font-size:13px; font-weight:700; color:#fff; margin-bottom:4px; line-height:1.3; }
        .ck-cell-meta { font-size:11.5px; color:rgba(255,255,255,.32); line-height:1.65; }

        .ck-reset {
          width:100%; padding:12px; background:transparent;
          border:1px solid rgba(255,255,255,.09); color:rgba(255,255,255,.3);
          border-radius:12px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
          cursor:pointer; transition:all .2s;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .ck-reset:hover { border-color:rgba(255,255,255,.22); color:rgba(255,255,255,.65); background:rgba(255,255,255,.05); }

        .ck-note { font-size:12px; color:rgba(255,255,255,.16); margin-top:20px; text-align:center; }

        @media (max-width:860px) {
          .ck-wrap { grid-template-columns:1fr; }
          .ck-left { padding:40px 28px 24px; border-right:none; border-bottom:1px solid rgba(255,255,255,.06); }
          .ck-heading { font-size:3.2rem; }
          .ck-right { padding:32px 28px 60px; }
        }
        @media (max-width:480px) {
          .ck-info-grid { grid-template-columns:1fr; }
          .ck-heading { font-size:2.6rem; }
        }
        /* ── navbar ── */
        .ck-nav {
          position: sticky; top: 0; z-index: 100;
          height: 64px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px;
          background: rgba(10,10,10,.88);
          backdrop-filter: saturate(180%) blur(24px);
          -webkit-backdrop-filter: saturate(180%) blur(24px);
          border-bottom: 1px solid rgba(255,255,255,.06);
          box-shadow: 0 1px 0 rgba(255,255,255,.04);
        }
        /* logo */
        .ck-nav-logo {
          display: flex; align-items: center; gap: 11px;
          text-decoration: none; flex-shrink: 0;
        }
        .ck-nav-mark {
          width: 36px; height: 36px; border-radius: 11px; flex-shrink: 0;
          background: linear-gradient(145deg, #e42320 0%, #9b1c1c 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 1px rgba(228,35,32,.4), 0 4px 16px rgba(228,35,32,.3);
        }
        .ck-nav-wordmark {
          display: flex; flex-direction: column; line-height: 1;
        }
        .ck-nav-name {
          font-family: 'Fraunces', serif;
          font-size: 15px; font-weight: 900; color: #fff; letter-spacing: -.01em;
        }
        .ck-nav-name em { font-style: italic; color: #e42320; }
        .ck-nav-tagline {
          font-size: 10px; color: rgba(255,255,255,.28);
          letter-spacing: .08em; text-transform: uppercase; margin-top: 2px;
        }
        /* center links */
        .ck-nav-center {
          display: flex; align-items: center;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px; padding: 4px;
          gap: 2px;
        }
        .ck-nav-link {
          padding: 7px 16px; border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,.4);
          text-decoration: none; transition: color .18s, background .18s;
          white-space: nowrap;
        }
        .ck-nav-link:hover { color: rgba(255,255,255,.85); background: rgba(255,255,255,.08); }
        .ck-nav-link.ck-active {
          color: #fff; background: rgba(255,255,255,.12);
          font-weight: 600;
        }
        /* right side */
        .ck-nav-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .ck-nav-live {
          display: flex; align-items: center; gap: 7px;
          background: rgba(34,197,94,.07); border: 1px solid rgba(34,197,94,.15);
          padding: 6px 13px; border-radius: 999px;
          font-size: 11px; font-weight: 700; color: #4ade80;
          letter-spacing: .06em; text-transform: uppercase;
        }
        .ck-nav-live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #22c55e; position: relative; flex-shrink: 0;
        }
        .ck-nav-live-dot::after {
          content: ''; position: absolute; inset: -3px; border-radius: 50%;
          background: rgba(34,197,94,.3); animation: ckPulse 2s ease-in-out infinite;
        }
        .ck-nav-book {
          display: flex; align-items: center; gap: 7px;
          background: #e42320; color: #fff;
          border: none; border-radius: 11px; padding: 9px 18px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          text-decoration: none; cursor: pointer; letter-spacing: .01em;
          transition: background .18s, transform .15s, box-shadow .18s;
          box-shadow: 0 4px 18px rgba(228,35,32,.32);
        }
        .ck-nav-book:hover {
          background: #c41c1a; transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(228,35,32,.45);
        }
        /* mobile */
        @media (max-width: 900px) { .ck-nav-center { display: none; } }
        @media (max-width: 640px) {
          .ck-nav { padding: 0 20px; }
          .ck-nav-live { display: none; }
          .ck-nav-book { padding: 9px 14px; font-size: 12px; }
          .ck-nav-tagline { display: none; }
        }

        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#e42320; border-radius:2px; }
      `}</style>

      <div className="ck-page">
        <div className="ck-grain" />
        <div className="ck-ambient">
          <div className="ck-glow ck-glow-1" />
          <div className="ck-glow ck-glow-2" />
        </div>

        {/* ── Navbar ── */}
        <nav className="ck-nav">

          {/* Logo */}
          <Link to="/" className="ck-nav-logo">
            <div className="ck-nav-mark">
              <svg width="17" height="17" fill="none" stroke="#fff" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <div className="ck-nav-wordmark">
              <span className="ck-nav-name">Sarda <em>HMS</em></span>
              <span className="ck-nav-tagline">Hospital Management</span>
            </div>
          </Link>

          {/* Center pill nav */}
          <div className="ck-nav-center">
            <Link to="/"                   className="ck-nav-link">Home</Link>
            <Link to="/doctors"            className="ck-nav-link">Doctors</Link>
            <Link to="/appointment"        className="ck-nav-link">Book</Link>
            <Link to="/appointment/check"  className="ck-nav-link ck-active">Track</Link>
            <Link to="/branch"             className="ck-nav-link">Branches</Link>
          </div>

          {/* Right */}
          <div className="ck-nav-right">
            <div className="ck-nav-live">
              <div className="ck-nav-live-dot" />
              Live
            </div>
            <Link to="/appointment" className="ck-nav-book">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Book Now
            </Link>
          </div>

        </nav>

        <div className="ck-wrap">

          {/* ══ LEFT ══ */}
          <div className="ck-left">
            <div className="ck-tag">
              <div className="ck-tag-dot" />
              HMS Hospital
            </div>

            <h1 className="ck-heading">
              Track<br />
              Your <span className="red">Visit</span><br />
              <span className="ghost">Status</span>
            </h1>

            <p className="ck-desc">
              Instantly look up any appointment using your unique booking ID. No login required — available 24/7.
            </p>

            <div className="ck-steps">
              {[
                { n: '01', t: <><strong>Copy your ID</strong> from the confirmation message you received after booking</> },
                { n: '02', t: <><strong>Paste or type it</strong> into the search field on the right panel</> },
                { n: '03', t: <><strong>View full details</strong> — doctor info, timing &amp; live status</> },
              ].map(s => (
                <div className="ck-step" key={s.n}>
                  <div className="ck-step-num">{s.n}</div>
                  <div className="ck-step-text">{s.t}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ RIGHT ══ */}
          <div className="ck-right">

            <div className="ck-form-label">Appointment ID</div>

            <form onSubmit={handleCheck}>
              <div className={`ck-input-group ${shake ? 'shake' : ''}`}>
                <input
                  className="ck-input"
                  type="text"
                  value={appointmentId}
                  onChange={e => setAppointmentId(e.target.value)}
                  placeholder="e.g. 550e8400-e29b-41d4-a716-..."
                  required autoComplete="off"
                />
                <button type="button" onClick={handlePaste}
                  className={`ck-paste-btn ${pasted ? 'pasted' : ''}`}>
                  {pasted
                    ? <><svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg> Pasted!</>
                    : <><svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> Paste</>
                  }
                </button>
              </div>

              <p className="ck-hint">↑ Your ID was provided in your booking confirmation</p>

              <button className="ck-submit" type="submit" disabled={loading || !appointmentId.trim()}>
                {loading
                  ? <><div className="ck-spinner"/> Searching…</>
                  : <><svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg> Find Appointment</>
                }
              </button>
            </form>

            {error && (
              <div className="ck-error">
                <svg width="15" height="15" fill="none" stroke="#ff6b6b" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="ck-error-msg">{error}</span>
              </div>
            )}

            {appointment && (
              <div className="ck-result" ref={resultRef}>

                {/* Banner */}
                <div className="ck-result-banner">
                  <div className="ck-rbn-bg" style={{ background: status.banner }} />
                  <div className="ck-rbn-noise" />
                  <div className="ck-banner-inner">
                    <div className="ck-banner-left">
                      <div className="ck-banner-icon">{status.icon}</div>
                      <div>
                        <div className="ck-banner-title">
                          {appointment.status === 'CONFIRMED' ? 'Appointment Confirmed'
                           : appointment.status === 'CANCELLED' ? 'Appointment Cancelled'
                           : 'Appointment Pending'}
                        </div>
                        <div className="ck-banner-sub">Sarda Heart Hospital · HMS</div>
                      </div>
                    </div>
                    <div className="ck-banner-badge">{status.label}</div>
                  </div>
                </div>

                {/* Body */}
                <div className="ck-result-body">

                  <div className="ck-id-strip">
                    <span className="ck-id-label">Booking ID</span>
                    <span className="ck-id-val">{appointment.appointmentId}</span>
                  </div>

                  <div className="ck-info-grid">

                    {/* Doctor */}
                    <div className="ck-info-cell">
                      <div className="ck-cell-top">
                        <div className="ck-cell-dot" style={{background:'#e42320'}} />
                        <span className="ck-cell-lbl">Doctor</span>
                      </div>
                      <div className="ck-cell-avatar" style={{background:'linear-gradient(135deg,#e42320,#7c0a08)'}}>
                        {initials(appointment.doctor.name)}
                      </div>
                      <div className="ck-cell-name">Dr. {appointment.doctor.name}</div>
                      <div className="ck-cell-meta">
                        {appointment.doctor.specialization}<br/>
                        {appointment.doctor.department?.name}<br/>
                        {appointment.doctor.email}
                      </div>
                    </div>

                    {/* Patient */}
                    <div className="ck-info-cell">
                      <div className="ck-cell-top">
                        <div className="ck-cell-dot" style={{background:'#22c55e'}} />
                        <span className="ck-cell-lbl">Patient</span>
                      </div>
                      <div className="ck-cell-avatar" style={{background:'linear-gradient(135deg,#059669,#022c22)'}}>
                        {initials(appointment.patient.name)}
                      </div>
                      <div className="ck-cell-name">{appointment.patient.name}</div>
                      <div className="ck-cell-meta">
                        {appointment.patient.email}<br/>
                        {appointment.patient.gender} · Blood: {appointment.patient.bloodGroup}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="ck-info-cell">
                      <div className="ck-cell-top">
                        <div className="ck-cell-dot" style={{background:'#a78bfa'}} />
                        <span className="ck-cell-lbl">Date & Time</span>
                      </div>
                      <div style={{fontSize:26,marginBottom:8}}>🗓️</div>
                      <div className="ck-cell-name" style={{fontSize:13,lineHeight:1.45}}>{formattedDate}</div>
                    </div>

                    {/* Reason */}
                    <div className="ck-info-cell">
                      <div className="ck-cell-top">
                        <div className="ck-cell-dot" style={{background:'#fb923c'}} />
                        <span className="ck-cell-lbl">Reason</span>
                      </div>
                      <div style={{fontSize:26,marginBottom:8}}>📋</div>
                      <div className="ck-cell-name" style={{fontSize:13,lineHeight:1.5}}>{appointment.reason}</div>
                    </div>
                  </div>

                  <button className="ck-reset" onClick={reset}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    Search Another
                  </button>
                </div>
              </div>
            )}

            {!appointment && <p className="ck-note">Appointment ID was provided when booking was confirmed</p>}
          </div>
        </div>
      </div>
    </>
  )
}

export default CheckAppointment