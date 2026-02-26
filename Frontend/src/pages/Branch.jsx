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
          background: #faf8f5;
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        /* ── Decorative background ── */
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
          filter: blur(80px);
          opacity: 0.25;
        }
        .bg-blob-1 {
          width: 600px; height: 600px;
          top: -200px; right: -150px;
          background: radial-gradient(circle, #e4232080, transparent);
          animation: float1 12s ease-in-out infinite;
        }
        .bg-blob-2 {
          width: 400px; height: 400px;
          bottom: -100px; left: -100px;
          background: radial-gradient(circle, #f59e0b60, transparent);
          animation: float2 16s ease-in-out infinite;
        }
        .bg-blob-3 {
          width: 300px; height: 300px;
          top: 40%; left: 40%;
          background: radial-gradient(circle, #e4232030, transparent);
          animation: float1 20s ease-in-out infinite reverse;
        }
        @keyframes float1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(30px,-40px) scale(1.1); }
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
            linear-gradient(rgba(0,0,0,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,.04) 1px, transparent 1px);
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
          padding: 80px 24px 40px;
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
          font-weight: 600;
          letter-spacing: .15em;
          text-transform: uppercase;
          color: #e42320;
          background: #fff4f4;
          border: 1px solid #fdd;
          padding: 6px 16px;
          border-radius: 999px;
          margin-bottom: 20px;
        }
        .branch-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 6vw, 6rem);
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.1;
          max-width: 780px;
          margin-bottom: 20px;
        }
        .branch-title em {
          font-style: italic;
          color: #e42320;
        }
        .branch-sub {
          font-size: clamp(1rem, 1.5vw, 1.2rem);
          color: #666;
          max-width: 580px;
          line-height: 1.7;
          margin-bottom: 40px;
        }

        /* ── Search ── */
        .branch-search-wrap {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: center;
          padding: 0 24px 24px;
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
          background: #fff;
          border: 1.5px solid #e2e2e2;
          border-radius: 16px;
          padding: 14px 20px;
          width: 100%;
          max-width: 560px;
          box-shadow: 0 4px 24px rgba(0,0,0,.06);
          transition: border-color .2s, box-shadow .2s;
        }
        .branch-search-box:focus-within {
          border-color: #e42320;
          box-shadow: 0 0 0 4px rgba(228,35,32,.08), 0 4px 24px rgba(0,0,0,.06);
        }
        .branch-search-box input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: #1a1a1a;
        }
        .branch-search-box input::placeholder { color: #aaa; }
        .branch-search-icon { color: #e42320; flex-shrink: 0; }

        /* ── Stats bar ── */
        .branch-stats-bar {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: center;
          gap: 48px;
          padding: 16px 24px 48px;
          animation: fadeUp .7s .3s ease both;
        }
        .branch-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .branch-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1;
        }
        .branch-stat-label {
          font-size: 11px;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #999;
          margin-top: 4px;
        }
        .branch-stat-divider {
          width: 1px;
          height: 40px;
          background: #e2e2e2;
          align-self: center;
        }

        /* ── Grid ── */
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
        }
        .branch-grid-label {
          font-size: 13px;
          font-weight: 600;
          color: #999;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .branch-result-count {
          font-size: 13px;
          color: #aaa;
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
          color: #aaa;
          font-size: 1.1rem;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f0f0f0; }
        ::-webkit-scrollbar-thumb { background: #e42320; border-radius: 3px; }

        @media (max-width: 600px) {
          .branch-stats-bar { gap: 20px; }
          .branch-cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="branch-page">
        {/* Background decorations */}
        <div className="bg-deco">
          <div className="bg-blob bg-blob-1" />
          <div className="bg-blob bg-blob-2" />
          <div className="bg-blob bg-blob-3" />
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