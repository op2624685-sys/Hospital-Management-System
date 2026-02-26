import React from 'react'
import { MapPin, Phone, Navigation, Calendar } from 'lucide-react'

const tagColors = {
  Flagship: 'bg-amber-100 text-amber-700',
  '24×7': 'bg-emerald-100 text-emerald-700',
  ICU: 'bg-rose-100 text-rose-700',
  New: 'bg-violet-100 text-violet-700',
}

const BranchCard = ({ branch, index }) => {
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
          border-radius: 20px;
          padding: 24px;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s;
          cursor: default;
        }
        .card-inner:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(0,0,0,.09);
          border-color: #e42320;
        }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tag {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .08em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 999px;
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
        .card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.35;
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
          display: flex;
          gap: 10px;
          margin-top: 4px;
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
          <div className="card-header">
            <span className={`tag ${tagColors[branch.tag] || 'bg-gray-100 text-gray-600'}`}>
              {branch.tag}
            </span>
            <div className="pulse-dot" />
          </div>

          <h3 className="card-title">{branch.name}</h3>

          <div className="card-info">
            <div className="info-row">
              <MapPin size={14} strokeWidth={2} />
              <span>{branch.address}</span>
            </div>
            <div className="info-row">
              <span className="info-label">City</span>
              <span>{branch.location}</span>
            </div>
            <div className="info-row">
              <span className="info-label">PIN</span>
              <span>{branch.pincode}</span>
            </div>
            <div className="info-row">
              <Phone size={14} strokeWidth={2} />
              <span>{branch.contact}</span>
            </div>
          </div>

          <div className="card-actions">
            <button className="btn-primary">
              <Calendar size={14} />
              Book Appointment
            </button>
            <button className="btn-secondary">
              <Navigation size={14} />
              Directions
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default BranchCard