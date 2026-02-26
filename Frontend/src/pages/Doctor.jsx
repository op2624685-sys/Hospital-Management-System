import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import DoctorCard from '../components/DoctorCard'
import API from '../api/api'

const Doctor = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await API.get('/public/doctors')
        setDoctors(response.data)
      } catch (error) {
        console.error('Failed to fetch doctors:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDoctors()
  }, [])

  const filtered = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(search.toLowerCase()) ||
    doctor.speciality?.toLowerCase().includes(search.toLowerCase()) ||
    doctor.department?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .doc-page {
          min-height: 100vh;
          background: #f9f6f2;
          font-family: 'Outfit', sans-serif;
          overflow-x: hidden;
        }

        /* ── Ambient BG ── */
        .doc-ambient {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .doc-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: .2;
        }
        .doc-orb-1 {
          width: 700px; height: 700px;
          top: -250px; right: -200px;
          background: radial-gradient(circle, #e42320, transparent);
          animation: orbFloat1 14s ease-in-out infinite;
        }
        .doc-orb-2 {
          width: 450px; height: 450px;
          bottom: -150px; left: -100px;
          background: radial-gradient(circle, #f59e0b, transparent);
          animation: orbFloat2 18s ease-in-out infinite;
        }
        .doc-orb-3 {
          width: 350px; height: 350px;
          top: 50%; left: 35%;
          background: radial-gradient(circle, #10b981, transparent);
          opacity: .1;
          animation: orbFloat1 22s ease-in-out infinite reverse;
        }
        @keyframes orbFloat1 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(40px,-50px); }
        }
        @keyframes orbFloat2 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(-30px,40px); }
        }

        /* ── Grid texture ── */
        .doc-grid-texture {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(0,0,0,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,.035) 1px, transparent 1px);
          background-size: 56px 56px;
        }

        /* ── Hero ── */
        .doc-hero {
          position: relative;
          z-index: 1;
          padding: 100px 80px 60px;
          animation: heroIn .8s ease both;
        }
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(-24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .doc-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: #e42320;
          background: rgba(228,35,32,.08);
          border: 1px solid rgba(228,35,32,.2);
          padding: 6px 18px;
          border-radius: 999px;
          margin-bottom: 24px;
        }
        .doc-live-dot {
          width: 8px; height: 8px;
          background: #22c55e;
          border-radius: 50%;
          position: relative;
        }
        .doc-live-dot::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: #22c55e40;
          animation: livePulse 1.8s ease-in-out infinite;
        }
        @keyframes livePulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.8); opacity: 0; }
        }

        .doc-hero-body {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 40px;
          flex-wrap: wrap;
        }
        .doc-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3.5rem, 6vw, 7rem);
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.0;
          margin: 0 0 16px;
        }
        .doc-title em {
          font-style: italic;
          color: #e42320;
        }
        .doc-subtitle {
          font-size: clamp(.95rem, 1.3vw, 1.15rem);
          color: #777;
          max-width: 520px;
          line-height: 1.75;
        }

        /* Stats */
        .doc-stats {
          display: flex;
          gap: 0;
          background: #fff;
          border: 1.5px solid #ebebeb;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,.06);
          flex-shrink: 0;
          animation: heroIn .8s .15s ease both;
        }
        .doc-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 32px;
          position: relative;
        }
        .doc-stat-item + .doc-stat-item::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; height: 60%;
          width: 1px;
          background: #ebebeb;
        }
        .doc-stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.2rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1;
        }
        .doc-stat-label {
          font-size: 11px;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #aaa;
          margin-top: 4px;
        }

        /* ── Divider ── */
        .doc-divider {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 80px 40px;
          animation: heroIn .8s .25s ease both;
        }
        .doc-divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #ddd, transparent);
        }
        .doc-divider-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .15em;
          text-transform: uppercase;
          color: #bbb;
        }

        /* ── Sticky Search ── */
        .doc-search-bar {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(249,246,242,.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(0,0,0,.06);
          padding: 16px 80px;
          display: flex;
          align-items: center;
          gap: 16px;
          animation: heroIn .8s .3s ease both;
        }
        .doc-search-inner {
          position: relative;
          flex: 1;
          max-width: 560px;
        }
        .doc-search-inner input {
          width: 100%;
          padding: 13px 44px;
          background: #fff;
          border: 1.5px solid #e2e2e2;
          border-radius: 14px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          color: #1a1a1a;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          box-shadow: 0 2px 12px rgba(0,0,0,.04);
        }
        .doc-search-inner input:focus {
          border-color: #e42320;
          box-shadow: 0 0 0 4px rgba(228,35,32,.07), 0 2px 12px rgba(0,0,0,.04);
        }
        .doc-search-inner input::placeholder { color: #bbb; }
        .doc-search-icon {
          position: absolute;
          left: 14px; top: 50%;
          transform: translateY(-50%);
          color: #e42320;
          pointer-events: none;
        }
        .doc-clear-btn {
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #bbb;
          cursor: pointer;
          padding: 2px;
          transition: color .2s;
        }
        .doc-clear-btn:hover { color: #e42320; }
        .doc-result-pill {
          font-size: 13px;
          color: #999;
          white-space: nowrap;
        }
        .doc-result-pill strong { color: #1a1a1a; }
        .doc-result-pill span { color: #e42320; }

        /* ── Grid ── */
        .doc-grid-section {
          position: relative;
          z-index: 1;
          padding: 40px 80px 80px;
        }

        /* ── Loading ── */
        .doc-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 0;
          gap: 20px;
        }
        .doc-spinner {
          width: 44px; height: 44px;
          border-radius: 50%;
          border: 3px solid #f0f0f0;
          border-top-color: #e42320;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .doc-loading p {
          font-size: 14px;
          color: #aaa;
          letter-spacing: .05em;
        }

        /* ── Empty ── */
        .doc-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 0;
          gap: 12px;
        }
        .doc-empty-icon {
          font-size: 56px;
          margin-bottom: 8px;
        }
        .doc-empty h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 600;
          color: #1a1a1a;
        }
        .doc-empty p {
          font-size: 14px;
          color: #aaa;
        }
        .doc-empty-clear {
          margin-top: 8px;
          background: none;
          border: 1.5px solid #e42320;
          color: #e42320;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 9px 22px;
          border-radius: 10px;
          cursor: pointer;
          transition: background .2s, color .2s;
        }
        .doc-empty-clear:hover {
          background: #e42320;
          color: #fff;
        }

        /* ── Cards grid ── */
        .doc-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 22px;
        }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f0f0f0; }
        ::-webkit-scrollbar-thumb { background: #e42320; border-radius: 3px; }

        @media (max-width: 768px) {
          .doc-hero { padding: 80px 24px 40px; }
          .doc-divider { padding: 0 24px 32px; }
          .doc-search-bar { padding: 14px 24px; }
          .doc-grid-section { padding: 32px 24px 60px; }
          .doc-stats { flex-wrap: wrap; }
          .doc-hero-body { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="doc-page">
        {/* Ambient */}
        <div className="doc-ambient">
          <div className="doc-orb doc-orb-1" />
          <div className="doc-orb doc-orb-2" />
          <div className="doc-orb doc-orb-3" />
        </div>
        <div className="doc-grid-texture" />

        <Header />

        {/* ── Hero ── */}
        <section className="doc-hero">
          <div className="doc-eyebrow">
            <div className="doc-live-dot" />
            Sarda Heart Hospital · Our Medical Team
          </div>

          <div className="doc-hero-body">
            <div>
              <h1 className="doc-title">
                Meet Our <br /><em>Specialists</em>
              </h1>
              <p className="doc-subtitle">
                A team of highly skilled and dedicated physicians committed to delivering
                exceptional cardiac care — every patient, every time.
              </p>
            </div>

            <div className="doc-stats">
              {[
                { value: `${doctors.length || '—'}`, label: 'Doctors' },
                { value: '15+', label: 'Specialties' },
                { value: '50k+', label: 'Patients' },
                { value: '24/7', label: 'Available' },
              ].map((s, i) => (
                <div className="doc-stat-item" key={i}>
                  <span className="doc-stat-num">{s.value}</span>
                  <span className="doc-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="doc-divider">
          <div className="doc-divider-line" />
          <span className="doc-divider-label">Our Physicians</span>
          <div className="doc-divider-line" />
        </div>

        {/* ── Sticky Search ── */}
        <div className="doc-search-bar">
          <div className="doc-search-inner">
            <svg className="doc-search-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, specialization or department..."
            />
            {search && (
              <button className="doc-clear-btn" onClick={() => setSearch('')}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {!loading && (
            <p className="doc-result-pill">
              <strong>{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''}
              {search && <> for <span>"{search}"</span></>}
            </p>
          )}
        </div>

        {/* ── Content ── */}
        <section className="doc-grid-section">
          {loading && (
            <div className="doc-loading">
              <div className="doc-spinner" />
              <p>Loading our specialists...</p>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="doc-empty">
              <div className="doc-empty-icon">👨‍⚕️</div>
              <h3>No doctors found</h3>
              <p>Try searching with different keywords</p>
              {search && (
                <button className="doc-empty-clear" onClick={() => setSearch('')}>
                  Clear search
                </button>
              )}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="doc-cards-grid">
              {filtered.map((doctor, i) => (
                <DoctorCard key={doctor.id} doctor={doctor} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}

export default Doctor