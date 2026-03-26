import React, { useState, useEffect } from 'react';
import {
    Building2, Users, UserRound, ArrowRight,
    Search, Sparkles, Settings, Activity, Star
} from 'lucide-react';
import { doctorAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

/* ════════════════════════════════════════════════════════════════
   GLOBAL CSS
   ════════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

  .dd-root, .dd-root * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }

  @keyframes dd-drift1 {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(60px,-45px) scale(1.08); }
    66%      { transform: translate(-35px,30px) scale(0.95); }
  }
  @keyframes dd-drift2 {
    0%,100% { transform: translate(0,0) scale(1); }
    40%      { transform: translate(-55px,35px) scale(1.06); }
    70%      { transform: translate(45px,-28px) scale(0.97); }
  }
  @keyframes dd-drift3 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(30px,48px) scale(1.05); }
  }
  @keyframes dd-float {
    0%,100% { transform: translateY(0px) scale(1); }
    50%      { transform: translateY(-24px) scale(1.18); }
  }
  @keyframes dd-spin-slow { to { transform: rotate(360deg); } }
  @keyframes dd-spin-rev  { to { transform: rotate(-360deg); } }
  @keyframes dd-pulse-ring {
    0%,100% { transform: scale(1);    opacity: 1; }
    50%      { transform: scale(1.06); opacity: 0.5; }
  }
  @keyframes dd-fadeup {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dd-ping {
    0%    { transform: scale(1);   opacity: .8; }
    80%,100% { transform: scale(2.2); opacity: 0; }
  }

  .dd-fadeup   { animation: dd-fadeup .55s ease both; }
  .dd-fadeup-1 { animation-delay: .06s; }
  .dd-fadeup-2 { animation-delay: .14s; }
  .dd-fadeup-3 { animation-delay: .24s; }

  /* Card hover */
  .dd-card {
    transition: transform .45s cubic-bezier(.22,1,.36,1),
                box-shadow .45s cubic-bezier(.22,1,.36,1);
  }
  .dd-card:hover { transform: translateY(-12px); box-shadow: 0 28px 64px rgba(37,99,235,.15) !important; }
  .dd-card:hover .dd-shimmer { opacity: 1 !important; }
  .dd-card:hover .dd-icon-wrap { transform: rotate(8deg) scale(1.12) !important; }
  .dd-card:hover .dd-card-name { color: #2563eb !important; }
  .dd-card:hover .dd-stat-blue { background: rgba(219,234,254,.6) !important; border-color: #93c5fd !important; }
  .dd-card:hover .dd-stat-teal { background: rgba(204,251,241,.6) !important; border-color: #5eead4 !important; }

  /* Manage button */
  .dd-btn { transition: background .2s, box-shadow .2s, transform .1s; }
  .dd-btn:hover { background: linear-gradient(135deg,#1d4ed8,#4338ca) !important; box-shadow: 0 10px 28px rgba(37,99,235,.45) !important; }
  .dd-btn:active { transform: scale(.97) !important; }
  .dd-btn:hover .dd-gear { transform: rotate(90deg) !important; }
  .dd-btn:hover .dd-arrow { transform: translateX(5px) !important; }
  .dd-gear  { transition: transform .5s cubic-bezier(.22,1,.36,1); }
  .dd-arrow { transition: transform .3s; }

  /* Search focus */
  .dd-search:focus { outline: none; border-color: #60a5fa !important; box-shadow: 0 0 0 4px rgba(59,130,246,.12) !important; }

  /* Summary pill hover */
  .dd-pill { transition: transform .25s, box-shadow .25s; }
  .dd-pill:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,.08) !important; }
`;

/* ════════════════════════════════════════════════════════════════
   STABLE PARTICLES  (deterministic — no Math.random in render)
   ════════════════════════════════════════════════════════════════ */
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    size:     4 + (i * 3.7) % 7,
    left:     `${(i * 17 + 5) % 100}%`,
    top:      `${(i * 23 + 11) % 100}%`,
    duration: `${7 + (i * 1.3) % 7}s`,
    delay:    `${(i * 0.85) % 5}s`,
    opacity:  0.12 + (i * 0.037) % 0.28,
    color:    ['#93c5fd','#a5b4fc','#6ee7b7','#c4b5fd','#67e8f9'][i % 5],
}));

/* ════════════════════════════════════════════════════════════════
   TINY COMPONENTS
   ════════════════════════════════════════════════════════════════ */
const StatPill = ({ icon: Icon, label, value, variant }) => (
    <div
        className={variant === 'blue' ? 'dd-stat-blue' : 'dd-stat-teal'}
        style={{
            borderRadius: 16, padding: '14px 16px',
            border: `1.5px solid ${variant === 'blue' ? '#bfdbfe' : '#99f6e4'}`,
            background: variant === 'blue'
                ? 'rgba(239,246,255,.55)'
                : 'rgba(240,253,250,.55)',
            transition: 'background .3s, border-color .3s',
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7,
            fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: variant === 'blue' ? '#60a5fa' : '#2dd4bf' }}>
            <Icon size={13} />{label}
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{value}</div>
    </div>
);

const SummaryPill = ({ icon: Icon, label, value, bg, fg }) => (
    <div className="dd-pill" style={{ display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 18px', borderRadius: 18,
        background: 'rgba(255,255,255,.78)', backdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(255,255,255,.9)',
        boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: bg, color: fg,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={15} />
        </div>
        <div>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: '#94a3b8' }}>{label}</div>
            <div style={{ fontSize: 19, fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
        </div>
    </div>
);

const DeptCard = ({ dept, isHead, onManage }) => (
    <div className="dd-card" style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        background: 'rgba(255,255,255,.65)', backdropFilter: 'blur(24px)',
        borderRadius: 32, border: '1.5px solid rgba(255,255,255,.88)',
        boxShadow: '0 8px 32px rgba(0,0,0,.05)', overflow: 'hidden',
    }}>
        {/* shimmer top line */}
        <div className="dd-shimmer" style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg,transparent,#60a5fa 40%,#818cf8,transparent)',
            opacity: 0, transition: 'opacity .4s',
        }} />

        {/* Head badge */}
        {isHead && (
            <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 2 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'linear-gradient(135deg,#2563eb,#4f46e5)',
                    color: '#fff', fontSize: 9, fontWeight: 900,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    padding: '8px 18px', borderBottomLeftRadius: 24,
                    borderTopRightRadius: 30,
                    boxShadow: '0 4px 14px rgba(37,99,235,.38)',
                }}>
                    <Star size={9} fill="#fff" /> Head of Unit
                </div>
            </div>
        )}

        {/* inner hover glow */}
        <div style={{
            position: 'absolute', inset: 0, borderRadius: 32, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 30% 20%,rgba(99,102,241,.06),transparent 60%)',
        }} />

        <div style={{ padding: '32px 28px 20px', flex: 1, position: 'relative' }}>
            {/* icon */}
            <div className="dd-icon-wrap" style={{
                width: 56, height: 56, marginBottom: 22,
                background: 'linear-gradient(135deg,#2563eb,#4f46e5)',
                borderRadius: 20, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 26,
                boxShadow: '0 8px 24px rgba(37,99,235,.3)',
                transition: 'transform .5s cubic-bezier(.22,1,.36,1)',
            }}>
                {dept.icon || '🏥'}
            </div>

            <div className="dd-card-name" style={{
                fontSize: 20, fontWeight: 900, color: '#0f172a',
                marginBottom: 8, lineHeight: 1.25, transition: 'color .25s',
            }}>
                {dept.name}
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500, lineHeight: 1.65,
                marginBottom: 22, display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 42 }}>
                {dept.description || 'Providing specialized medical care with state-of-the-art facilities.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                <StatPill icon={UserRound} label="Doctors"  value={dept.memberCount  ?? 0} variant="blue" />
                <StatPill icon={Users}     label="Patients" value={dept.patientCount ?? 0} variant="teal" />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '9px 14px', borderRadius: 14,
                background: 'rgba(248,250,252,.9)', border: '1.5px solid #f1f5f9',
                fontSize: 12, fontWeight: 700, color: '#64748b' }}>
                <Building2 size={13} style={{ color: '#60a5fa' }} />
                Branch #{dept.branchId}
            </div>
        </div>

        <div style={{ padding: '0 28px 28px', position: 'relative' }}>
            {isHead ? (
                <button onClick={onManage} className="dd-btn" style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 10,
                    background: 'linear-gradient(135deg,#2563eb,#4f46e5)',
                    color: '#fff', fontWeight: 800, fontSize: 14,
                    padding: '14px 0', borderRadius: 18,
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: '0 6px 20px rgba(37,99,235,.3)',
                }}>
                    <Settings size={16} className="dd-gear" />
                    Manage Department
                    <ArrowRight size={16} className="dd-arrow" />
                </button>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 4px', fontSize: 10, fontWeight: 800,
                    letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
                            <span style={{
                                position: 'absolute', inset: 0, borderRadius: '50%',
                                background: '#10b981',
                                animation: 'dd-ping 1.4s ease-in-out infinite',
                            }} />
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                        </span>
                        Active Member
                    </div>
                    <div style={{ display: 'flex' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{
                                width: 26, height: 26, borderRadius: '50%',
                                background: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)',
                                border: '2px solid #fff', marginLeft: -8,
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: 10, color: '#64748b', fontWeight: 700,
                            }}>
                                {i === 3 ? '+' : <UserRound size={11} />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
);

/* ════════════════════════════════════════════════════════════════
   MAIN
   ════════════════════════════════════════════════════════════════ */
const DoctorDepartment = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [searchTerm, setSearchTerm]   = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        (async () => {
            try {
                const { data } = await doctorAPI.getMyDepartments();
                setDepartments(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = departments.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(145deg,#eef2ff,#f0f9ff,#f0fdf4)' }}>
            <style>{GLOBAL_CSS}</style>
            <div style={{ position: 'relative', width: 72, height: 72 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid #dbeafe' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%',
                    border: '4px solid transparent', borderTopColor: '#2563eb',
                    animation: 'dd-spin-slow .9s linear infinite' }} />
                <div style={{ position: 'absolute', inset: 10, borderRadius: '50%',
                    border: '4px solid transparent', borderTopColor: '#818cf8',
                    animation: 'dd-spin-rev 1.3s linear infinite' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={20} style={{ color: '#2563eb' }} />
                </div>
            </div>
        </div>
    );

    const totalDoctors  = departments.reduce((a, d) => a + (d.memberCount  || 0), 0);
    const totalPatients = departments.reduce((a, d) => a + (d.patientCount || 0), 0);
    const headCount     = departments.filter(d => d.headDoctorId === Number(user?.id)).length;

    return (
        <>
            <style>{GLOBAL_CSS}</style>

            {/* ══════════ ROOT ══════════ */}
            <div className="dd-root" style={{
                position: 'relative',
                minHeight: '100vh',
                background: 'linear-gradient(145deg,#eef2ff 0%,#f0f9ff 38%,#f0fdf4 72%,#faf5ff 100%)',
                paddingTop: 96,
                paddingBottom: 80,
                paddingLeft:  'clamp(16px,4vw,56px)',
                paddingRight: 'clamp(16px,4vw,56px)',
                overflow: 'hidden',
            }}>
                <Header />

                {/* ══════════ BACKGROUND LAYER ══════════ */}

                {/* 1. Dot grid */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                    pointerEvents: 'none', zIndex: 0 }}
                    xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="ddDots" width="38" height="38" patternUnits="userSpaceOnUse">
                            <circle cx="1.8" cy="1.8" r="1.8" fill="#c7d2fe" fillOpacity=".5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#ddDots)" />
                </svg>

                {/* 2. Big orb — top-right (blue/indigo) */}
                <div style={{
                    position: 'absolute', top: '-20%', right: '-14%', zIndex: 0,
                    width: 720, height: 720, borderRadius: '50%', pointerEvents: 'none',
                    background: 'radial-gradient(circle,rgba(99,102,241,.26) 0%,rgba(59,130,246,.10) 42%,transparent 68%)',
                    animation: 'dd-drift1 22s ease-in-out infinite',
                }} />

                {/* 3. Big orb — bottom-left (teal/emerald) */}
                <div style={{
                    position: 'absolute', bottom: '-18%', left: '-16%', zIndex: 0,
                    width: 780, height: 780, borderRadius: '50%', pointerEvents: 'none',
                    background: 'radial-gradient(circle,rgba(20,184,166,.22) 0%,rgba(16,185,129,.08) 42%,transparent 68%)',
                    animation: 'dd-drift2 27s ease-in-out infinite',
                }} />

                {/* 4. Mid orb — violet */}
                <div style={{
                    position: 'absolute', top: '36%', left: '26%', zIndex: 0,
                    width: 520, height: 520, borderRadius: '50%', pointerEvents: 'none',
                    background: 'radial-gradient(circle,rgba(139,92,246,.14) 0%,transparent 62%)',
                    animation: 'dd-drift3 17s ease-in-out infinite',
                }} />

                {/* 5. Small orb — top-left warm amber */}
                <div style={{
                    position: 'absolute', top: '6%', left: '8%', zIndex: 0,
                    width: 300, height: 300, borderRadius: '50%', pointerEvents: 'none',
                    background: 'radial-gradient(circle,rgba(251,191,36,.18) 0%,transparent 65%)',
                    animation: 'dd-drift1 19s ease-in-out infinite reverse',
                }} />

                {/* 6. Small orb — mid right cyan */}
                <div style={{
                    position: 'absolute', top: '55%', right: '5%', zIndex: 0,
                    width: 260, height: 260, borderRadius: '50%', pointerEvents: 'none',
                    background: 'radial-gradient(circle,rgba(6,182,212,.16) 0%,transparent 65%)',
                    animation: 'dd-drift2 14s ease-in-out infinite',
                }} />

                {/* 7. Dashed ring — top left */}
                <svg style={{
                    position: 'absolute', top: 48, left: 28, zIndex: 0,
                    pointerEvents: 'none',
                    animation: 'dd-pulse-ring 7s ease-in-out infinite',
                }} width="210" height="210" viewBox="0 0 210 210">
                    <circle cx="105" cy="105" r="96"  fill="none" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="7 7"  strokeOpacity=".4" />
                    <circle cx="105" cy="105" r="68"  fill="none" stroke="#60a5fa" strokeWidth="1"   strokeDasharray="4 10" strokeOpacity=".28" />
                    <circle cx="105" cy="105" r="38"  fill="none" stroke="#a78bfa" strokeWidth="1"   strokeDasharray="2 8"  strokeOpacity=".22" />
                </svg>

                {/* 8. Dashed ring — bottom right */}
                <svg style={{
                    position: 'absolute', bottom: 24, right: 18, zIndex: 0,
                    pointerEvents: 'none',
                    animation: 'dd-pulse-ring 9s ease-in-out infinite reverse',
                }} width="270" height="270" viewBox="0 0 270 270">
                    <circle cx="135" cy="135" r="124" fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="8 8"  strokeOpacity=".32" />
                    <circle cx="135" cy="135" r="88"  fill="none" stroke="#818cf8" strokeWidth="1"   strokeDasharray="4 10" strokeOpacity=".24" />
                    <circle cx="135" cy="135" r="52"  fill="none" stroke="#60a5fa" strokeWidth="1"   strokeDasharray="3 7"  strokeOpacity=".18" />
                </svg>

                {/* 9. Spinning dashed ring — mid right */}
                <svg style={{
                    position: 'absolute', top: '40%', right: '2%', zIndex: 0,
                    pointerEvents: 'none',
                    animation: 'dd-spin-slow 35s linear infinite', opacity: .22,
                }} width="140" height="140" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="65" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="12 6" />
                </svg>

                {/* 10. Spinning ring (reverse) — lower left */}
                <svg style={{
                    position: 'absolute', bottom: '18%', left: '4%', zIndex: 0,
                    pointerEvents: 'none',
                    animation: 'dd-spin-rev 28s linear infinite', opacity: .18,
                }} width="110" height="110" viewBox="0 0 110 110">
                    <circle cx="55" cy="55" r="50" fill="none" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="10 5" />
                </svg>

                {/* 11. Diagonal accent stripe — top */}
                <div style={{
                    position: 'absolute', top: 128, left: 0, width: '110%', height: 1.5,
                    background: 'linear-gradient(90deg,transparent 0%,rgba(99,102,241,.2) 35%,rgba(59,130,246,.24) 55%,transparent 100%)',
                    transform: 'rotate(-1.8deg)', zIndex: 0, pointerEvents: 'none',
                }} />

                {/* 12. Diagonal accent stripe — bottom */}
                <div style={{
                    position: 'absolute', bottom: 148, left: 0, width: '110%', height: 1,
                    background: 'linear-gradient(90deg,transparent 0%,rgba(20,184,166,.18) 40%,rgba(16,185,129,.2) 60%,transparent 100%)',
                    transform: 'rotate(1.5deg)', zIndex: 0, pointerEvents: 'none',
                }} />

                {/* 13. Floating particles */}
                {PARTICLES.map(p => (
                    <div key={p.id} style={{
                        position: 'absolute',
                        borderRadius: '50%',
                        width: p.size,
                        height: p.size,
                        left: p.left,
                        top: p.top,
                        background: p.color,
                        opacity: p.opacity,
                        pointerEvents: 'none',
                        zIndex: 0,
                        animation: `dd-float ${p.duration} ${p.delay} ease-in-out infinite`,
                    }} />
                ))}

                {/* 14. Top vignette fade */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 200,
                    background: 'linear-gradient(180deg,rgba(238,242,255,.55) 0%,transparent 100%)',
                    pointerEvents: 'none', zIndex: 0,
                }} />

                {/* ══════════ CONTENT (above bg) ══════════ */}
                <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>

                    {/* Header row */}
                    <div className="dd-fadeup dd-fadeup-1" style={{
                        display: 'flex', flexWrap: 'wrap',
                        alignItems: 'flex-end', justifyContent: 'space-between',
                        gap: 24, marginBottom: 48,
                    }}>
                        <div>
                            {/* label pill */}
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 7,
                                background: 'rgba(239,246,255,.92)', backdropFilter: 'blur(14px)',
                                border: '1.5px solid #bfdbfe', borderRadius: 999,
                                padding: '6px 14px', marginBottom: 16,
                                fontSize: 10, fontWeight: 900,
                                letterSpacing: '0.14em', textTransform: 'uppercase',
                                color: '#2563eb',
                            }}>
                                <Sparkles size={11} /> Doctor Dashboard
                            </div>

                            {/* title */}
                            <h1 style={{
                                fontSize: 'clamp(32px,5vw,54px)', fontWeight: 900,
                                color: '#0f172a', lineHeight: 1.08,
                                margin: '0 0 14px',
                            }}>
                                My{' '}
                                <span style={{ position: 'relative', display: 'inline-block' }}>
                                    <span style={{
                                        background: 'linear-gradient(135deg,#2563eb 0%,#6366f1 50%,#06b6d4 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}>Departments</span>
                                    <svg style={{ position: 'absolute', bottom: -7, left: 0, width: '100%' }}
                                        height="10" viewBox="0 0 220 10" preserveAspectRatio="none">
                                        <path d="M0 8 Q28 2 55 8 Q83 14 110 8 Q138 2 165 8 Q193 14 220 8"
                                            fill="none" stroke="url(#wg)" strokeWidth="3" strokeLinecap="round" />
                                        <defs>
                                            <linearGradient id="wg" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
                                                <stop offset="0%"   stopColor="#2563eb" />
                                                <stop offset="100%" stopColor="#06b6d4" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </span>
                            </h1>

                            <p style={{ fontSize: 15, color: '#64748b', fontWeight: 500,
                                lineHeight: 1.65, maxWidth: 480, margin: 0 }}>
                                Oversee your clinical assignments across hospital branches
                                and manage specialized care units.
                            </p>
                        </div>

                        {/* Search */}
                        <div style={{ position: 'relative', width: 'clamp(220px,28vw,300px)' }}>
                            <Search size={17} style={{
                                position: 'absolute', left: 16,
                                top: '50%', transform: 'translateY(-50%)',
                                color: '#94a3b8', pointerEvents: 'none',
                            }} />
                            <input
                                className="dd-search"
                                type="text"
                                placeholder="Search departments…"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%', paddingLeft: 46, paddingRight: 16,
                                    paddingTop: 14, paddingBottom: 14,
                                    background: 'rgba(255,255,255,.85)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1.5px solid rgba(255,255,255,.92)',
                                    borderRadius: 18, fontSize: 14, fontWeight: 500,
                                    color: '#1e293b', fontFamily: 'inherit',
                                    transition: 'border-color .2s',
                                }}
                            />
                        </div>
                    </div>

                    {/* Summary bar */}
                    {departments.length > 0 && (
                        <div className="dd-fadeup dd-fadeup-2"
                            style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 36 }}>
                            <SummaryPill icon={Building2} label="Departments"    value={departments.length} bg="#eff6ff" fg="#2563eb" />
                            <SummaryPill icon={UserRound} label="Total Doctors"  value={totalDoctors}        bg="#eef2ff" fg="#4f46e5" />
                            <SummaryPill icon={Users}     label="Total Patients" value={totalPatients}       bg="#f0fdfa" fg="#0d9488" />
                            <SummaryPill icon={Star}      label="Head Roles"     value={headCount}           bg="#fffbeb" fg="#d97706" />
                        </div>
                    )}

                    {/* Cards / Empty */}
                    {filtered.length === 0 ? (
                        <div className="dd-fadeup dd-fadeup-3" style={{
                            background: 'rgba(255,255,255,.68)', backdropFilter: 'blur(24px)',
                            borderRadius: 40, padding: '64px 32px', textAlign: 'center',
                            border: '1.5px solid rgba(255,255,255,.88)',
                            boxShadow: '0 20px 60px rgba(0,0,0,.05)',
                            maxWidth: 540, margin: '0 auto',
                        }}>
                            <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 28px' }}>
                                <div style={{ position: 'absolute', inset: 0, borderRadius: 24,
                                    background: 'linear-gradient(135deg,#dbeafe,#e0e7ff)',
                                    transform: 'rotate(7deg)' }} />
                                <div style={{ position: 'absolute', inset: 0, borderRadius: 24,
                                    background: '#fff', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center' }}>
                                    <Building2 size={38} style={{ color: '#2563eb' }} />
                                </div>
                            </div>
                            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '0 0 12px' }}>
                                No Department Found
                            </h2>
                            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.65,
                                maxWidth: 340, margin: '0 auto 28px' }}>
                                {searchTerm
                                    ? `No department matches "${searchTerm}". Try a different keyword.`
                                    : "You haven't been assigned to any department yet."}
                            </p>
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} style={{
                                    padding: '12px 28px', background: '#0f172a', color: '#fff',
                                    fontWeight: 800, fontSize: 14, borderRadius: 16,
                                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                                }}>
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="dd-fadeup dd-fadeup-3" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))',
                            gap: 28,
                        }}>
                            {filtered.map((dept, i) => (
                                <div key={dept.id} style={{
                                    animation: `dd-fadeup .55s ${0.26 + i * 0.08}s ease both`,
                                }}>
                                    <DeptCard
                                        dept={dept}
                                        isHead={dept.headDoctorId === Number(user?.id)}
                                        onManage={() => navigate('/doctor/department-head')}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DoctorDepartment;