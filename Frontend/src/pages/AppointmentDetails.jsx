import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import API from '../api/api'

const statusConfig = {
  PENDING: {
    label: 'Pending Confirmation',
    banner: 'linear-gradient(135deg, #92400e, #b45309, #d97706)',
    glow: 'rgba(217,119,6,.4)',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  },
  CONFIRMED: {
    label: 'Confirmed',
    banner: 'linear-gradient(135deg, #064e3b, #059669, #10b981)',
    glow: 'rgba(5,150,105,.4)',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  },
  CANCELLED: {
    label: 'Cancelled',
    banner: 'linear-gradient(135deg, #7f1d1d, #e42320, #ef4444)',
    glow: 'rgba(228,35,32,.4)',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  },
}

const initials = (n = '') => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??'

/* ── Loading screen ── */
const LoadingScreen = () => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;600&display=swap');
      .ad-load { min-height:100vh; background:#0f0f0f; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; font-family:'DM Sans',sans-serif; }
      .ad-load-ring { width:48px; height:48px; border-radius:50%; border:3px solid rgba(228,35,32,.2); border-top-color:#e42320; animation:adSpin .8s linear infinite; }
      @keyframes adSpin { to{transform:rotate(360deg)} }
      .ad-load-text { font-size:14px; color:rgba(255,255,255,.3); letter-spacing:.05em; }
    `}</style>
    <div className="ad-load"><div className="ad-load-ring"/><p className="ad-load-text">Loading appointment…</p></div>
  </>
)

/* ── Error screen ── */
const ErrorScreen = ({ onBack }) => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;600&display=swap');
      .ad-err { min-height:100vh; background:#0f0f0f; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; font-family:'DM Sans',sans-serif; text-align:center; padding:24px; }
      .ad-err-icon { font-size:52px; margin-bottom:8px; }
      .ad-err h2 { font-family:'Fraunces',serif; font-size:2rem; font-weight:900; color:#fff; }
      .ad-err p { font-size:14px; color:rgba(255,255,255,.3); }
      .ad-err-btn { margin-top:8px; background:#e42320; color:#fff; border:none; border-radius:12px; padding:12px 28px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:background .2s; }
      .ad-err-btn:hover { background:#c41c1a; }
    `}</style>
    <div className="ad-err">
      <div className="ad-err-icon">😕</div>
      <h2>Not Found</h2>
      <p>We couldn't locate this appointment. It may have been removed or the ID is incorrect.</p>
      <button className="ad-err-btn" onClick={onBack}>Go Back</button>
    </div>
  </>
)

const AppointmentDetails = () => {
  const { appointmentId } = useParams()
  const navigate = useNavigate()

  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [copied, setCopied]           = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/patients/appointments/check/${appointmentId}`)
        setAppointment(res.data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [appointmentId])

  const handleCopy = () => {
    navigator.clipboard.writeText(appointment.appointmentId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <LoadingScreen />
  if (error)   return <ErrorScreen onBack={() => navigate('/appointment')} />

  const status = statusConfig[appointment.status] || statusConfig.PENDING
  const formattedDate = new Date(appointment.appointmentTime)
    .toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })
  const dateOnly = new Date(appointment.appointmentTime)
    .toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeOnly = new Date(appointment.appointmentTime)
    .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }

        .ad-page {
          min-height: 100vh;
          background: #0f0f0f;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          overflow-x: hidden;
        }

        /* grain */
        .ad-grain {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: .7;
        }

        /* ambient */
        .ad-ambient { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
        .ad-glow {
          position: absolute; border-radius: 50%; filter: blur(130px);
          transition: background .8s ease;
        }
        .ad-glow-1 {
          width: 700px; height: 700px; top: -300px; left: -200px;
          animation: adG1 18s ease-in-out infinite;
        }
        .ad-glow-2 {
          width: 500px; height: 500px; bottom: -200px; right: -150px;
          background: radial-gradient(circle, rgba(124,58,237,.1), transparent);
          animation: adG2 22s ease-in-out infinite;
        }
        @keyframes adG1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,50px)} }
        @keyframes adG2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,-40px)} }

        /* layout */
        .ad-container {
          position: relative; z-index: 1;
          max-width: 680px; margin: 0 auto;
          padding: 48px 24px 80px;
          animation: adIn .65s ease both;
        }
        @keyframes adIn { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }

        /* back btn */
        .ad-back {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
          color: rgba(255,255,255,.4); font-size: 13px; font-weight: 600;
          padding: 9px 18px; border-radius: 12px; cursor: pointer;
          transition: all .2s; margin-bottom: 36px;
          font-family: 'DM Sans', sans-serif;
        }
        .ad-back:hover { border-color: rgba(255,255,255,.2); color: rgba(255,255,255,.7); background: rgba(255,255,255,.09); }

        /* success header */
        .ad-success-header {
          text-align: center; margin-bottom: 36px;
          animation: adIn .5s .1s ease both; opacity: 0;
          animation-fill-mode: forwards;
        }
        .ad-success-badge {
          display: inline-flex; align-items: center; gap: 9px;
          background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.25);
          color: #4ade80; font-size: 13px; font-weight: 700;
          padding: 9px 22px; border-radius: 999px; margin-bottom: 18px;
          letter-spacing: .02em;
        }
        .ad-success-check {
          width: 20px; height: 20px; border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #15803d);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ad-heading {
          font-family: 'Fraunces', serif;
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 900; color: #fff; line-height: 1.0;
          letter-spacing: -.02em; margin-bottom: 10px;
        }
        .ad-heading em { font-style: italic; color: #e42320; }
        .ad-subhead { font-size: 14px; color: rgba(255,255,255,.3); }

        /* ── TICKET CARD ── */
        .ad-ticket {
          border-radius: 24px; overflow: hidden;
          border: 1px solid rgba(255,255,255,.09);
          box-shadow: 0 32px 80px rgba(0,0,0,.5);
          animation: adIn .6s .2s ease both; opacity: 0;
          animation-fill-mode: forwards;
        }

        /* ticket top banner */
        .ad-ticket-banner {
          position: relative; padding: 26px 32px; overflow: hidden;
        }
        .ad-tbn-bg { position: absolute; inset: 0; z-index: 0; }
        .ad-tbn-noise {
          position: absolute; inset: 0; z-index: 1; opacity: .1;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .ad-tbn-ring {
          position: absolute; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,.1); pointer-events: none;
        }
        .ad-tbn-ring-1 { width: 220px; height: 220px; top:-100px; right:-60px; z-index:1; }
        .ad-tbn-ring-2 { width: 120px; height: 120px; bottom:-50px; left:20px; z-index:1; }
        .ad-tbn-content {
          position: relative; z-index: 2;
          display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;
        }
        .ad-tbn-left {}
        .ad-tbn-hospital {
          font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
          color: rgba(255,255,255,.45); margin-bottom: 6px;
        }
        .ad-tbn-title {
          font-family: 'Fraunces', serif;
          font-size: 1.7rem; font-weight: 900; color: #fff; line-height: 1.1;
        }
        .ad-tbn-subtitle { font-size: 13px; color: rgba(255,255,255,.45); margin-top: 4px; }
        .ad-tbn-status {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,.14); backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,.2);
          padding: 8px 16px; border-radius: 999px;
          font-size: 12px; font-weight: 700; color: #fff; white-space: nowrap;
        }

        /* ── perforated separator ── */
        .ad-perf {
          position: relative; height: 0; overflow: visible;
          background: rgba(255,255,255,.04);
        }
        .ad-perf::before, .ad-perf::after {
          content: ''; position: absolute; top: -14px;
          width: 28px; height: 28px; border-radius: 50%;
          background: #0f0f0f; z-index: 10;
        }
        .ad-perf::before { left: -14px; }
        .ad-perf::after  { right: -14px; }
        .ad-perf-line {
          position: absolute; top: 0; left: 28px; right: 28px;
          border-top: 1.5px dashed rgba(255,255,255,.12);
        }

        /* ticket body */
        .ad-ticket-body { background: rgba(255,255,255,.03); padding: 32px 32px 28px; }

        /* ID box */
        .ad-id-box {
          background: rgba(255,255,255,.05); border: 1px dashed rgba(255,255,255,.12);
          border-radius: 14px; padding: 18px 20px; margin-bottom: 26px;
        }
        .ad-id-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .ad-id-label { font-size: 10px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: rgba(255,255,255,.25); margin-bottom: 7px; }
        .ad-id-val { font-family: monospace; font-size: 13px; font-weight: 700; color: #ff6b6b; word-break: break-all; line-height: 1.4; flex: 1; }
        .ad-copy-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.05);
          color: rgba(255,255,255,.4); font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all .2s; white-space: nowrap; flex-shrink: 0;
          font-family: 'DM Sans', sans-serif;
        }
        .ad-copy-btn:hover { border-color: rgba(255,255,255,.2); color: rgba(255,255,255,.7); }
        .ad-copy-btn.copied { border-color: rgba(34,197,94,.4); background: rgba(34,197,94,.1); color: #4ade80; }

        /* section divider */
        .ad-section-div {
          display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
        }
        .ad-section-line { flex: 1; height: 1px; background: rgba(255,255,255,.07); }
        .ad-section-label { font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.22); }

        /* info grid */
        .ad-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }

        .ad-info-cell {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: 16px;
          transition: background .2s, border-color .2s, transform .2s;
        }
        .ad-info-cell:hover { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.12); transform: translateY(-2px); }

        .ad-cell-top { display: flex; align-items: center; gap: 7px; margin-bottom: 10px; }
        .ad-cell-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .ad-cell-lbl { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.28); }

        .ad-cell-avatar {
          width: 36px; height: 36px; border-radius: 50%; margin-bottom: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Fraunces', serif; font-size: .85rem; font-weight: 900; color: #fff;
        }
        .ad-cell-emoji { font-size: 28px; margin-bottom: 8px; }
        .ad-cell-name { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 4px; line-height: 1.3; }
        .ad-cell-meta { font-size: 11.5px; color: rgba(255,255,255,.32); line-height: 1.65; }

        /* ── date highlight band ── */
        .ad-date-band {
          display: flex; align-items: center; gap: 0;
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; overflow: hidden; margin-bottom: 24px;
        }
        .ad-date-block {
          flex: 1; padding: 16px 20px; text-align: center;
          border-right: 1px solid rgba(255,255,255,.07);
        }
        .ad-date-block:last-child { border-right: none; }
        .ad-date-big {
          font-family: 'Fraunces', serif;
          font-size: 2rem; font-weight: 900; color: #fff; line-height: 1;
          margin-bottom: 4px;
        }
        .ad-date-small { font-size: 11px; color: rgba(255,255,255,.3); letter-spacing: .06em; text-transform: uppercase; }

        /* ── action buttons ── */
        .ad-actions { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .ad-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 13px 14px; border-radius: 13px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all .2s; letter-spacing: .02em;
          border: none;
        }
        .ad-btn-ghost {
          background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09); color: rgba(255,255,255,.45);
        }
        .ad-btn-ghost:hover { background: rgba(255,255,255,.09); border-color: rgba(255,255,255,.18); color: rgba(255,255,255,.75); }
        .ad-btn-outline {
          background: transparent; border: 1px solid rgba(255,255,255,.14); color: rgba(255,255,255,.55);
        }
        .ad-btn-outline:hover { border-color: rgba(255,255,255,.28); color: rgba(255,255,255,.8); background: rgba(255,255,255,.05); }
        .ad-btn-primary {
          background: linear-gradient(135deg, #e42320, #c41c1a);
          color: #fff; box-shadow: 0 6px 24px rgba(228,35,32,.28);
        }
        .ad-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(228,35,32,.4); }

        /* footer */
        .ad-footer {
          text-align: center; margin-top: 24px;
          font-size: 12px; color: rgba(255,255,255,.15);
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .ad-footer::before, .ad-footer::after { content: ''; flex:1; height:1px; background: rgba(255,255,255,.06); }

        /* ── navbar ── */
        .ad-nav {
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
        .ad-nav-logo { display: flex; align-items: center; gap: 11px; text-decoration: none; flex-shrink: 0; }
        .ad-nav-mark {
          width: 36px; height: 36px; border-radius: 11px; flex-shrink: 0;
          background: linear-gradient(145deg, #e42320 0%, #9b1c1c 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 1px rgba(228,35,32,.4), 0 4px 16px rgba(228,35,32,.3);
        }
        .ad-nav-wordmark { display: flex; flex-direction: column; line-height: 1; }
        .ad-nav-name {
          font-family: 'Fraunces', serif;
          font-size: 15px; font-weight: 900; color: #fff; letter-spacing: -.01em;
        }
        .ad-nav-name em { font-style: italic; color: #e42320; }
        .ad-nav-tagline {
          font-size: 10px; color: rgba(255,255,255,.28);
          letter-spacing: .08em; text-transform: uppercase; margin-top: 2px;
        }
        .ad-nav-center {
          display: flex; align-items: center;
          background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px; padding: 4px; gap: 2px;
        }
        .ad-nav-link {
          padding: 7px 16px; border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,.4);
          text-decoration: none; transition: color .18s, background .18s; white-space: nowrap;
        }
        .ad-nav-link:hover { color: rgba(255,255,255,.85); background: rgba(255,255,255,.08); }
        .ad-nav-link.ad-active { color: #fff; background: rgba(255,255,255,.12); font-weight: 600; }
        .ad-nav-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .ad-nav-live {
          display: flex; align-items: center; gap: 7px;
          background: rgba(34,197,94,.07); border: 1px solid rgba(34,197,94,.15);
          padding: 6px 13px; border-radius: 999px;
          font-size: 11px; font-weight: 700; color: #4ade80;
          letter-spacing: .06em; text-transform: uppercase;
        }
        .ad-nav-live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #22c55e; position: relative; flex-shrink: 0;
        }
        .ad-nav-live-dot::after {
          content: ''; position: absolute; inset: -3px; border-radius: 50%;
          background: rgba(34,197,94,.3); animation: adNavPulse 2s ease-in-out infinite;
        }
        @keyframes adNavPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.8);opacity:0} }
        .ad-nav-btn {
          display: flex; align-items: center; gap: 7px;
          background: #e42320; color: #fff;
          border: none; border-radius: 11px; padding: 9px 18px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          text-decoration: none; cursor: pointer; letter-spacing: .01em;
          transition: background .18s, transform .15s, box-shadow .18s;
          box-shadow: 0 4px 18px rgba(228,35,32,.32);
        }
        .ad-nav-btn:hover { background: #c41c1a; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(228,35,32,.45); }
        @media (max-width: 900px) { .ad-nav-center { display: none; } }
        @media (max-width: 640px) {
          .ad-nav { padding: 0 20px; }
          .ad-nav-live { display: none; }
          .ad-nav-btn { padding: 9px 14px; font-size: 12px; }
          .ad-nav-tagline { display: none; }
        }

        /* print */
        @media print {
          .ad-page { background: #fff !important; color: #000 !important; }
          .ad-grain, .ad-ambient, .ad-back, .ad-actions, .ad-copy-btn { display: none !important; }
          .ad-ticket { box-shadow: none !important; border: 1px solid #ddd !important; }
          .ad-ticket-body { background: #fafafa !important; }
          .ad-info-cell { background: #f5f5f5 !important; border: 1px solid #e0e0e0 !important; }
          .ad-cell-name, .ad-tbn-title, .ad-heading { color: #111 !important; }
          .ad-cell-meta, .ad-tbn-subtitle, .ad-subhead { color: #555 !important; }
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e42320; border-radius: 2px; }

        @media (max-width: 520px) {
          .ad-info-grid { grid-template-columns: 1fr; }
          .ad-actions { grid-template-columns: 1fr; }
          .ad-ticket-banner, .ad-ticket-body { padding: 20px; }
          .ad-date-band { flex-direction: column; }
          .ad-date-block { border-right: none; border-bottom: 1px solid rgba(255,255,255,.07); }
          .ad-date-block:last-child { border-bottom: none; }
        }
      `}</style>

      <div className="ad-page">
        <div className="ad-grain" />
        <div className="ad-ambient">
          <div className="ad-glow ad-glow-1" style={{ background: `radial-gradient(circle, ${status.glow}, transparent)` }} />
          <div className="ad-glow ad-glow-2" />
        </div>

        {/* ── Navbar ── */}
        <nav className="ad-nav">

          <Link to="/" className="ad-nav-logo">
            <div className="ad-nav-mark">
              <svg width="17" height="17" fill="none" stroke="#fff" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <div className="ad-nav-wordmark">
              <span className="ad-nav-name">Sarda <em>HMS</em></span>
              <span className="ad-nav-tagline">Hospital Management</span>
            </div>
          </Link>

          <div className="ad-nav-center">
            <Link to="/"                   className="ad-nav-link">Home</Link>
            <Link to="/doctors"            className="ad-nav-link">Doctors</Link>
            <Link to="/appointment"        className="ad-nav-link ad-active">Book</Link>
            <Link to="/appointment/check"  className="ad-nav-link">Track</Link>
            <Link to="/branch"             className="ad-nav-link">Branches</Link>
          </div>

          <div className="ad-nav-right">
            <div className="ad-nav-live">
              <div className="ad-nav-live-dot" />
              Live
            </div>
            <Link to="/appointment/check" className="ad-nav-btn">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Track Status
            </Link>
          </div>

        </nav>

        <div className="ad-container">

          {/* Back */}
          <button className="ad-back no-print" onClick={() => navigate(-1)}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>

          {/* Success header */}
          <div className="ad-success-header">
            <div className="ad-success-badge">
              <div className="ad-success-check">
                <svg width="10" height="10" fill="none" stroke="#fff" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              Booking Confirmed
            </div>
            <h1 className="ad-heading">Your <em>Appointment</em><br/>is Booked!</h1>
            <p className="ad-subhead">Save your booking ID below — you'll need it to check your status</p>
          </div>

          {/* ── TICKET ── */}
          <div className="ad-ticket">

            {/* Banner */}
            <div className="ad-ticket-banner">
              <div className="ad-tbn-bg" style={{ background: status.banner }} />
              <div className="ad-tbn-noise" />
              <div className="ad-tbn-ring ad-tbn-ring-1" />
              <div className="ad-tbn-ring ad-tbn-ring-2" />
              <div className="ad-tbn-content">
                <div className="ad-tbn-left">
                  <div className="ad-tbn-hospital">Sarda Heart Hospital · HMS</div>
                  <div className="ad-tbn-title">Appointment Receipt</div>
                  <div className="ad-tbn-subtitle">Booking reference document</div>
                </div>
                <div className="ad-tbn-status">
                  {status.icon}
                  {status.label}
                </div>
              </div>
            </div>

            {/* Perforated divider */}
            <div className="ad-perf">
              <div className="ad-perf-line" />
            </div>

            {/* Body */}
            <div className="ad-ticket-body">

              {/* ID */}
              <div className="ad-id-box">
                <div className="ad-id-label">Appointment ID</div>
                <div className="ad-id-row">
                  <span className="ad-id-val">{appointment.appointmentId}</span>
                  <button className={`ad-copy-btn no-print ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                    {copied
                      ? <><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg> Copied!</>
                      : <><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg> Copy ID</>
                    }
                  </button>
                </div>
              </div>

              {/* Date band */}
              <div className="ad-date-band">
                <div className="ad-date-block">
                  <div className="ad-date-big">{dateOnly}</div>
                  <div className="ad-date-small">Appointment Date</div>
                </div>
                <div className="ad-date-block">
                  <div className="ad-date-big" style={{ color: '#e42320' }}>{timeOnly}</div>
                  <div className="ad-date-small">Scheduled Time</div>
                </div>
                <div className="ad-date-block">
                  <div className="ad-date-big" style={{ fontSize: '1.3rem', color: '#a78bfa' }}>
                    {appointment.doctor.department?.name || 'General'}
                  </div>
                  <div className="ad-date-small">Department</div>
                </div>
              </div>

              <div className="ad-section-div">
                <div className="ad-section-line" />
                <span className="ad-section-label">Booking Details</span>
                <div className="ad-section-line" />
              </div>

              {/* Info grid */}
              <div className="ad-info-grid">

                {/* Doctor */}
                <div className="ad-info-cell">
                  <div className="ad-cell-top">
                    <div className="ad-cell-dot" style={{ background: '#e42320' }} />
                    <span className="ad-cell-lbl">Doctor</span>
                  </div>
                  <div className="ad-cell-avatar" style={{ background: 'linear-gradient(135deg,#e42320,#7c0a08)' }}>
                    {initials(appointment.doctor.name)}
                  </div>
                  <div className="ad-cell-name">Dr. {appointment.doctor.name}</div>
                  <div className="ad-cell-meta">
                    {appointment.doctor.specialization}<br/>
                    {appointment.doctor.department?.name}
                  </div>
                </div>

                {/* Patient */}
                <div className="ad-info-cell">
                  <div className="ad-cell-top">
                    <div className="ad-cell-dot" style={{ background: '#22c55e' }} />
                    <span className="ad-cell-lbl">Patient</span>
                  </div>
                  <div className="ad-cell-avatar" style={{ background: 'linear-gradient(135deg,#059669,#022c22)' }}>
                    {initials(appointment.patient.name)}
                  </div>
                  <div className="ad-cell-name">{appointment.patient.name}</div>
                  <div className="ad-cell-meta">
                    {appointment.patient.email}<br/>
                    {appointment.patient.gender}
                  </div>
                </div>

                {/* Date */}
                <div className="ad-info-cell">
                  <div className="ad-cell-top">
                    <div className="ad-cell-dot" style={{ background: '#a78bfa' }} />
                    <span className="ad-cell-lbl">Date &amp; Time</span>
                  </div>
                  <div className="ad-cell-emoji">🗓️</div>
                  <div className="ad-cell-name" style={{ fontSize: 13, lineHeight: 1.45 }}>{formattedDate}</div>
                </div>

                {/* Reason */}
                <div className="ad-info-cell">
                  <div className="ad-cell-top">
                    <div className="ad-cell-dot" style={{ background: '#fb923c' }} />
                    <span className="ad-cell-lbl">Reason</span>
                  </div>
                  <div className="ad-cell-emoji">📋</div>
                  <div className="ad-cell-name" style={{ fontSize: 13, lineHeight: 1.5 }}>{appointment.reason}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="ad-actions no-print">
                <button className="ad-btn ad-btn-ghost" onClick={() => navigate('/appointment')}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                  Book Again
                </button>
                <button className="ad-btn ad-btn-outline" onClick={() => window.print()}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                  Print
                </button>
                <button className="ad-btn ad-btn-primary" onClick={() => navigate('/appointment/check')}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  Check Status
                </button>
              </div>
            </div>
          </div>

          <div className="ad-footer no-print">
            Please arrive 10 minutes before your scheduled appointment time
          </div>
        </div>
      </div>
    </>
  )
}

export default AppointmentDetails