import React, { useState, useEffect } from 'react';
import {
    Building2, Users, UserRound, ArrowRight,
    Search, Sparkles, Settings, Star, ArrowLeft
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import GenericDepartment from '../components/GenericDepartment';
import PageLoader from '../components/PageLoader';
import { doctorAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

/* ════════════════════════════════════════════════════════════════
   GLOBAL CSS
   ════════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  .dd-root, .dd-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }

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
  .dd-card:hover { transform: translateY(-12px); box-shadow: 0 28px 64px color-mix(in srgb, var(--primary) 15%, transparent) !important; border-color: var(--primary) !important; }
  .dd-card:hover .dd-shimmer { opacity: 1 !important; }
  .dd-card:hover .dd-icon-wrap { transform: rotate(8deg) scale(1.12) !important; background: var(--primary) !important; color: #fff !important; }
  .dd-card:hover .dd-card-name { color: var(--primary) !important; }
  
  .dd-card:hover .dd-stat-blue { background: var(--secondary) !important; border-color: var(--primary) !important; }
  .dd-card:hover .dd-stat-teal { background: var(--secondary) !important; border-color: var(--primary) !important; }

  /* Manage button */
  .dd-btn { transition: background .2s, box-shadow .2s, transform .1s; }
  .dd-btn:hover { background: var(--primary) !important; opacity: 0.9; box-shadow: 0 10px 28px color-mix(in srgb, var(--primary) 40%, transparent) !important; }
  .dd-btn:active { transform: scale(.97) !important; }
  .dd-btn:hover .dd-gear { transform: rotate(90deg) !important; }
  .dd-btn:hover .dd-arrow { transform: translateX(5px) !important; }
  .dd-gear  { transition: transform .5s cubic-bezier(.22,1,.36,1); }
  .dd-arrow { transition: transform .3s; }

  /* Search focus */
  .dd-search:focus { outline: none; border-color: var(--primary) !important; box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 12%, transparent) !important; }

  /* Summary pill hover */
  .dd-pill { transition: transform .25s, box-shadow .25s; }
  .dd-pill:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,.08) !important; border-color: var(--primary) !important; }
