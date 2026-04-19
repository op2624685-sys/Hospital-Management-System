import React from 'react'
import { useNavigate } from 'react-router-dom'
import DoctorRatingDisplay from './DoctorRatingDisplay'

const specialityConfig = {
  'Cardiology':    { color: 'var(--primary)', bg: 'var(--secondary)', border: 'var(--border)' },
  'Neurology':     { color: 'var(--chart-5)', bg: 'var(--background)', border: 'var(--border)' },
  'Pediatrics':    { color: 'var(--primary)', bg: 'var(--secondary)', border: 'var(--border)' },
  'Orthopedics':   { color: 'var(--primary)', bg: 'var(--background)', border: 'var(--border)' },
  'Dermatology':   { color: 'var(--chart-5)', bg: 'var(--secondary)', border: 'var(--border)' },
  'default':       { color: 'var(--primary)', bg: 'var(--secondary)', border: 'var(--border)' },
}

const avatarPairs = [
  ['var(--primary)', 'var(--chart-5)'],
  ['var(--chart-5)', 'var(--primary)'],
  ['var(--primary)', 'var(--chart-1)'],
  ['var(--chart-5)', 'var(--chart-1)'],
  ['var(--primary)', 'var(--chart-4)'],
  ['var(--chart-5)', 'var(--chart-4)'],
]

const DoctorCard = ({ doctor, index = 0 }) => {
  const navigate = useNavigate()

  const specialization = doctor.specialization || doctor.speciality
  const firstDepartment = Array.isArray(doctor.departments) ? doctor.departments[0] : doctor.department
  const config = specialityConfig[specialization] || specialityConfig.default
  const [c1, c2] = avatarPairs[doctor.id % avatarPairs.length]

  const initials = doctor.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // ── Navigate to /appointment and pass doctor info via location.state ──
  const handleBookAppointment = (e) => {
    e.stopPropagation()
    navigate('/appointment', {
      state: {
        doctorId:   doctor.id,
        doctorName: doctor.name,
        speciality: specialization || '',
        department: firstDepartment?.name || '',
        branchId: doctor?.branch?.id || null,
        branchName: doctor?.branch?.name || '',
      }
    })
  }

  const handleViewProfile = (e) => {
    e.stopPropagation()
    navigate(`/doctors/${doctor.id}`)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,600&family=Outfit:wght@300;400;500;600&display=swap');

        .dc-card {
          opacity: 0;
          animation: dcIn .5s ease forwards;

          font-family: 'Outfit', sans-serif;
        }
        @keyframes dcIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dc-inner {
          background: var(--card);
          border: 1.5px solid var(--border);
          border-radius: 24px;
          overflow: hidden;
          cursor: pointer;
          transition: transform .28s ease, box-shadow .28s ease, border-color .28s;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .dc-inner:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 56px rgba(0,0,0,.10);
          border-color: var(--dc-accent);
        }
        .dc-banner {
          position: relative;
          height: 100px;
          background: linear-gradient(135deg, var(--dc-c1), var(--dc-c2));
          overflow: hidden;
          flex-shrink: 0;
        }
        .dc-banner-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,.15);
        }
        .dc-banner-ring-1 { width: 160px; height: 160px; top: -60px; right: -40px; }
        .dc-banner-ring-2 { width: 100px; height: 100px; bottom: -50px; left: -20px; }
        .dc-avail-badge {
          position: absolute;
          top: 12px; right: 12px;
          display: flex;
          align-items: center;
          gap: 5px;
          background: var(--card);
          backdrop-filter: blur(8px);
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          color: var(--foreground);
        }
        .dc-avail-dot {
          width: 7px; height: 7px;
          background: #22c55e;
          border-radius: 50%;
          position: relative;
        }
        .dc-avail-dot::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          background: #22c55e40;
          animation: availPulse 2s ease-in-out infinite;
        }
        @keyframes availPulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.8); opacity: 0; }
        }
        .dc-avatar-wrap {
          position: relative;
          z-index: 2;
          margin: -36px auto 0;
          width: 72px; height: 72px;
          flex-shrink: 0;
        }
        .dc-avatar {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--dc-c1), var(--dc-c2));
          border: 3px solid var(--card);
          box-shadow: 0 4px 16px rgba(0,0,0,.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dc-initials {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: #fff;
          letter-spacing: .03em;
        }
        .dc-body {
          padding: 14px 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }
        .dc-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--foreground);
          text-align: center;
          line-height: 1.2;
        }
        .dc-email {
          font-size: 12px;
          color: var(--muted-foreground);
          text-align: center;
          margin-top: -4px;
        }
        .dc-speciality-badge {
          display: inline-block;
          align-self: center;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .08em;
          text-transform: uppercase;
          padding: 5px 14px;
          border-radius: 999px;
          border: 1px solid var(--dc-border);
          background: var(--dc-bg);
          color: var(--dc-accent);
        }
        .dc-dept-row {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12.5px;
          color: var(--muted-foreground);
          justify-content: center;
        }
        .dc-dept-row svg { color: var(--dc-accent); flex-shrink: 0; }
        .dc-meta-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          font-size: 11px;
          color: #94a3b8;
          margin-top: -2px;
        }
        .dc-branch {
          color: var(--muted-foreground);
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 65%;
        }
        .dc-divider { height: 1px; background: var(--border); }
        .dc-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .dc-btn {
          width: 100%;
          padding: 11px;
          border-radius: 14px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid var(--border);
          cursor: pointer;
          transition: background .25s, color .25s, transform .15s, box-shadow .25s;
          letter-spacing: .02em;
        }
        .dc-btn-default { background: var(--background); color: var(--foreground); }
        .dc-btn-primary { background: var(--dc-c1); color: #fff; border-color: transparent; box-shadow: 0 8px 24px rgba(0,0,0,.15); }
        .dc-btn:active { transform: scale(.97); }
      `}</style>

      <div
        className="dc-card"
        style={{
          animationDelay: `${index * 0.07}s`,
          '--dc-c1': c1,
          '--dc-c2': c2,
          '--dc-accent': config.color,
          '--dc-bg': config.bg,
          '--dc-border': config.border,
        }}
      >
        <div className="dc-inner">
          <div className="dc-banner">
            <div className="dc-banner-ring dc-banner-ring-1" />
            <div className="dc-banner-ring dc-banner-ring-2" />
            <div className="dc-avail-badge">
              <div className="dc-avail-dot" />
              Available
            </div>
          </div>

          <div className="dc-avatar-wrap">
            <div className="dc-avatar">
              <span className="dc-initials">{initials}</span>
            </div>
          </div>

          <div className="dc-body">
            <div>
              <h3 className="dc-name">{doctor.name}</h3>
              <p className="dc-email">{doctor.email}</p>
            </div>

            <span className="dc-speciality-badge">
              {specialization || 'General'}
            </span>

            <div className="dc-dept-row">
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{firstDepartment?.name || 'General Department'}</span>
            </div>

            <div className="dc-meta-row">
              <span className="dc-branch">{doctor?.branch?.name || 'Branch N/A'}</span>
              <DoctorRatingDisplay doctorId={doctor.id} size="sm" />
            </div>

            <div className="dc-divider" />

            <div className="dc-actions">
              <button className="dc-btn dc-btn-default" onClick={handleViewProfile}>
                View Profile
              </button>
              <button className="dc-btn dc-btn-primary" onClick={handleBookAppointment}>
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DoctorCard
