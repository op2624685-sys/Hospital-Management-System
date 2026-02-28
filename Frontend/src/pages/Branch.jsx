import React, { useState } from 'react'
import { Search, Heart } from 'lucide-react'
import Header from '../components/Header'
import BranchCard from '../components/BranchCard'

const branches = [
  {
    id: 1,
    name: 'Sarda Heart Hospital Mumbai',
    address: 'Falana, Thikana Jagha, Near There Where Here',
    location: 'Mumbai',
    pincode: '400001',
    contact: '+91 98765 43210',
    tag: 'Flagship',
  },
  {
    id: 2,
    name: 'Sarda Heart Hospital Pune',
    address: 'Plot 45, MG Road, Near City Mall, Shivajinagar',
    location: 'Pune',
    pincode: '411005',
    contact: '+91 98765 43211',
    tag: '24×7',
  },
  {
    id: 3,
    name: 'Sarda Heart Hospital Delhi',
    address: 'Block C, Connaught Place, Central Delhi',
    location: 'New Delhi',
    pincode: '110001',
    contact: '+91 98765 43212',
    tag: 'ICU',
  },
  {
    id: 4,
    name: 'Sarda Heart Hospital Bengaluru',
    address: '12th Cross, Indiranagar, Near 100ft Road',
    location: 'Bengaluru',
    pincode: '560038',
    contact: '+91 98765 43213',
    tag: 'New',
  },
  {
    id: 5,
    name: 'Sarda Heart Hospital Chennai',
    address: 'Anna Salai, Teynampet, South Chennai',
    location: 'Chennai',
    pincode: '600018',
    contact: '+91 98765 43214',
    tag: '24×7',
  },
  {
    id: 6,
    name: 'Sarda Heart Hospital Hyderabad',
    address: 'Banjara Hills Road No. 10, Near Jubilee Hills',
    location: 'Hyderabad',
    pincode: '500034',
    contact: '+91 98765 43215',
    tag: 'ICU',
  },
]

const Branch = () => {
  const [query, setQuery] = useState('')

  const filtered = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.location.toLowerCase().includes(query.toLowerCase()) ||
      b.pincode.includes(query)
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .branch-page {
          min-height: 100vh;
          background: linear-gradient(160deg, #0f0c29 0%, #1a1040 20%, #24243e 45%, #1e1b4b 65%, #2d1b69 80%, #11071f 100%);
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        /* ── Decorative background blobs ── */
        .bg-deco {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .bg-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
        }

        .bg-blob-1 {
          width: 620px; height: 620px;
          top: -200px; left: -180px;
          opacity: 0.45;
          background: radial-gradient(circle, #7c3aed, #4c1d95 55%, transparent);
          animation: float1 12s ease-in-out infinite;
        }
        .bg-blob-2 {
          width: 520px; height: 520px;
          bottom: -160px; right: -160px;
          opacity: 0.40;
          background: radial-gradient(circle, #a855f7, #6b21a8 60%, transparent);
          animation: float2 16s ease-in-out infinite;
        }
        .bg-blob-3 {
          width: 420px; height: 420px;
          top: 30%; right: 5%;
          opacity: 0.30;
          background: radial-gradient(circle, #e879f9, #a21caf 55%, transparent);
          animation: float1 20s ease-in-out infinite reverse;
        }
        .bg-blob-4 {
          width: 340px; height: 340px;
          bottom: 20%; left: 5%;
          opacity: 0.28;
          background: radial-gradient(circle, #f472b6, #9d174d 60%, transparent);
          animation: float2 18s ease-in-out infinite;
        }
        .bg-blob-5 {
          width: 260px; height: 260px;
          top: 55%; left: 40%;
          opacity: 0.22;
          background: radial-gradient(circle, #c084fc, #7e22ce 55%, transparent);
          animation: float1 14s ease-in-out infinite;
        }

        @keyframes float1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(30px,-40px) scale(1.08); }
        }
        @keyframes float2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-20px,30px) scale(1.05); }
        }

        /* ── Grid overlay ── */
        .grid-lines {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* ── Hero ── */
        .branch-hero {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 24px 40px;
          text-align: center;
          animation: fadeDown .7s ease both;
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .branch-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .15em;
          text-transform: uppercase;
          color: #c084fc;
          background: rgba(192, 132, 252, 0.10);
          border: 1px solid rgba(192, 132, 252, 0.25);
          padding: 7px 18px;
          border-radius: 999px;
          margin-bottom: 24px;
          backdrop-filter: blur(8px);
        }

        .branch-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 6vw, 6rem);
          font-weight: 700;
          color: #f0f0ff;
          line-height: 1.1;
          max-width: 780px;
          margin-bottom: 20px;
        }
        .branch-title em {
          font-style: italic;
          background: linear-gradient(135deg, #a78bfa, #e879f9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .branch-sub {
          font-size: clamp(1rem, 1.5vw, 1.15rem);
          color: #9ca3af;
          max-width: 560px;
          line-height: 1.75;
          margin-bottom: 40px;
        }

        /* ── Search ── */
        .branch-search-wrap {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: center;
          padding: 0 24px 28px;
          animation: fadeUp .7s .2s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .branch-search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          padding: 14px 20px;
          width: 100%;
          max-width: 560px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.30);
          backdrop-filter: blur(16px);
          transition: border-color .25s, box-shadow .25s;
        }
        .branch-search-box:focus-within {
          border-color: rgba(167, 139, 250, 0.5);
          box-shadow: 0 0 0 4px rgba(167,139,250,0.12), 0 4px 32px rgba(0,0,0,0.30);
        }
        .branch-search-box input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: #e5e7eb;
        }
        .branch-search-box input::placeholder { color: #6b7280; }
        .branch-search-icon { color: #a78bfa; flex-shrink: 0; }

        /* ── Stats bar ── */
        .branch-stats-bar {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: center;
          gap: 48px;
          padding: 16px 24px 52px;
          animation: fadeUp .7s .3s ease both;
        }

        .branch-stat { display: flex; flex-direction: column; align-items: center; }

        .branch-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #a78bfa, #e879f9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .branch-stat-label {
          font-size: 11px;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #6b7280;
          margin-top: 5px;
        }

        .branch-stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.08);
          align-self: center;
        }

        /* ── Grid section ── */
        .branch-grid-section {
          position: relative;
          z-index: 1;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }

        .branch-grid-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .branch-grid-label {
          font-size: 13px;
          font-weight: 700;
          color: #6b7280;
          letter-spacing: .10em;
          text-transform: uppercase;
        }

        .branch-result-count {
          font-size: 13px;
          color: #4b5563;
        }

        .branch-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .branch-no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 0;
          color: #6b7280;
          font-size: 1.1rem;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f0c29; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 3px; }

        @media (max-width: 600px) {
          .branch-stats-bar { gap: 20px; }
          .branch-cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="branch-page">
        {/* Background blobs */}
        <div className="bg-deco">
          <div className="bg-blob bg-blob-1" />
          <div className="bg-blob bg-blob-2" />
          <div className="bg-blob bg-blob-3" />
          <div className="bg-blob bg-blob-4" />
          <div className="bg-blob bg-blob-5" />
        </div>
        <div className="grid-lines" />

        <Header />

        {/* Hero */}
        <section className="branch-hero">
          <span className="branch-eyebrow">
            <Heart size={12} fill="currentColor" /> Pan-India Network
          </span>
          <h1 className="branch-title">
            Find Our Branch <em>Near You</em>
          </h1>
          <p className="branch-sub">
            Locate Sarda Heart Hospitals across the country. View addresses,
            contact details, and operating hours to plan your visit with ease.
          </p>
        </section>

        {/* Search */}
        <div className="branch-search-wrap">
          <div className="branch-search-box">
            <Search size={18} className="branch-search-icon" />
            <input
              type="text"
              placeholder="Search by city, hospital name, or PIN..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="branch-stats-bar">
          <div className="branch-stat">
            <span className="branch-stat-num">6+</span>
            <span className="branch-stat-label">Cities</span>
          </div>
          <div className="branch-stat-divider" />
          <div className="branch-stat">
            <span className="branch-stat-num">24×7</span>
            <span className="branch-stat-label">Emergency</span>
          </div>
          <div className="branch-stat-divider" />
          <div className="branch-stat">
            <span className="branch-stat-num">50k+</span>
            <span className="branch-stat-label">Patients</span>
          </div>
          <div className="branch-stat-divider" />
          <div className="branch-stat">
            <span className="branch-stat-num">15+</span>
            <span className="branch-stat-label">Years</span>
          </div>
        </div>

        {/* Cards Grid */}
        <section className="branch-grid-section">
          <div className="branch-grid-header">
            <span className="branch-grid-label">Our Branches</span>
            <span className="branch-result-count">
              {filtered.length} location{filtered.length !== 1 ? 's' : ''} found
            </span>
          </div>
          <div className="branch-cards-grid">
            {filtered.length > 0 ? (
              filtered.map((branch, i) => (
                <BranchCard key={branch.id} branch={branch} index={i} />
              ))
            ) : (
              <div className="branch-no-results">
                No branches found for &ldquo;{query}&rdquo;
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}

export default Branch