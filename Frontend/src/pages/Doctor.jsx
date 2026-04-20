import React, { useState } from 'react'
import Header from '../components/Header'
import DoctorCard from '../components/DoctorCard'
import API from '../api/api'
import PageLoader from '../components/PageLoader'
import { useQuery } from '@tanstack/react-query'

const Doctor = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [size] = useState(10)

  const {
    data: doctors = [],
    isLoading: loading,
  } = useQuery({
    queryKey: ['public-doctors', page, size],
    queryFn: async () => {
      const response = await API.get(`/public/doctors?page=${page}&size=${size}`)
      return Array.isArray(response.data) ? response.data : []
    },
  })

  const hasMore = doctors.length === size

  const normalizedSearch = search.toLowerCase().trim()
  const filtered = doctors.filter(doctor => {
    const firstDepartment = Array.isArray(doctor.departments) ? doctor.departments[0] : doctor.department
    const doctorName = (doctor?.name || '').toLowerCase()
    const doctorSpeciality = (doctor?.speciality || '').toLowerCase()
    const doctorSpecialization = (doctor?.specialization || '').toLowerCase()
    const departmentName = (firstDepartment?.name || '').toLowerCase()
    return (
      doctorName.includes(normalizedSearch) ||
      doctorSpeciality.includes(normalizedSearch) ||
      doctorSpecialization.includes(normalizedSearch) ||
      departmentName.includes(normalizedSearch)
    )
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .doc-page {
          min-height: 100vh;
          background: transparent;
          font-family: 'Outfit', sans-serif;
          overflow-x: hidden;
        }



        .doc-hero { position: relative; z-index: 1; padding: 110px 80px 60px; animation: heroIn .8s ease both; }
        @keyframes heroIn { from { opacity: 0; transform: translateY(-24px); } to { opacity: 1; transform: translateY(0); } }

        .doc-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
          color: var(--primary); background: color-mix(in srgb, var(--primary) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--primary) 22%, transparent);
          padding: 7px 18px; border-radius: 999px; margin-bottom: 28px; backdrop-filter: blur(8px);
        }

        .doc-live-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; position: relative; flex-shrink: 0; }
        .doc-live-dot::after { content: ''; position: absolute; inset: -3px; border-radius: 50%; background: rgba(34,197,94,0.35); animation: livePulse 1.8s ease-in-out infinite; }
        @keyframes livePulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.8); opacity: 0; } }

        .doc-hero-body { display: flex; align-items: flex-end; justify-content: space-between; gap: 40px; flex-wrap: wrap; }

        .doc-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(3.5rem, 6vw, 7rem); font-weight: 700; color: var(--foreground); line-height: 1.0; margin: 0 0 18px; }
        .doc-title em { font-style: italic; background: linear-gradient(135deg, var(--primary), var(--chart-5)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .doc-subtitle { font-size: clamp(.95rem, 1.3vw, 1.12rem); color: var(--muted-foreground); max-width: 520px; line-height: 1.80; }

        .doc-stats {
          display: flex; gap: 0; background: var(--card); border: 1px solid var(--border);
          border-radius: 20px; overflow: hidden; box-shadow: 0 8px 40px color-mix(in srgb, var(--primary) 10%, transparent);
          flex-shrink: 0; backdrop-filter: blur(16px); animation: heroIn .8s .15s ease both;
        }
        .doc-stat-item { display: flex; flex-direction: column; align-items: center; padding: 26px 34px; position: relative; }
        .doc-stat-item + .doc-stat-item::before { content: ''; position: absolute; left: 0; top: 20%; height: 60%; width: 1px; background: var(--border); }
        .doc-stat-num { font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; font-weight: 700; background: linear-gradient(135deg, var(--primary), var(--chart-5)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; }
        .doc-stat-label { font-size: 11px; letter-spacing: .10em; text-transform: uppercase; color: var(--muted-foreground); margin-top: 5px; }

        .doc-divider { position: relative; z-index: 1; display: flex; align-items: center; gap: 16px; padding: 0 80px 44px; animation: heroIn .8s .25s ease both; }
        .doc-divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--border), transparent); }
        .doc-divider-label { font-size: 11px; font-weight: 600; letter-spacing: .15em; text-transform: uppercase; color: var(--muted-foreground); }

        .doc-search-bar {
          position: sticky; top: 0; z-index: 20;
          background: color-mix(in srgb, var(--background) 85%, transparent);
          backdrop-filter: blur(20px); border-bottom: 1px solid var(--border);
          padding: 16px 80px; display: flex; align-items: center; gap: 16px; animation: heroIn .8s .3s ease both;
        }
        .doc-search-inner { position: relative; flex: 1; max-width: 560px; }
        .doc-search-inner input {
          width: 100%; padding: 13px 44px; background: var(--card); border: 1.5px solid var(--border);
          border-radius: 14px; font-family: 'Outfit', sans-serif; font-size: 14px; color: var(--foreground);
          outline: none; transition: border-color .25s, box-shadow .25s; box-shadow: 0 2px 16px color-mix(in srgb, var(--primary) 6%, transparent);
        }
        .doc-search-inner input:focus { border-color: var(--ring); box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 10%, transparent); }
        .doc-search-inner input::placeholder { color: var(--muted-foreground); }

        .doc-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--primary); pointer-events: none; }
        .doc-clear-btn { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--muted-foreground); cursor: pointer; padding: 2px; transition: color .2s; }
        .doc-clear-btn:hover { color: var(--primary); }

        .doc-result-pill { font-size: 13px; color: var(--muted-foreground); white-space: nowrap; }
        .doc-result-pill strong { color: var(--foreground); }
        .doc-result-pill span { color: var(--primary); }

        .doc-grid-section { position: relative; z-index: 1; padding: 40px 80px 80px; }

        .doc-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 0; gap: 20px; }
        .doc-spinner { width: 44px; height: 44px; border-radius: 50%; border: 3px solid var(--border); border-top-color: var(--primary); animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .doc-loading p { font-size: 14px; color: var(--muted-foreground); letter-spacing: .05em; }

        .doc-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 0; gap: 12px; }
        .doc-empty-icon { font-size: 56px; margin-bottom: 8px; }
        .doc-empty h3 { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 600; color: var(--foreground); }
        .doc-empty p { font-size: 14px; color: var(--muted-foreground); }
        .doc-empty-clear { margin-top: 8px; background: none; border: 1.5px solid var(--border); color: var(--primary); font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600; padding: 9px 22px; border-radius: 10px; cursor: pointer; transition: background .2s, color .2s; }
        .doc-empty-clear:hover { background: color-mix(in srgb, var(--primary) 8%, transparent); border-color: var(--ring); }

        .doc-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 22px; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--muted); }
        ::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 3px; }

        .doc-pagination { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 40px; animation: heroIn .8s .4s ease both; }
        .doc-page-btn {
          display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px;
          background: var(--card); border: 1px solid var(--border); border-radius: 12px;
          font-size: 14px; font-weight: 600; color: var(--primary); cursor: pointer;
          transition: all .2s; box-shadow: 0 4px 12px color-mix(in srgb, var(--primary) 6%, transparent);
        }
        .doc-page-btn:hover:not(:disabled) { border-color: var(--ring); background: color-mix(in srgb, var(--primary) 8%, transparent); transform: translateY(-2px); }
        .doc-page-btn:disabled { opacity: 0.5; cursor: not-allowed; color: var(--muted-foreground); }
        .doc-page-num { font-size: 14px; font-weight: 600; color: var(--muted-foreground); min-width: 80px; text-align: center; }

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
        <Header />

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
                exceptional care — every patient, every time.
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

        <div className="doc-divider">
          <div className="doc-divider-line" />
          <span className="doc-divider-label">Our Physicians</span>
          <div className="doc-divider-line" />
        </div>

        <div className="doc-search-bar">
          <div className="doc-search-inner">
            <svg className="doc-search-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, specialization or department..." />
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

        <section className="doc-grid-section">
          {loading && <PageLoader fullPage={false} size="md" bg='Transparent' message='Loading our specialists...'/>}

          {!loading && filtered.length === 0 && (
            <div className="doc-empty">
              <h3>No doctors found</h3>
              {search && (
                <button className="doc-empty-clear" onClick={() => setSearch('')}>Clear search</button>
              )}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <>
              <div className="doc-cards-grid">
                {filtered.map((doctor, i) => (
                  <DoctorCard key={doctor.id} doctor={doctor} index={i} />
                ))}
              </div>

              <div className="doc-pagination">
                <button className="doc-page-btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || loading}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <div className="doc-page-num">Page {page + 1}</div>
                <button className="doc-page-btn" onClick={() => setPage(p => p + 1)} disabled={!hasMore || loading}>
                  Next
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  )
}

export default Doctor