`;

/* ════════════════════════════════════════════════════════════════
   STABLE PARTICLES
   ════════════════════════════════════════════════════════════════ */
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    size:     4 + (i * 3.7) % 7,
    left:     `${(i * 17 + 5) % 100}%`,
    top:      `${(i * 23 + 11) % 100}%`,
    duration: `${7 + (i * 1.3) % 7}s`,
    delay:    `${(i * 0.85) % 5}s`,
    opacity:  0.08 + (i * 0.037) % 0.15,
    color:    ['var(--primary)','var(--chart-5)','var(--chart-2)','var(--ring)','var(--chart-4)'][i % 5],
}));

const CardShimmer = () => (
    <div className="dd-shimmer absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-[100%] animate-[dd-shimmer_2s_infinite]" />
        <style>{` @keyframes dd-shimmer { 100% { transform: translateX(100%); } } `}</style>
    </div>
);

const DoctorDepartment = () => {
    const { departmentId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const res = await doctorAPI.getMyDepartments();
                setDepartments(res.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDepts();
    }, []);

    const filtered = departments.filter(d =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.description?.toLowerCase().includes(query.toLowerCase())
    );

    if (loading) return <PageLoader message="Initializing clinical dashboard..." />;

    return (
        <div className="dd-root min-h-screen bg-[var(--background)] overflow-hidden relative selection:bg-[var(--primary)] selection:text-white">
            <style>{GLOBAL_CSS}</style>
            <Header />

            {/* ── Background Elements ── */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-[var(--primary)]/5 blur-[120px] rounded-full animate-[dd-drift1_25s_infinite_alternate]" />
                <div className="absolute -bottom-[10%] -left-[10%] w-[55%] h-[55%] bg-[var(--chart-5)]/5 blur-[120px] rounded-full animate-[dd-drift2_30s_infinite_alternate]" />
                <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-[var(--chart-2)]/5 blur-[110px] rounded-full animate-[dd-drift3_22s_infinite_alternate]" />

                {/* Grid */}
                <div className="absolute inset-0"
                    style={{ backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`, backgroundSize: '48px 48px', opacity: 0.2 }} />

                {/* Floating Particles */}
                {PARTICLES.map(p => (
                    <div key={p.id} className="absolute rounded-full"
                        style={{
                            width: p.size, height: p.size, left: p.left, top: p.top,
                            background: p.color, opacity: p.opacity,
                            animation: `dd-drift${(p.id % 3) + 1} ${p.duration} ${p.delay} infinite alternate ease-in-out`
                        }} />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10">

                {/* ── Header Section ── */}
                <div className="mb-20 text-center">
                    <div className="dd-fadeup dd-fadeup-1 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-sm mb-6">
                        <Sparkles size={16} className="text-[var(--primary)]" />
                        <span className="text-[var(--primary)] font-bold text-xs uppercase tracking-[0.2em]">Clinical Operations</span>
                    </div>
                    <h1 className="dd-fadeup dd-fadeup-2 text-5xl md:text-7xl font-black text-[var(--foreground)] tracking-tight mb-8">
                        My <span className="text-[var(--primary)]">Departments</span>
                    </h1>
                    <p className="dd-fadeup dd-fadeup-3 text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
                        Centrally manage your clinical jurisdictions, specialized teams, and administrative protocols.
                    </p>
                </div>

                {/* ── Search & Summary ── */}
                <div className="dd-fadeup dd-fadeup-3 flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
                    <div className="relative w-full md:w-[480px] group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors">
                            <Search size={22} />
                        </div>
                        <input
                            type="text"
                            placeholder="Filter your departments by name or description..."
                            className="dd-search w-full pl-14 pr-6 py-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-base font-semibold shadow-xl shadow-black/[0.03] transition-all"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4 scroll-hide overflow-x-auto w-full md:w-auto pb-2">
                        {[
                            { label: 'Jurisdictions', count: departments.length, icon: Building2 },
                            { label: 'Active Personnel', count: departments.reduce((acc, d) => acc + (d.doctorCount || 0), 0), icon: Users }
                        ].map((s, idx) => (
                            <div key={idx} className="dd-pill flex items-center gap-3 px-6 py-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm whitespace-nowrap">
                                <div className="p-2 rounded-xl bg-[var(--secondary)] text-[var(--primary)]">
                                    <s.icon size={20} />
                                </div>
                                <div>
                                    <div className="text-[var(--muted-foreground)] text-[10px] font-black uppercase tracking-widest leading-none mb-1">{s.label}</div>
                                    <div className="text-[var(--foreground)] text-lg font-black leading-none">{s.count}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Grid or Detail ── */}
                {departmentId ? (() => {
                    const selected = departments.find(d => String(d.id) === String(departmentId));
                    if (!selected) return (
                        <div className="dd-fadeup text-center py-32 rounded-[2.5rem] bg-[var(--card)] border border-dashed border-[var(--border)]">
                            <h3 className="text-2xl font-black text-[var(--foreground)] mb-2">Department not found</h3>
                            <button onClick={() => navigate('/doctor/my-department')} className="mt-4 text-[var(--primary)] font-bold">Back to List</button>
                        </div>
                    );
                    return (
                        <div className="dd-fadeup bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-2xl relative">
                            <button 
                                onClick={() => navigate('/doctor/my-department')}
                                className="absolute top-8 left-8 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl bg-[var(--background)]/60 backdrop-blur-xl border border-[var(--border)] text-[var(--foreground)] text-xs font-black uppercase tracking-widest hover:bg-[var(--primary)] hover:text-white transition-all shadow-xl active:scale-95 group">
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                                Return to Overview
                            </button>
                            <div className="min-h-[85vh] h-[85vh]">
                                <GenericDepartment 
                                    name={selected.name}
                                    icon={<Building2 size={32} />}
                                    description={selected.description}
                                    members={selected.doctorCount}
                                    headDoctor={selected.headDoctorName}
                                    accent={selected.accentColor || 'var(--primary)'}
                                    bg={selected.bgColor || 'var(--secondary)'}
                                    imageUrl={selected.imageUrl}
                                    sectionsJson={selected.sectionsJson}
                                />
                            </div>
                        </div>
                    );
                })() : filtered.length === 0 ? (
                    <div className="dd-fadeup text-center py-32 rounded-[2.5rem] bg-[var(--card)] border border-dashed border-[var(--border)]">
                        <div className="w-20 h-20 bg-[var(--secondary)] rounded-3xl flex items-center justify-center mx-auto mb-6 text-[var(--primary)]">
                            <Building2 size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-[var(--foreground)] mb-2">No matching units found</h3>
                        <p className="text-[var(--muted-foreground)]">Try adjusting your search filters above.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map((dept, idx) => {
                            const isHead = dept.headDoctorId === user?.id;

                            return (
                                <div key={dept.id}
                                    className={`dd-fadeup dd-fadeup-${(idx % 3) + 1} dd-card group relative bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] p-8 shadow-2xl shadow-black/[0.04] overflow-hidden`}>

                                    <CardShimmer />

                                    {/* Accent Ring */}
                                    <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full border-[28px] transition-all duration-700 opacity-[0.03] group-hover:opacity-[0.06] group-hover:scale-110 ${isHead ? 'border-[var(--primary)]' : 'border-[var(--chart-5)]'}`} />

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-10">
                                            <div className="dd-icon-wrap w-20 h-20 rounded-3xl bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center shadow-lg shadow-black/[0.05] transition-all duration-500">
                                                <Building2 size={36} strokeWidth={1.5} />
                                            </div>
                                            {isHead && (
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 animate-pulse">
                                                    <Star size={12} fill="currentColor" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Admin</span>
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="dd-card-name text-3xl font-black text-[var(--foreground)] mb-4 transition-colors">
                                            {dept.name}
                                        </h3>
                                        <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mb-10 line-clamp-3 font-medium">
                                            {dept.description || 'Specialized clinical jurisdiction covering advanced medical protocols and patient care.'}
                                        </p>

                                        <div className="flex gap-4 mb-10">
                                            <div className="dd-stat-blue flex-1 p-4 rounded-3xl bg-[var(--sidebar)] border border-[var(--sidebar-border)] transition-all">
                                                <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
                                                    <Users size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Personnel</span>
                                                </div>
                                                <div className="text-[var(--foreground)] text-lg font-black">{dept.doctorCount || 0}</div>
                                            </div>
                                            <div className="dd-stat-teal flex-1 p-4 rounded-3xl bg-[var(--sidebar)] border border-[var(--sidebar-border)] transition-all">
                                                <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
                                                    <UserRound size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Head</span>
                                                </div>
                                                <div className="text-[var(--foreground)] text-lg font-black truncate">
                                                    {isHead ? 'You' : (dept.headDoctorName?.split(' ')[1] || 'Pending')}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate(isHead ? `/department/${dept.id}/control` : `/department/${dept.id}`)}
                                            className="dd-btn w-full py-5 rounded-[1.25rem] bg-[var(--primary)] text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-black/[0.1]">
                                            {isHead ? (
                                                <>
                                                    <Settings className="dd-gear" size={18} />
                                                    Administer Unit
                                                </>
                                            ) : (
                                                <>
                                                    View Details
                                                    <ArrowRight className="dd-arrow" size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Bottom Section ── */}
            <div className="relative border-t border-[var(--border)] bg-[var(--sidebar)] py-12">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[var(--muted-foreground)] text-sm font-medium">
                        Need assistance with department access? Contact the <span className="text-[var(--primary)] font-bold">Systems Admin</span>.
                    </p>
                    <div className="flex items-center gap-8">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-4 border-[var(--card)] bg-[var(--secondary)] flex items-center justify-center text-[var(--primary)] font-black text-[10px]">
                                    DR
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-4 border-[var(--card)] bg-[var(--primary)] flex items-center justify-center text-white font-black text-[10px]">
                                +{departments.length}
                            </div>
                        </div>
                        <span className="text-[var(--foreground)] text-xs font-black uppercase tracking-widest">Active Units</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDepartment;