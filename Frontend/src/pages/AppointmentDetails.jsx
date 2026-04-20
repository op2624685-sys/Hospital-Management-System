import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import appointmentApi from '../api/appointments'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import PageLoader from '../components/PageLoader'
import { useQuery, useQueryClient } from '@tanstack/react-query'

const statusConfig = {
  PENDING: {
    label: 'Awaiting Confirmation',
    banner: 'linear-gradient(135deg, #644a40, #8b5e52, #a07060)',
    glow: 'rgba(100,74,64,0.4)',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  },
  CONFIRMED: {
    label: 'Confirmed',
    banner: 'linear-gradient(135deg, #644a40, #d97706, #ffdfb5)',
    glow: 'rgba(217,119,6,0.4)',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  },
  CANCELLED: {
    label: 'Cancelled',
    banner: 'linear-gradient(135deg, #7f1d1d, #e42320, #ef4444)',
    glow: 'rgba(228,35,32,0.4)',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  },
}

const initials = (n = '') => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??'

/* â”€â”€ Loading screen â”€â”€ */
const LoadingScreen = () => (
  <>
    <style>{`
      .ad-load { min-height:100vh; background:var(--background); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; font-family:'Outfit',sans-serif; }
      .ad-load-ring { width:48px; height:48px; border-radius:50%; border:3px solid var(--border); border-top-color:var(--primary); animation:adSpin .8s linear infinite; }
      @keyframes adSpin { to{transform:rotate(360deg)} }
      .ad-load-text { font-size:14px; color:var(--muted-foreground); letter-spacing:.05em; font-weight:600; }
    `}</style>
    <div className="ad-load"><div className="ad-load-ring"/><p className="ad-load-text">Fetching clinical details...</p></div>
  </>
)

/* â”€â”€ Error screen â”€â”€ */
const ErrorScreen = ({ onBack }) => (
  <>
    <style>{`
      .ad-err { min-height:100vh; background:var(--background); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; font-family:'Outfit',sans-serif; text-align:center; padding:24px; }
      .ad-err-icon { font-size:52px; margin-bottom:8px; }
      .ad-err h2 { font-size:2rem; font-weight:900; color:var(--foreground); }
      .ad-err p { font-size:14px; color:var(--muted-foreground); max-width: 320px; }
      .ad-err-btn { margin-top:8px; background:var(--primary); color:var(--primary-foreground); border:none; border-radius:12px; padding:12px 28px; font-size:14px; font-weight:600; cursor:pointer; }
    `}</style>
    <div className="ad-err">
      <div className="ad-err-icon">!</div>
      <h2>Not Found</h2>
      <p>We couldn't locate this appointment record in our system.</p>
      <button className="ad-err-btn" onClick={onBack}>Return Back</button>
    </div>
  </>
)

const AppointmentDetails = () => {
  const queryClient = useQueryClient()
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const { user, hasRole } = useAuth()

  const [copied, setCopied]           = useState(false)
  const [copiedLink, setCopiedLink]   = useState(false)
  const [cancelling, setCancelling]   = useState(false)

  const {
    data: appointment = null,
    isLoading: loading,
    isError: error,
  } = useQuery({
    queryKey: ['appointment-details', appointmentId],
    queryFn: async () => {
      const res = await appointmentApi.getByAppointmentId(appointmentId)
      return res.data
    },
    enabled: Boolean(appointmentId),
  })

  const handleCopy = () => {
    navigator.clipboard.writeText(appointment.appointmentId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const canPatientCancel = Boolean(
    hasRole('PATIENT') &&
    appointment?.status !== 'CANCELLED' &&
    String(appointment?.patient?.id) === String(user?.id)
  )

  const handleCancelByPatient = async () => {
    if (!canPatientCancel) return
    setCancelling(true)
    try {
      const res = await appointmentApi.cancelByPatient(appointment.appointmentId)
      queryClient.setQueryData(['appointment-details', appointmentId], res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <PageLoader />
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
        .ad-page {
          min-height: 100vh;
          background: var(--background);
          font-family: 'Outfit', sans-serif;
          color: var(--foreground);
        }

        /* ambient */
        .ad-ambient { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
        .ad-glow {
          position: absolute; border-radius: 50%; filter: blur(130px);
          transition: background .8s ease; opacity: 0.15;
        }
        .ad-glow-1 {
          width: 700px; height: 700px; top: -300px; left: -200px;
        }
        .ad-glow-2 {
          width: 500px; height: 500px; bottom: -200px; right: -150px;
          background: radial-gradient(circle, var(--secondary), transparent);
        }

        /* layout */
        .ad-container {
          position: relative; z-index: 1;
          max-width: 680px; margin: 0 auto;
          padding: 112px 24px 80px;
          animation: adIn .65s ease both;
        }
        @keyframes adIn { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        /* success header */
        .ad-success-header {
          text-align: center; margin-bottom: 36px;
          animation: adIn .5s .1s ease both; opacity: 0;
          animation-fill-mode: forwards;
        }
        .ad-success-badge {
          display: inline-flex; align-items: center; gap: 9px;
          background: var(--secondary); border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
          color: var(--secondary-foreground); font-size: 13px; font-weight: 800;
          padding: 10px 24px; border-radius: 999px; margin-bottom: 18px;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .ad-success-check {
          width: 20px; height: 20px; border-radius: 50%;
          background: var(--primary);
          display: flex; align-items: center; justify-content: center;
        }
        .ad-heading {
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 900; color: var(--foreground); line-height: 1.0;
          letter-spacing: -.03em; margin-bottom: 12px;
        }
        .ad-heading em { font-style: italic; color: var(--primary); font-family: serif; }
        .ad-subhead { font-size: 15px; color: var(--muted-foreground); font-weight: 500; }

        /* â”€â”€ TICKET CARD â”€â”€ */
        .ad-ticket {
          border-radius: 28px; overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.1);
          animation: adIn .6s .2s ease both; opacity: 0;
          animation-fill-mode: forwards;
          background: var(--card);
        }

        /* ticket top banner */
        .ad-ticket-banner {
          position: relative; padding: 32px; overflow: hidden;
        }
        .ad-tbn-bg { position: absolute; inset: 0; z-index: 0; }
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
        .ad-tbn-hospital {
          font-size: 11px; font-weight: 900; letter-spacing: .2em; text-transform: uppercase;
          color: rgba(255,255,255,.6); margin-bottom: 8px;
        }
        .ad-tbn-title {
          font-size: 1.8rem; font-weight: 900; color: #fff; line-height: 1.1; letter-spacing: -0.02em;
        }
        .ad-tbn-subtitle { font-size: 13px; color: rgba(255,255,255,.7); margin-top: 6px; font-weight: 500; }
        .ad-tbn-status {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,.2); backdrop-filter: blur(12px);
          border: 1.5px solid rgba(255,255,255,.3);
          padding: 8px 18px; border-radius: 999px;
          font-size: 12px; font-weight: 800; color: #fff; white-space: nowrap;
          text-transform: uppercase;
        }

        /* separator */
        .ad-perf { position: relative; height: 0; overflow: visible; background: var(--border); }
        .ad-perf::before, .ad-perf::after {
          content: ''; position: absolute; top: -14px;
          width: 28px; height: 28px; border-radius: 50%;
          background: var(--background); z-index: 10;
          border: 1px solid var(--border);
        }
        .ad-perf::before { left: -14px; }
        .ad-perf::after  { right: -14px; }
        .ad-perf-line {
          position: absolute; top: 0; left: 28px; right: 28px;
          border-top: 2px dashed var(--border);
        }

        /* ticket body */
        .ad-ticket-body { padding: 32px 32px 28px; }

        /* ID box */
        .ad-id-box {
          background: var(--sidebar); border: 1.5px dashed var(--border);
          border-radius: 18px; padding: 20px; margin-bottom: 28px;
        }
        .ad-id-label { font-size: 11px; font-weight: 800; letter-spacing: .15em; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 8px; }
        .ad-id-val { font-family: monospace; font-size: 15px; font-weight: 800; color: var(--primary); word-break: break-all; line-height: 1.4; flex: 1; }
        .ad-copy-btn {
          padding: 10px 18px; border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--card);
          color: var(--foreground); font-size: 12px; font-weight: 700;
          cursor: pointer; transition: all .2s;
        }
        .ad-copy-btn:hover { border-color: var(--primary); color: var(--primary); }
        .ad-copy-btn.copied { border-color: #4ade80; background: rgba(74,222,128,0.1); color: #16a34a; }

        /* info cells */
        .ad-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
        .ad-info-cell {
          background: var(--sidebar); border: 1px solid var(--border);
          border-radius: 20px; padding: 20px;
          transition: all 0.2s;
        }
        .ad-info-cell:hover { border-color: var(--primary); transform: translateY(-3px); }
        .ad-cell-lbl { font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--muted-foreground); }
        .ad-cell-avatar {
          width: 40px; height: 40px; border-radius: 12px; margin-bottom: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; font-weight: 900; color: #fff;
        }
        .ad-cell-name { font-size: 14px; font-weight: 800; color: var(--foreground); margin-bottom: 4px; }
        .ad-cell-meta {
          font-size: 12px; color: var(--muted-foreground); line-height: 1.5; font-weight: 500;
          overflow-wrap: anywhere; word-break: break-word;
        }

        /* date band */
        .ad-date-band {
          display: flex; align-items: center; gap: 0;
          border: 1.5px solid var(--border);
          border-radius: 20px; overflow: hidden; margin-bottom: 28px;
        }
        .ad-date-block {
          flex: 1; padding: 24px; text-align: center;
          border-right: 1.5px solid var(--border);
        }
        .ad-date-block:last-child { border-right: none; }
        .ad-date-big {
          font-size: 1.6rem; font-weight: 900; color: var(--foreground); line-height: 1;
          margin-bottom: 6px; letter-spacing: -0.02em;
        }
        .ad-date-small { font-size: 11px; color: var(--muted-foreground); font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }

        /* reason block */
        .ad-reason-box {
          background: var(--sidebar);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 16px 18px;
          margin-bottom: 28px;
        }
        .ad-reason-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--muted-foreground);
          margin-bottom: 8px;
        }
        .ad-reason-text {
          font-size: 13px;
          line-height: 1.6;
          color: var(--foreground);
          font-weight: 600;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        /* buttons */
        .ad-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
        .ad-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px 16px; border-radius: 16px;
          font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all .2s; border: none;
        }
        .ad-btn-outline {
          background: var(--card); border: 1.5px solid var(--border); color: var(--foreground);
        }
        .ad-btn-outline:hover { border-color: var(--primary); background: var(--secondary); color: var(--primary); }
        .ad-btn-primary {
          background: var(--primary); color: var(--primary-foreground);
          box-shadow: 0 8px 24px color-mix(in srgb, var(--primary) 20%, transparent);
        }
        .ad-btn-primary:hover { opacity: 0.95; transform: translateY(-2px); }

        .ad-footer {
          text-align: center; margin-top: 32px;
          font-size: 13px; color: var(--muted-foreground); font-weight: 600;
        }
        
        @media (max-width: 540px) {
          .ad-info-grid { grid-template-columns: 1fr; }
          .ad-date-band { flex-direction: column; }
          .ad-date-block { border-right: none; border-bottom: 1.5px solid var(--border); width: 100%; }
        }

        @page { size: A4 portrait; margin: 8mm; }
        @media print {
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          html, body { background: #fff !important; }

          .ad-page { min-height: auto; background: #fff; }
          .ad-page > header,
          .ad-ambient,
          .ad-success-header,
          .ad-actions,
          .ad-footer {
            display: none !important;
          }

          .ad-container {
            max-width: 100%;
            padding: 0;
            margin: 0;
            animation: none;
          }

          .ad-ticket {
            border-radius: 14px;
            box-shadow: none;
            overflow: visible;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .ad-ticket-banner { padding: 16px 18px; }
          .ad-tbn-title { font-size: 1.25rem; }
          .ad-tbn-subtitle { font-size: 11px; margin-top: 4px; }
          .ad-tbn-status {
            font-size: 10px; padding: 6px 10px;
            backdrop-filter: none !important;
            box-shadow: none !important;
          }
          .ad-tbn-ring, .ad-glow, .ad-tbn-bg {
            filter: none !important;
            backdrop-filter: none !important;
            box-shadow: none !important;
          }
          .ad-perf { display: none !important; }
          .ad-perf::before, .ad-perf::after { width: 18px; height: 18px; top: -9px; }
          .ad-perf::before { left: -9px; }
          .ad-perf::after  { right: -9px; }

          .ad-ticket-body { padding: 14px 16px 12px; }
          .ad-id-box { margin-bottom: 12px; padding: 12px; }
          .ad-id-label { margin-bottom: 4px; font-size: 10px; }
          .ad-id-val { font-size: 12px; overflow-wrap: anywhere; word-break: break-all; }
          .ad-copy-btn { display: none !important; }
          .ad-date-band { margin-bottom: 12px; }
          .ad-date-block { padding: 12px; }
          .ad-date-big { font-size: 1.05rem; margin-bottom: 4px; }
          .ad-date-small { font-size: 10px; letter-spacing: .04em; }

          .ad-info-grid { gap: 10px; margin-bottom: 0; }
          .ad-info-cell { border-radius: 12px; padding: 12px; }
          .ad-cell-avatar { width: 30px; height: 30px; margin-bottom: 8px; font-size: .8rem; }
          .ad-cell-lbl { font-size: 9px; margin-bottom: 8px !important; }
          .ad-cell-name { font-size: 12px; margin-bottom: 2px; }
          .ad-cell-meta { font-size: 10px; line-height: 1.35; }
          .ad-reason-box { margin-top: 10px; margin-bottom: 10px; border-radius: 12px; padding: 10px 12px; }
          .ad-reason-label { font-size: 9px; margin-bottom: 4px; }
          .ad-reason-text { font-size: 10px; line-height: 1.4; }
        }
      `}</style>

      <div className="ad-page">
        <div className="ad-ambient">
          <div className="ad-glow ad-glow-1" style={{ background: `radial-gradient(circle, ${status.glow}, transparent)` }} />
          <div className="ad-glow ad-glow-2" />
        </div>

        <Header />

        <div className="ad-container">
          <div className="ad-success-header">
            <div className="ad-success-badge">
              <div className="ad-success-check">
                <svg width="10" height="10" fill="none" stroke="#fff" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              Appointment Confirmed
            </div>
            <h1 className="ad-heading">Slot <em>Secured</em> Successfully</h1>
            <p className="ad-subhead">Your clinical visit has been registered in our central records.</p>
          </div>

          <div className="ad-ticket">
            <div className="ad-ticket-banner">
              <div className="ad-tbn-bg" style={{ background: status.banner }} />
              <div className="ad-tbn-ring ad-tbn-ring-1" />
              <div className="ad-tbn-ring ad-tbn-ring-2" />
              <div className="ad-tbn-content">
                <div>
                  <div className="ad-tbn-hospital">SARS - Healthcare Solutions</div>
                  <div className="ad-tbn-title">Clinical Receipt</div>
                  <div className="ad-tbn-subtitle">Verified Appointment Document</div>
                </div>
                <div className="ad-tbn-status">
                  {status.icon}
                  {status.label}
                </div>
              </div>
            </div>

            <div className="ad-perf">
              <div className="ad-perf-line" />
            </div>

            <div className="ad-ticket-body">
              <div className="ad-id-box">
                <div className="ad-id-label">Appointment ID</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span className="ad-id-val">{appointment.appointmentId}</span>
                  <button className={`ad-copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="ad-date-band">
                <div className="ad-date-block">
                  <div className="ad-date-big">{dateOnly}</div>
                  <div className="ad-date-small">Schedule Date</div>
                </div>
                <div className="ad-date-block">
                  <div className="ad-date-big" style={{ color: 'var(--primary)' }}>{timeOnly}</div>
                  <div className="ad-date-small">Slot Time</div>
                </div>
              </div>

              <div className="ad-info-grid">
                <div className="ad-info-cell">
                  <div className="ad-cell-lbl" style={{ marginBottom: 12 }}>Assigned Doctor</div>
                  <div className="ad-cell-avatar" style={{ background: 'var(--primary)' }}>
                    {initials(appointment?.doctor?.name || 'NA')}
                  </div>
                  <div className="ad-cell-name">Dr. {appointment?.doctor?.name || 'Not Assigned'}</div>
                  <div className="ad-cell-meta">
                    {appointment?.doctor?.specialization || 'General Physician'}<br/>
                    {appointment.departmentName || 'General Medicine'}
                  </div>
                </div>

                <div className="ad-info-cell">
                  <div className="ad-cell-lbl" style={{ marginBottom: 12 }}>Patient Profile</div>
                  <div className="ad-cell-avatar" style={{ background: '#d97706' }}>
                    {initials(appointment?.patient?.name || 'NA')}
                  </div>
                  <div className="ad-cell-name">{appointment?.patient?.name || 'Patient'}</div>
                  <div className="ad-cell-meta">
                    {appointment?.patient?.email || 'No email available'}<br/>
                    {appointment?.patient?.gender || 'Not specified'}
                  </div>
                </div>
              </div>

              <div className="ad-reason-box">
                <div className="ad-reason-label">Reason For Visit</div>
                <div className="ad-reason-text">{appointment?.reason || 'No reason provided'}</div>
              </div>

              <div className="ad-actions">
                <button className="ad-btn ad-btn-outline" onClick={() => window.print()}>
                  Print Receipt
                </button>
                <button className="ad-btn ad-btn-primary" onClick={() => navigate('/my-appointments')}>
                  My Appointments
                </button>
                {canPatientCancel && (
                  <button className="ad-btn ad-btn-outline" style={{ borderColor: 'var(--destructive)', color: 'var(--destructive)' }} onClick={handleCancelByPatient} disabled={cancelling}>
                    {cancelling ? '...' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <p className="ad-footer">
            Please present this receipt at the front desk 15 minutes before your time.
          </p>
        </div>
      </div>
    </>
  )
}

export default AppointmentDetails

