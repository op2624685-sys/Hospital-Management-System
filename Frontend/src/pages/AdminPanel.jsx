import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import API from "../api/api";
import { gsap } from "gsap";

// ── Mock fallback data (replace with real API calls) ──────────────────────────
const MOCK = {
  stats: {
    totalDoctors: 48,
    activeDoctors: 41,
    totalPatients: 12480,
    todayAppointments: 134,
    pendingAppointments: 57,
    completedAppointments: 3920,
    totalRevenue: 2847500,
    todayRevenue: 48200,
  },
  recentAppointments: [
    { id: "APT-001", patient: "Rahul Sharma",   doctor: "Dr. Mehta",   dept: "Cardiology",  time: "09:00 AM", status: "Completed", amount: 1200 },
    { id: "APT-002", patient: "Priya Singh",    doctor: "Dr. Kapoor",  dept: "Neurology",   time: "09:30 AM", status: "In Progress",amount: 1500 },
    { id: "APT-003", patient: "Amit Verma",     doctor: "Dr. Sharma",  dept: "Orthopedics", time: "10:00 AM", status: "Pending",    amount: 900  },
    { id: "APT-004", patient: "Sunita Patel",   doctor: "Dr. Gupta",   dept: "Pediatrics",  time: "10:30 AM", status: "Completed",  amount: 800  },
    { id: "APT-005", patient: "Vikram Joshi",   doctor: "Dr. Reddy",   dept: "Dermatology", time: "11:00 AM", status: "Cancelled",  amount: 700  },
    { id: "APT-006", patient: "Neha Agarwal",   doctor: "Dr. Mehta",   dept: "Cardiology",  time: "11:30 AM", status: "Pending",    amount: 1200 },
  ],
  activeDoctors: [
    { id: 1, name: "Dr. Arjun Mehta",    speciality: "Cardiology",   patients: 12, status: "Active",   avatar: "AM" },
    { id: 2, name: "Dr. Priya Kapoor",   speciality: "Neurology",    patients: 8,  status: "Active",   avatar: "PK" },
    { id: 3, name: "Dr. Ravi Sharma",    speciality: "Orthopedics",  patients: 10, status: "On Leave", avatar: "RS" },
    { id: 4, name: "Dr. Sneha Gupta",    speciality: "Pediatrics",   patients: 15, status: "Active",   avatar: "SG" },
    { id: 5, name: "Dr. Kiran Reddy",    speciality: "Dermatology",  patients: 6,  status: "Active",   avatar: "KR" },
  ],
  payments: [
    { id: "PAY-001", patient: "Rahul Sharma",  amount: 1200, method: "UPI",       status: "Success", date: "Today, 09:05 AM" },
    { id: "PAY-002", patient: "Priya Singh",   amount: 1500, method: "Card",      status: "Success", date: "Today, 09:35 AM" },
    { id: "PAY-003", patient: "Sunita Patel",  amount: 800,  method: "Cash",      status: "Success", date: "Today, 10:35 AM" },
    { id: "PAY-004", patient: "Vikram Joshi",  amount: 700,  method: "UPI",       status: "Refunded",date: "Today, 11:05 AM" },
    { id: "PAY-005", patient: "Neha Agarwal",  amount: 1200, method: "Net Banking",status: "Pending", date: "Today, 11:35 AM" },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => n >= 100000
  ? `₹${(n / 100000).toFixed(1)}L`
  : n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`;

const statusColor = {
  Completed:    { bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
  "In Progress":{ bg: "#fff8f4", color: "#e42320", dot: "#e42320" },
  Pending:      { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
  Cancelled:    { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  Success:      { bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
  Refunded:     { bg: "#f5f3ff", color: "#7c3aed", dot: "#8b5cf6" },
};

const deptColor = {
  Cardiology:   "#e42320",
  Neurology:    "#7c3aed",
  Orthopedics:  "#0891b2",
  Pediatrics:   "#d97706",
  Dermatology:  "#db2777",
  default:      "#059669",
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, accent, delay }) => {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: .55, delay, ease: "power3.out" }
    );
  }, [delay]);

  return (
    <div ref={ref} className="admin-stat-card" style={{ "--accent": accent }}>
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-body">
        <span className="admin-stat-label">{label}</span>
        <span className="admin-stat-value">{value}</span>
        {sub && <span className="admin-stat-sub">{sub}</span>}
      </div>
      <div className="admin-stat-glow" />
    </div>
  );
};

// ── Section Card ─────────────────────────────────────────────────────────────
const Section = ({ title, subtitle, children, action }) => (
  <div className="admin-section">
    <div className="admin-section-header">
      <div>
        <h3 className="admin-section-title">{title}</h3>
        {subtitle && <p className="admin-section-sub">{subtitle}</p>}
      </div>
      {action && <button className="admin-view-all">{action}</button>}
    </div>
    {children}
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const AdminPanel = () => {
  const [stats, setStats] = useState(MOCK.stats);
  const [appointments, setAppointments] = useState(MOCK.recentAppointments);
  const [doctors, setDoctors] = useState(MOCK.activeDoctors);
  const [payments, setPayments] = useState(MOCK.payments);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: .6, ease: "power3.out" }
    );

    // Replace mocks with real API calls:
    // API.get('/admin/stats').then(r => setStats(r.data))
    // API.get('/admin/appointments/recent').then(r => setAppointments(r.data))
    // API.get('/admin/doctors/active').then(r => setDoctors(r.data))
    // API.get('/admin/payments/recent').then(r => setPayments(r.data))
  }, []);

  const tabs = ["overview", "appointments", "doctors", "payments"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .admin-page {
          min-height: 100vh;
          background: #f9f6f2;
          font-family: 'Outfit', sans-serif;
          overflow-x: hidden;
        }

        /* ambient */
        .admin-ambient { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .admin-orb {
          position: absolute; border-radius: 50%; filter: blur(100px);
        }
        .admin-orb-1 {
          width: 500px; height: 500px; top: -200px; right: -100px;
          background: radial-gradient(circle, rgba(228,35,32,.12), transparent);
          animation: adO 16s ease-in-out infinite;
        }
        .admin-orb-2 {
          width: 400px; height: 400px; bottom: -150px; left: -100px;
          background: radial-gradient(circle, rgba(245,158,11,.10), transparent);
          animation: adO 20s ease-in-out infinite reverse;
        }
        @keyframes adO { 0%,100%{transform:translate(0,0)} 50%{transform:translate(25px,-35px)} }
        .admin-grid-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,.03) 1px, transparent 1px);
          background-size: 52px 52px;
        }

        /* container */
        .admin-container {
          position: relative; z-index: 1;
          max-width: 1440px; margin: 0 auto;
          padding: 32px 48px 80px;
        }

        /* top bar */
        .admin-topbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 36px;
        }
        .admin-topbar-left {}
        .admin-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase;
          color: #e42320; background: rgba(228,35,32,.08);
          border: 1px solid rgba(228,35,32,.18);
          padding: 4px 14px; border-radius: 999px; margin-bottom: 10px;
        }
        .admin-live { width: 7px; height: 7px; background: #22c55e; border-radius: 50%; position: relative; }
        .admin-live::after {
          content: ''; position: absolute; inset: -2px; border-radius: 50%;
          background: #22c55e40; animation: livP 1.8s ease-in-out infinite;
        }
        @keyframes livP { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.9);opacity:0} }
        .admin-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.8rem; font-weight: 700; color: #1a1a1a; line-height: 1; margin: 0;
        }
        .admin-title em { font-style: italic; color: #e42320; }
        .admin-date {
          font-size: 13px; color: #aaa; margin-top: 6px;
        }
        .admin-topbar-right { display: flex; align-items: center; gap: 12px; }
        .admin-badge {
          display: flex; align-items: center; gap: 8px;
          background: #fff; border: 1.5px solid #ebe8e2;
          border-radius: 14px; padding: 10px 18px;
          font-size: 13px; font-weight: 600; color: #1a1a1a;
          box-shadow: 0 2px 12px rgba(0,0,0,.05);
        }
        .admin-badge svg { color: #e42320; }
        .admin-refresh-btn {
          display: flex; align-items: center; gap: 7px;
          background: #1a1a1a; color: #fff;
          border: none; border-radius: 12px; padding: 10px 18px;
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: background .2s, transform .15s;
        }
        .admin-refresh-btn:hover { background: #333; transform: translateY(-1px); }

        /* tabs */
        .admin-tabs {
          display: flex; gap: 4px;
          background: #fff; border: 1.5px solid #ebe8e2;
          border-radius: 16px; padding: 6px;
          width: fit-content; margin-bottom: 32px;
          box-shadow: 0 2px 12px rgba(0,0,0,.04);
        }
        .admin-tab {
          padding: 9px 22px; border-radius: 11px;
          font-size: 13px; font-weight: 600;
          border: none; background: transparent; cursor: pointer;
          color: #aaa; transition: all .2s;
          text-transform: capitalize; letter-spacing: .02em;
        }
        .admin-tab.active {
          background: #1a1a1a; color: #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,.15);
        }
        .admin-tab:not(.active):hover { color: #555; background: #f5f0ea; }

        /* stat cards */
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px; margin-bottom: 28px;
        }
        .admin-stat-card {
          position: relative; overflow: hidden;
          background: #fff; border: 1.5px solid #ebe8e2;
          border-radius: 20px; padding: 22px;
          display: flex; align-items: flex-start; gap: 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,.05);
          transition: transform .25s, box-shadow .25s, border-color .25s;
          opacity: 0;
        }
        .admin-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,.09);
          border-color: var(--accent);
        }
        .admin-stat-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: color-mix(in srgb, var(--accent) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 1.3rem;
        }
        .admin-stat-body { display: flex; flex-direction: column; gap: 3px; flex: 1; }
        .admin-stat-label { font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #bbb; }
        .admin-stat-value { font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; font-weight: 700; color: #1a1a1a; line-height: 1; }
        .admin-stat-sub { font-size: 12px; color: #aaa; }
        .admin-stat-glow {
          position: absolute; bottom: -20px; right: -20px;
          width: 80px; height: 80px; border-radius: 50%;
          background: radial-gradient(circle, color-mix(in srgb, var(--accent) 20%, transparent), transparent);
          pointer-events: none;
        }

        /* sections grid */
        .admin-sections-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px; margin-bottom: 20px;
        }
        .admin-section {
          background: #fff; border: 1.5px solid #ebe8e2;
          border-radius: 22px; padding: 28px;
          box-shadow: 0 4px 16px rgba(0,0,0,.05);
          animation: secIn .5s ease both;
        }
        @keyframes secIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .admin-section.full { grid-column: 1 / -1; }
        .admin-section-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 20px;
        }
        .admin-section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.35rem; font-weight: 700; color: #1a1a1a; margin: 0 0 3px;
        }
        .admin-section-sub { font-size: 12px; color: #bbb; }
        .admin-view-all {
          font-size: 12px; font-weight: 600; color: #e42320;
          background: rgba(228,35,32,.08); border: 1px solid rgba(228,35,32,.18);
          padding: 5px 14px; border-radius: 999px; cursor: pointer;
          transition: background .2s; border: none;
        }
        .admin-view-all:hover { background: rgba(228,35,32,.14); }

        /* appointments table */
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th {
          text-align: left; font-size: 10px; font-weight: 700;
          letter-spacing: .12em; text-transform: uppercase; color: #ccc;
          padding: 0 12px 12px; border-bottom: 1px solid #f0ece6;
        }
        .admin-table td {
          padding: 12px; font-size: 13px; color: #444;
          border-bottom: 1px solid #f9f6f2;
          vertical-align: middle;
        }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: #faf8f5; }
        .admin-apt-id { font-family: monospace; font-size: 11px; color: #bbb; }
        .admin-patient-name { font-weight: 600; color: #1a1a1a; }
        .admin-status-pill {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600;
          padding: 4px 10px; border-radius: 999px;
        }
        .admin-status-dot { width: 6px; height: 6px; border-radius: 50%; }
        .admin-dept-tag {
          font-size: 11px; font-weight: 600;
          padding: 3px 10px; border-radius: 999px;
          background: rgba(0,0,0,.04); color: #666;
        }
        .admin-amount { font-weight: 600; color: #1a1a1a; }

        /* doctor list */
        .admin-doctor-list { display: flex; flex-direction: column; gap: 10px; }
        .admin-doctor-row {
          display: flex; align-items: center; gap: 14px;
          padding: 12px; border-radius: 14px;
          border: 1px solid #f5f0ea;
          transition: background .15s, transform .2s;
        }
        .admin-doctor-row:hover { background: #faf8f5; transform: translateX(4px); }
        .admin-doc-avatar {
          width: 42px; height: 42px; border-radius: 50%;
          background: linear-gradient(135deg, #e42320, #a01a18);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: .9rem; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .admin-doc-info { flex: 1; }
        .admin-doc-name { font-size: 13px; font-weight: 600; color: #1a1a1a; }
        .admin-doc-spec { font-size: 11px; color: #aaa; }
        .admin-doc-meta { display: flex; align-items: center; gap: 10px; }
        .admin-doc-pts { font-size: 12px; font-weight: 600; color: #555; }
        .admin-doc-status {
          font-size: 11px; font-weight: 600; padding: 3px 10px;
          border-radius: 999px;
        }
        .admin-doc-status.active   { background: #f0fdf4; color: #16a34a; }
        .admin-doc-status.leave    { background: #fffbeb; color: #d97706; }

        /* payment list */
        .admin-payment-list { display: flex; flex-direction: column; gap: 10px; }
        .admin-payment-row {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 14px; border-radius: 14px;
          border: 1px solid #f5f0ea;
          transition: background .15s;
        }
        .admin-payment-row:hover { background: #faf8f5; }
        .admin-pay-icon {
          width: 38px; height: 38px; border-radius: 12px;
          background: #f5f0ea;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; flex-shrink: 0;
        }
        .admin-pay-info { flex: 1; }
        .admin-pay-patient { font-size: 13px; font-weight: 600; color: #1a1a1a; }
        .admin-pay-meta { font-size: 11px; color: #aaa; }
        .admin-pay-right { text-align: right; }
        .admin-pay-amount { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 700; color: #1a1a1a; }
        .admin-pay-method { font-size: 11px; color: #bbb; }

        /* overview bar chart placeholder */
        .admin-chart-bars {
          display: flex; align-items: flex-end; gap: 8px;
          height: 120px; padding-top: 12px;
        }
        .admin-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .admin-bar {
          width: 100%; border-radius: 6px 6px 0 0;
          background: linear-gradient(to top, #e42320, #ff6b6b);
          transition: height .6s cubic-bezier(.34,1.56,.64,1);
        }
        .admin-bar.secondary { background: linear-gradient(to top, #1a1a1a, #555); }
        .admin-bar-label { font-size: 10px; color: #bbb; letter-spacing: .05em; }

        /* progress bar */
        .admin-progress-wrap { display: flex; flex-direction: column; gap: 10px; }
        .admin-progress-row { display: flex; flex-direction: column; gap: 5px; }
        .admin-progress-head { display: flex; justify-content: space-between; align-items: center; }
        .admin-progress-label { font-size: 12px; font-weight: 600; color: #555; }
        .admin-progress-val { font-size: 12px; font-weight: 700; color: #1a1a1a; }
        .admin-progress-track {
          height: 6px; background: #f0ece6; border-radius: 999px; overflow: hidden;
        }
        .admin-progress-fill {
          height: 100%; border-radius: 999px;
          transition: width 1s cubic-bezier(.34,1.56,.64,1);
        }

        /* scrollbar */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #f0f0f0; }
        ::-webkit-scrollbar-thumb { background: #e42320; border-radius: 3px; }

        @media (max-width: 1200px) {
          .admin-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .admin-sections-grid { grid-template-columns: 1fr; }
          .admin-container { padding: 24px 24px 60px; }
        }
        @media (max-width: 640px) {
          .admin-stats-grid { grid-template-columns: 1fr; }
          .admin-title { font-size: 2rem; }
        }
      `}</style>

      <div className="admin-page">
        <div className="admin-ambient">
          <div className="admin-orb admin-orb-1" />
          <div className="admin-orb admin-orb-2" />
        </div>
        <div className="admin-grid-bg" />

        <Header />

        <div className="admin-container" ref={headerRef} style={{ opacity: 0 }}>

          {/* ── Top Bar ── */}
          <div className="admin-topbar">
            <div className="admin-topbar-left">
              <div className="admin-eyebrow">
                <div className="admin-live" />
                HMS Hospital · Admin Panel
              </div>
              <h1 className="admin-title">
                Control <em>Centre</em>
              </h1>
              <p className="admin-date">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="admin-topbar-right">
              <div className="admin-badge">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Administrator
              </div>
              <button className="admin-refresh-btn" onClick={() => window.location.reload()}>
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="admin-tabs">
            {tabs.map(t => (
              <button key={t} className={`admin-tab ${activeTab === t ? "active" : ""}`}
                onClick={() => setActiveTab(t)}>
                {t}
              </button>
            ))}
          </div>

          {/* ── Stats Grid ── */}
          <div className="admin-stats-grid">
            <StatCard delay={0}    label="Total Doctors"         value={stats.totalDoctors}          sub={`${stats.activeDoctors} active now`}             icon="👨‍⚕️" accent="#e42320" />
            <StatCard delay={0.08} label="Total Patients"        value={stats.totalPatients.toLocaleString()} sub="Registered patients"                   icon="🏥"   accent="#059669" />
            <StatCard delay={0.16} label="Today's Appointments"  value={stats.todayAppointments}     sub={`${stats.pendingAppointments} pending`}           icon="📅"   accent="#d97706" />
            <StatCard delay={0.24} label="Total Revenue"         value={fmt(stats.totalRevenue)}     sub={`${fmt(stats.todayRevenue)} today`}               icon="💰"   accent="#7c3aed" />
          </div>

          <div className="admin-stats-grid">
            <StatCard delay={0.30} label="Completed Appointments" value={stats.completedAppointments.toLocaleString()} sub="All time"       icon="✅"   accent="#22c55e" />
            <StatCard delay={0.36} label="Pending Appointments"   value={stats.pendingAppointments}                     sub="Require action" icon="⏳"   accent="#f59e0b" />
            <StatCard delay={0.42} label="Active Doctors"         value={stats.activeDoctors}                           sub="On duty today"  icon="🩺"   accent="#0891b2" />
            <StatCard delay={0.48} label="Today's Revenue"        value={fmt(stats.todayRevenue)}                       sub="Live earnings"  icon="📈"   accent="#db2777" />
          </div>

          {/* ── Sections ── */}
          <div className="admin-sections-grid">

            {/* Recent Appointments */}
            <div className="admin-section full">
              <Section title="Recent Appointments" subtitle="Today's appointment activity" action="View All">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Patient</th><th>Doctor</th><th>Department</th>
                      <th>Time</th><th>Status</th><th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(apt => {
                      const s = statusColor[apt.status] || statusColor.Pending;
                      return (
                        <tr key={apt.id}>
                          <td><span className="admin-apt-id">{apt.id}</span></td>
                          <td><span className="admin-patient-name">{apt.patient}</span></td>
                          <td>{apt.doctor}</td>
                          <td>
                            <span className="admin-dept-tag"
                              style={{ color: deptColor[apt.dept] || deptColor.default }}>
                              {apt.dept}
                            </span>
                          </td>
                          <td>{apt.time}</td>
                          <td>
                            <span className="admin-status-pill"
                              style={{ background: s.bg, color: s.color }}>
                              <span className="admin-status-dot" style={{ background: s.dot }} />
                              {apt.status}
                            </span>
                          </td>
                          <td><span className="admin-amount">₹{apt.amount}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Section>
            </div>

            {/* Active Doctors */}
            <div className="admin-section">
              <Section title="Active Doctors" subtitle="Currently on duty" action="Manage">
                <div className="admin-doctor-list">
                  {doctors.map(doc => (
                    <div key={doc.id} className="admin-doctor-row">
                      <div className="admin-doc-avatar"
                        style={{ background: `linear-gradient(135deg, ${deptColor[doc.speciality] || deptColor.default}, #1a1a1a)` }}>
                        {doc.avatar}
                      </div>
                      <div className="admin-doc-info">
                        <div className="admin-doc-name">{doc.name}</div>
                        <div className="admin-doc-spec">{doc.speciality}</div>
                      </div>
                      <div className="admin-doc-meta">
                        <span className="admin-doc-pts">{doc.patients} pts</span>
                        <span className={`admin-doc-status ${doc.status === "Active" ? "active" : "leave"}`}>
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* Payments */}
            <div className="admin-section">
              <Section title="Recent Payments" subtitle="Today's transactions" action="View All">
                <div className="admin-payment-list">
                  {payments.map(pay => {
                    const s = statusColor[pay.status] || statusColor.Pending;
                    return (
                      <div key={pay.id} className="admin-payment-row">
                        <div className="admin-pay-icon">
                          {pay.method === "UPI" ? "📱" : pay.method === "Card" ? "💳" : pay.method === "Cash" ? "💵" : "🏦"}
                        </div>
                        <div className="admin-pay-info">
                          <div className="admin-pay-patient">{pay.patient}</div>
                          <div className="admin-pay-meta">{pay.date} · {pay.method}</div>
                        </div>
                        <div className="admin-pay-right">
                          <div className="admin-pay-amount">₹{pay.amount}</div>
                          <span className="admin-status-pill"
                            style={{ background: s.bg, color: s.color, fontSize: 10 }}>
                            <span className="admin-status-dot" style={{ background: s.dot }} />
                            {pay.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            </div>

            {/* Department Overview */}
            <div className="admin-section">
              <Section title="Department Load" subtitle="Active patients by department">
                <div className="admin-progress-wrap">
                  {[
                    { name: "Cardiology",   val: 85, color: "#e42320" },
                    { name: "Neurology",    val: 62, color: "#7c3aed" },
                    { name: "Orthopedics",  val: 74, color: "#0891b2" },
                    { name: "Pediatrics",   val: 91, color: "#d97706" },
                    { name: "Dermatology",  val: 48, color: "#db2777" },
                    { name: "General",      val: 55, color: "#059669" },
                  ].map(d => (
                    <div key={d.name} className="admin-progress-row">
                      <div className="admin-progress-head">
                        <span className="admin-progress-label" style={{ color: d.color }}>{d.name}</span>
                        <span className="admin-progress-val">{d.val}%</span>
                      </div>
                      <div className="admin-progress-track">
                        <div className="admin-progress-fill"
                          style={{ width: `${d.val}%`, background: d.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* Weekly Chart */}
            <div className="admin-section">
              <Section title="Weekly Appointments" subtitle="This week vs last week">
                <div className="admin-chart-bars">
                  {[
                    { day: "Mon", cur: 78, prev: 65 },
                    { day: "Tue", cur: 92, prev: 80 },
                    { day: "Wed", cur: 105,prev: 88 },
                    { day: "Thu", cur: 88, prev: 72 },
                    { day: "Fri", cur: 134,prev: 110},
                    { day: "Sat", cur: 60, prev: 55 },
                    { day: "Sun", cur: 30, prev: 28 },
                  ].map(d => (
                    <div key={d.day} className="admin-bar-wrap">
                      <div style={{ display: "flex", gap: 3, alignItems: "flex-end", flex: 1, width: "100%" }}>
                        <div className="admin-bar secondary"
                          style={{ height: `${(d.prev / 134) * 90}%`, flex: 1 }} />
                        <div className="admin-bar"
                          style={{ height: `${(d.cur / 134) * 90}%`, flex: 1 }} />
                      </div>
                      <span className="admin-bar-label">{d.day}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#aaa" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: "#e42320", display: "inline-block" }} />
                    This week
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#aaa" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: "#555", display: "inline-block" }} />
                    Last week
                  </span>
                </div>
              </Section>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPanel;