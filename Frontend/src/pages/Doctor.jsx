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
          background: linear-gradient(160deg, #0f0c29 0%, #1a1040 20%, #24243e 45%, #1e1b4b 65%, #2d1b69 80%, #11071f 100%);
          font-family: 'Outfit', sans-serif;
          overflow-x: hidden;
        }

        /* ── Ambient blobs ── */
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
        }
        .doc-orb-1 {
          width: 640px; height: 640px;
          top: -220px; left: -180px;
          opacity: 0.45;
          background: radial-gradient(circle, #7c3aed, #4c1d95 55%, transparent);
          animation: orbFloat1 13s ease-in-out infinite;
        }
        .doc-orb-2 {
          width: 520px; height: 520px;
          bottom: -160px; right: -140px;
          opacity: 0.40;
          background: radial-gradient(circle, #a855f7, #6b21a8 60%, transparent);
          animation: orbFloat2 17s ease-in-out infinite;
        }
        .doc-orb-3 {
          width: 420px; height: 420px;
          top: 30%; right: 8%;
          opacity: 0.28;
          background: radial-gradient(circle, #e879f9, #a21caf 55%, transparent);
          animation: orbFloat1 21s ease-in-out infinite reverse;
        }
        .doc-orb-4 {
          width: 340px; height: 340px;
          bottom: 25%; left: 5%;
          opacity: 0.25;
          background: radial-gradient(circle, #f472b6, #9d174d 60%, transparent);
          animation: orbFloat2 19s ease-in-out infinite;
        }
        .doc-orb-5 {
          width: 260px; height: 260px;
          top: 60%; left: 38%;
          opacity: 0.20;
          background: radial-gradient(circle, #c084fc, #7e22ce 55%, transparent);
          animation: orbFloat1 15s ease-in-out infinite;
        }
        @keyframes orbFloat1 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(35px,-45px); }
        }
        @keyframes orbFloat2 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(-28px,38px); }
        }

        /* ── Grid texture ── */
        .doc-grid-texture {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,.030) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.030) 1px, transparent 1px);
          background-size: 56px 56px;
        }

        /* ── Hero ── */
        .doc-hero {
          position: relative;
          z-index: 1;
          padding: 110px 80px 60px;
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
          font-weight: 700;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: #c084fc;
          background: rgba(192,132,252,0.10);
          border: 1px solid rgba(192,132,252,0.25);
          padding: 7px 18px;
          border-radius: 999px;
          margin-bottom: 28px;
          backdrop-filter: blur(8px);
        }

        .doc-live-dot {
          width: 8px; height: 8px;
          background: #22c55e;
          border-radius: 50%;
          position: relative;
          flex-shrink: 0;
        }
        .doc-live-dot::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: rgba(34,197,94,0.35);
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
          color: #f0f0ff;
          line-height: 1.0;
          margin: 0 0 18px;
        }
        .doc-title em {
          font-style: italic;
          background: linear-gradient(135deg, #a78bfa, #e879f9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .doc-subtitle {
          font-size: clamp(.95rem, 1.3vw, 1.12rem);
          color: #9ca3af;
          max-width: 520px;
          line-height: 1.80;
        }

        /* ── Stats card ── */
        .doc-stats {
          display: flex;
          gap: 0;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(0,0,0,0.35);
          flex-shrink: 0;
          backdrop-filter: blur(16px);
          animation: heroIn .8s .15s ease both;
        }
        .doc-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 26px 34px;
          position: relative;
        }
        .doc-stat-item + .doc-stat-item::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; height: 60%;
          width: 1px;
          background: rgba(255,255,255,0.08);
        }
        .doc-stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #a78bfa, #e879f9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }
        .doc-stat-label {
          font-size: 11px;
          letter-spacing: .10em;
          text-transform: uppercase;
          color: #6b7280;
          margin-top: 5px;
        }

        /* ── Divider ── */
        .doc-divider {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 80px 44px;
          animation: heroIn .8s .25s ease both;
        }
        .doc-divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
        }
        .doc-divider-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .15em;
          text-transform: uppercase;
          color: #4b5563;
        }

        /* ── Sticky Search ── */
        .doc-search-bar {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(15,12,41,0.80);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
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
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.10);
          border-radius: 14px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          color: #e5e7eb;
          outline: none;
          transition: border-color .25s, box-shadow .25s;
          box-shadow: 0 2px 16px rgba(0,0,0,0.20);
        }
        .doc-search-inner input:focus {
          border-color: rgba(167,139,250,0.50);
          box-shadow: 0 0 0 4px rgba(167,139,250,0.10), 0 2px 16px rgba(0,0,0,0.20);
        }
        .doc-search-inner input::placeholder { color: #6b7280; }

        .doc-search-icon {
          position: absolute;
          left: 14px; top: 50%;
          transform: translateY(-50%);
          color: #a78bfa;
          pointer-events: none;
        }
        .doc-clear-btn {
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 2px;
          transition: color .2s;
        }
        .doc-clear-btn:hover { color: #a78bfa; }

        .doc-result-pill {
          font-size: 13px;
          color: #6b7280;
          white-space: nowrap;
        }
        .doc-result-pill strong { color: #e5e7eb; }
        .doc-result-pill span { color: #a78bfa; }

        /* ── Grid section ── */
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
          border: 3px solid rgba(255,255,255,0.08);
          border-top-color: #a78bfa;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .doc-loading p {
          font-size: 14px;
          color: #6b7280;
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
        .doc-empty-icon { font-size: 56px; margin-bottom: 8px; }
        .doc-empty h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 600;
          color: #e5e7eb;
        }
        .doc-empty p { font-size: 14px; color: #6b7280; }
        .doc-empty-clear {
          margin-top: 8px;
          background: none;
          border: 1.5px solid rgba(167,139,250,0.40);
          color: #a78bfa;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 9px 22px;
          border-radius: 10px;
          cursor: pointer;
          transition: background .2s, color .2s;
        }
        .doc-empty-clear:hover {
          background: rgba(167,139,250,0.15);
          color: #c084fc;
        }

        /* ── Cards grid ── */
        .doc-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 22px;
        }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f0c29; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 3px; }

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
        {/* Ambient blobs */}
        <div className="doc-ambient">
          <div className="doc-orb doc-orb-1" />
          <div className="doc-orb doc-orb-2" />
          <div className="doc-orb doc-orb-3" />
          <div className="doc-orb doc-orb-4" />
          <div className="doc-orb doc-orb-5" />
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