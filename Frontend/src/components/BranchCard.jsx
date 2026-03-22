import React from 'react'
import { MapPin, Phone, Navigation, Calendar, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const tagColors = {
  Flagship: 'bg-amber-100 text-amber-700',
  '24×7': 'bg-emerald-100 text-emerald-700',
  ICU: 'bg-rose-100 text-rose-700',
  New: 'bg-violet-100 text-violet-700',
}

const BranchCard = ({ branch, index }) => {
  const navigate = useNavigate()
  const location = branch.location || branch.address?.split(',').slice(-1)[0]?.trim() || 'N/A'
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address || branch.name)}`

  const handleBookAppointment = () => {
    navigate('/appointment', {
      state: {
        branchName: branch.name,
        branchId: branch.id
      }
    })
  }

  const handleViewBranch = () => {
    navigate(`/branches/${branch.id}`)
  }

  return (
    <>
      <style>{`
        .branch-card {
          opacity: 0;
          animation: cardIn .5s ease forwards;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-inner {
          background: #fff;
          border: 1.5px solid #ebebeb;
          border-radius: 24px;
          padding: 18px;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s;
          cursor: default;
          overflow: hidden;
        }
        .card-inner:hover {
          transform: translateY(-6px);
          box-shadow: 0 22px 60px rgba(0,0,0,.12);
          border-color: #0f172a;
        }
        .card-hero {
          position: relative;
          height: 150px;
          border-radius: 18px;
          overflow: hidden;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
        }
        .card-hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15,23,42,0.0) 40%, rgba(15,23,42,0.55) 100%);
        }
        .card-hero-img {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transform: scale(1.02);
          transition: transform .35s ease;
        }
        .card-inner:hover .card-hero-img {
          transform: scale(1.08);
        }
        .hero-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
        }
        .hero-meta {
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: 12px;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: #fff;
          font-weight: 700;
        }
        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem;
          line-height: 1.25;
        }
        .card-header {
          display: none;
        }
        .tag {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .08em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 999px;
          backdrop-filter: blur(6px);
        }
        .pulse-dot {
          width: 10px; height: 10px;
          background: #22c55e;
          border-radius: 50%;
          position: relative;
        }
        .pulse-dot::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: #22c55e40;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0; }
        }
        .card-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .info-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
          color: #555;
          line-height: 1.5;
        }
        .info-row svg { flex-shrink: 0; color: #e42320; margin-top: 2px; }
        .info-label {
          font-weight: 600;
          color: #999;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .05em;
          min-width: 32px;
        }
        .card-actions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 6px;
        }
        .btn-wide {
          grid-column: 1 / -1;
        }
        .btn-primary {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          background: #e42320;
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 11px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background .2s, transform .15s;
        }
        .btn-primary:hover { background: #c81c1a; transform: scale(1.02); }
        .btn-primary:active { transform: scale(.97); }
        .btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          background: transparent;
          color: #1a1a1a;
          border: 1.5px solid #e0e0e0;
          border-radius: 12px;
          padding: 11px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: border-color .2s, background .2s, color .2s, transform .15s;
          white-space: nowrap;
        }
        .btn-secondary:hover {
          border-color: #1a1a1a;
          background: #1a1a1a;
          color: #fff;
          transform: scale(1.02);
        }
      `}</style>

      <div className="branch-card" style={{ animationDelay: `${index * 0.08}s` }}>
        <div className="card-inner">
          <div className="card-hero">
            <div
              className="card-hero-img"
              style={{ backgroundImage: branch.imageUrl ? `url(${branch.imageUrl})` : 'none' }}
            />
            <div className="hero-tag">
              <span className={`tag ${tagColors[branch.tag] || 'bg-gray-100 text-gray-600'}`}>
                {branch.tag}
              </span>
            </div>
            <div className="hero-meta">
              <div className="hero-title">{branch.name}</div>
              <div className="pulse-dot" />
            </div>
          </div>

          <div className="card-info">
            <div className="info-row">
              <MapPin size={14} strokeWidth={2} />
              <span>{branch.address}</span>
            </div>
            <div className="info-row">
              <span className="info-label">City</span>
              <span>{location}</span>
            </div>
            <div className="info-row">
              <Phone size={14} strokeWidth={2} />
              <span>{branch.contact || branch.contactNumber}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Mail</span>
              <span>{branch.email}</span>
            </div>
          </div>

          <div className="card-actions">
            <button className="btn-secondary" onClick={handleViewBranch}>
              <Eye size={14} />
              View Details
            </button>
            <button className="btn-primary" onClick={handleBookAppointment}>
              <Calendar size={14} />
              Book Appointment
            </button>
            <a className="btn-secondary btn-wide" href={mapUrl} target="_blank" rel="noreferrer">
              <Navigation size={14} />
              Directions
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default BranchCard

