import React, { useEffect, useMemo, useState } from "react";
import { Building2, IndianRupee, RefreshCw, Stethoscope, Users, Plus, UserCog, ChevronRight, Activity, Sparkles } from "lucide-react";
import API from "../api/api";
import Header from "../components/Header";

/* â”€â”€â”€ Google Fonts injected once â”€â”€â”€ */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700;800&display=swap');

    .had-root *, .had-root *::before, .had-root *::after { box-sizing: border-box; }

    :root {
      --bg:        #0a0f14;
      --surface:   #0f1720;
      --surface2:  #141f2b;
      --border:    rgba(148,163,184,0.16);
      --gold:      #d7b76b;
      --gold-soft: rgba(215,183,107,0.18);
      --teal:      #22d3ee;
      --teal-soft: rgba(34,211,238,0.12);
      --rose:      #fb7185;
      --violet:    #a78bfa;
      --text:      #e6edf5;
      --muted:     #8aa0b6;
      --radius:    16px;
    }

    .had-root {
      min-height: 100vh;
      background: var(--bg);
      background-image:
        radial-gradient(ellipse 70% 50% at 70% -10%, rgba(34,211,238,0.10) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 0% 80%,  rgba(215,183,107,0.07) 0%, transparent 60%),
        radial-gradient(ellipse 55% 45% at 100% 60%, rgba(167,139,250,0.06) 0%, transparent 60%);
    }

    /* Only apply our font/color inside the content area, not the Header */
    .had-body {
      font-family: 'Outfit', sans-serif;
      color: var(--text);
    }

    /* â”€â”€ Hero banner â”€â”€ */
    .had-hero {
      background: linear-gradient(135deg, #0f2336 0%, #0c1a2a 55%, #0a1b2f 100%);
      border: 1px solid rgba(34,211,238,0.18);
      border-radius: 26px;
      padding: 36px 40px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 26px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05);
    }
    .had-hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232dd4bf' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      pointer-events: none;
    }
    .had-hero::after {
      content: '';
      position: absolute;
      inset: -40% -30% auto auto;
      height: 200px;
      width: 300px;
      background: radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 70%);
      opacity: 0.7;
      animation: heroFloat 6s ease-in-out infinite;
    }
    .had-hero-glow {
      position: absolute;
      width: 300px; height: 300px;
      right: -40px; top: -60px;
      background: radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%);
      pointer-events: none;
    }
    .had-hero-title {
      font-family: 'DM Serif Display', serif;
      font-size: clamp(28px, 4vw, 42px);
      font-weight: 400;
      line-height: 1.15;
      background: linear-gradient(135deg, #e2e8f0 30%, var(--teal) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .had-hero-sub {
      font-size: 12px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--teal);
      font-weight: 600;
      margin-bottom: 8px;
    }
    .had-hero-desc {
      font-size: 14px;
      color: #94a3b8;
      max-width: 480px;
      margin-top: 10px;
      line-height: 1.7;
    }
    .had-refresh-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(34,211,238,0.35);
      border-radius: 12px;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 600;
      color: var(--teal);
      cursor: pointer;
      transition: all 0.25s ease;
      font-family: 'Outfit', sans-serif;
      letter-spacing: 0.02em;
    }
    .had-refresh-btn:hover {
      background: rgba(34,211,238,0.12);
      border-color: var(--teal);
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(45,212,191,0.15);
    }
    .had-refresh-btn:active { transform: translateY(0); }
    .had-spin { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* â”€â”€ Stat cards â”€â”€ */
    .had-stat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    @media (max-width: 900px) { .had-stat-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 500px)  { .had-stat-grid { grid-template-columns: 1fr; } }

    .had-stat {
      background: linear-gradient(145deg, rgba(255,255,255,0.02), rgba(255,255,255,0));
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 22px 24px;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      animation: fadeUp 0.5s ease both;
    }
    .had-stat:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.4);
      border-color: rgba(255,255,255,0.18);
    }
    .had-stat::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 3px;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .had-stat:hover::after { opacity: 1; }
    .had-stat-teal::after  { background: linear-gradient(90deg, var(--teal), transparent); }
    .had-stat-gold::after  { background: linear-gradient(90deg, var(--gold), transparent); }
    .had-stat-violet::after{ background: linear-gradient(90deg, var(--violet), transparent); }
    .had-stat-rose::after  { background: linear-gradient(90deg, var(--rose), transparent); }

    .had-stat-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 16px;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .had-stat-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--muted);
      font-weight: 600;
    }
    .had-stat-value {
      font-family: 'DM Serif Display', serif;
      font-size: 34px;
      font-weight: 400;
      margin-top: 4px;
      line-height: 1;
    }

    /* â”€â”€ Section card â”€â”€ */
    .had-card {
      background: linear-gradient(145deg, rgba(255,255,255,0.02), rgba(255,255,255,0));
      border: 1px solid var(--border);
      border-radius: 22px;
      padding: 28px 32px;
      box-shadow: 0 10px 36px rgba(0,0,0,0.35);
      animation: fadeUp 0.5s ease both;
    }
    .had-section-title {
      font-family: 'DM Serif Display', serif;
      font-size: 20px;
      font-weight: 400;
      color: var(--text);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .had-section-title-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--teal);
      flex-shrink: 0;
    }

    /* â”€â”€ Table â”€â”€ */
    .had-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .had-table th {
      text-align: left;
      padding: 10px 14px;
      color: var(--muted);
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border-bottom: 1px solid var(--border);
    }
    .had-table td {
      padding: 14px 14px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      color: #cbd5e1;
      vertical-align: middle;
    }
    .had-table tbody tr {
      cursor: pointer;
      transition: background 0.15s;
    }
    .had-table tbody tr:hover { background: rgba(255,255,255,0.04); }
    .had-table-row-active { background: rgba(45,212,191,0.07) !important; }
    .had-table-row-active td { color: var(--text) !important; }
    .had-branch-name { font-weight: 600; color: var(--text); font-size: 13.5px; }
    .had-branch-addr { font-size: 11.5px; color: var(--muted); margin-top: 2px; }
    .had-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
    }
    .had-badge-teal { background: var(--teal-soft); color: var(--teal); }
    .had-revenue { font-weight: 700; color: var(--gold); }
    .had-unassigned { color: var(--muted); font-style: italic; font-size: 12px; }

    /* â”€â”€ Forms grid â”€â”€ */
    .had-forms-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    @media (max-width: 1024px) { .had-forms-grid { grid-template-columns: 1fr; } }

    .had-form-card {
      background: linear-gradient(145deg, rgba(255,255,255,0.02), rgba(255,255,255,0));
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 28px 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.32);
      animation: fadeUp 0.5s ease both;
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .had-form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }
    @media (max-width: 700px) {
      .had-form-grid { grid-template-columns: 1fr; }
    }
    .had-field-full { grid-column: 1 / -1; }
    .had-form-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }
    .had-form-icon {
      width: 40px; height: 40px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .had-form-title {
      font-family: 'DM Serif Display', serif;
      font-size: 17px;
      font-weight: 400;
      color: var(--text);
    }
    .had-form-subtitle {
      font-size: 11px;
      color: var(--muted);
      margin-top: 1px;
    }

    /* â”€â”€ Floating label input â”€â”€ */
    .had-field {
      position: relative;
      margin-bottom: 14px;
    }
    .had-field-input {
      width: 100%;
      background: rgba(15,23,32,0.7);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 13px 14px 5px;
      font-size: 13.5px;
      color: var(--text);
      font-family: 'Outfit', sans-serif;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      appearance: none;
    }
    .had-field-hint {
      font-size: 10.5px;
      color: var(--muted);
      margin-top: 6px;
      letter-spacing: 0.02em;
    }
    .had-field-input:focus {
      border-color: var(--teal);
      box-shadow: 0 0 0 3px rgba(34,211,238,0.14);
    }
    .had-field-label {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      color: var(--muted);
      pointer-events: none;
      transition: all 0.18s ease;
      font-weight: 500;
    }
    .had-field-input:focus ~ .had-field-label,
    .had-field-input:not(:placeholder-shown) ~ .had-field-label {
      top: 8px;
      transform: none;
      font-size: 10px;
      color: var(--teal);
      letter-spacing: 0.06em;
    }

    /* â”€â”€ Submit buttons â”€â”€ */
    .had-btn {
      width: 100%;
      border: none;
      border-radius: 10px;
      padding: 13px 20px;
      font-size: 13.5px;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: all 0.25s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 6px;
      position: relative;
      overflow: hidden;
    }
    .had-form-actions {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }
    .had-form-actions .had-btn {
      flex: 1;
      margin-top: 0;
    }
    .had-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0);
      transition: background 0.2s;
    }
    .had-btn:hover::before { background: rgba(255,255,255,0.06); }
    .had-btn:active { transform: scale(0.98); }
    .had-btn:disabled { opacity: 0.55; cursor: not-allowed; }

    .had-btn-slate {
      background: linear-gradient(135deg, #162433 0%, #0f172a 100%);
      color: #e2e8f0;
      border: 1px solid rgba(255,255,255,0.14);
      box-shadow: 0 6px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05);
    }
    .had-btn-slate:not(:disabled):hover {
      box-shadow: 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
      transform: translateY(-1px);
    }
    .had-btn-teal {
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
      color: #ccfbf1;
      box-shadow: 0 4px 20px rgba(13,148,136,0.35);
    }
    .had-btn-teal:not(:disabled):hover {
      box-shadow: 0 8px 28px rgba(13,148,136,0.5);
      transform: translateY(-1px);
    }
    .had-btn-gold {
      background: linear-gradient(135deg, #b45309 0%, #92400e 100%);
      color: #fef3c7;
      box-shadow: 0 4px 20px rgba(180,83,9,0.35);
    }
    .had-btn-gold:not(:disabled):hover {
      box-shadow: 0 8px 28px rgba(180,83,9,0.5);
      transform: translateY(-1px);
    }

    .had-btn-loading::after {
      content: '';
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    /* â”€â”€ Branch detail panel â”€â”€ */
    .had-detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    @media (max-width: 700px) { .had-detail-grid { grid-template-columns: 1fr; } }

    .had-detail-pane {
      background: rgba(18,28,40,0.7);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 18px 20px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
    }
    .had-detail-pane-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .had-detail-pane-count {
      background: var(--teal-soft);
      color: var(--teal);
      font-size: 10px;
      border-radius: 999px;
      padding: 1px 7px;
      font-weight: 700;
    }
    .had-detail-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      font-size: 12.5px;
      color: #94a3b8;
      transition: color 0.15s;
    }
    .had-detail-item:last-child { border-bottom: none; }
    .had-detail-item:hover { color: var(--text); }
    .had-detail-id {
      font-size: 10px;
      color: var(--muted);
      background: rgba(255,255,255,0.05);
      border-radius: 4px;
      padding: 1px 5px;
      flex-shrink: 0;
    }
    .had-detail-name { font-weight: 600; color: var(--text); }
    .had-detail-sub { font-size: 11px; color: var(--muted); }
    .had-scroll { max-height: 200px; overflow-y: auto; }
    .had-scroll::-webkit-scrollbar { width: 4px; }
    .had-scroll::-webkit-scrollbar-track { background: transparent; }
    .had-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

    /* â”€â”€ Error toast â”€â”€ */
    .had-error {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 14px;
      background: rgba(251,113,133,0.12);
      border: 1px solid rgba(251,113,133,0.3);
      border-radius: 10px;
      padding: 9px 14px;
      font-size: 12.5px;
      color: #fda4af;
    }

    /* â”€â”€ Placeholder / loading â”€â”€ */
    .had-placeholder {
      text-align: center;
      padding: 48px 20px;
      color: var(--muted);
      font-size: 13px;
    }
    .had-placeholder-icon {
      width: 48px; height: 48px;
      border-radius: 16px;
      background: rgba(255,255,255,0.04);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 12px;
    }

    .had-summary {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      background: rgba(18,28,40,0.7);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px 18px;
      margin-bottom: 16px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
    }
    .had-summary-main {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .had-summary-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text);
    }
    .had-summary-sub {
      font-size: 12px;
      color: var(--muted);
    }
    .had-summary-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .had-summary-pill {
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.04);
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      color: #cbd5e1;
    }

    /* â”€â”€ Animations â”€â”€ */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes heroFloat {
      0%, 100% { transform: translateY(0); opacity: 0.6; }
      50% { transform: translateY(8px); opacity: 0.8; }
    }
    .had-stat:nth-child(1) { animation-delay: 0.05s; }
    .had-stat:nth-child(2) { animation-delay: 0.10s; }
    .had-stat:nth-child(3) { animation-delay: 0.15s; }
    .had-stat:nth-child(4) { animation-delay: 0.20s; }
  `}</style>
);

/* â”€â”€â”€ Floating label input â”€â”€â”€ */
const Field = ({ label, className = "", hint, ...props }) => (
  <div className={`had-field ${className}`.trim()}>
    <input className="had-field-input" placeholder=" " {...props} />
    <label className="had-field-label">{label}</label>
    {hint && <div className="had-field-hint">{hint}</div>}
  </div>
);

const emptyBranchForm = { branchName: "", branchAddress: "", branchContactNumber: "", branchEmail: "" };
const emptyAdminForm  = { username: "", name: "", email: "", branchName: "" };
const emptyDoctorForm = { username: "", name: "", specialization: "", email: "", branchName: "" };

const DEPT_LIMITS = {
  name: 100,
  description: 2000,
  imageUrl: 2000,
  accentColor: 20,
  bgColor: 20,
  icon: 20,
  sectionsJson: 10000,
};

const HeadAdminPanel = () => {
  const [overview, setOverview]               = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [details, setDetails]                 = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [detailsLoading, setDetailsLoading]   = useState(false);
  const [error, setError]                     = useState("");
  const [detailsError, setDetailsError]       = useState("");
  const [spinning, setSpinning]               = useState(false);

  const [branchForm, setBranchForm] = useState(emptyBranchForm);
  const [adminForm,  setAdminForm]  = useState(emptyAdminForm);
  const [doctorForm, setDoctorForm] = useState(emptyDoctorForm);
  const [adminUsernameSuggestions,  setAdminUsernameSuggestions]  = useState([]);
  const [doctorUsernameSuggestions, setDoctorUsernameSuggestions] = useState([]);
  const [branchNameSuggestions,     setBranchNameSuggestions]     = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [departmentTemplates, setDepartmentTemplates] = useState([]);
  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    accentColor: "#2563eb",
    bgColor: "#eff6ff",
    icon: "DEPT",
  });
  const [departmentSubmitting, setDepartmentSubmitting] = useState(false);
  const [departmentError, setDepartmentError] = useState("");

  const getApiErrorMessage = (err, fallback) => {
    return err?.response?.data?.error || err?.response?.data?.message || fallback;
  };

  const validateDepartmentTemplate = () => {
    const errors = [];
    if (departmentForm.name && departmentForm.name.length > DEPT_LIMITS.name) {
      errors.push(`Name must be at most ${DEPT_LIMITS.name} characters`);
    }
    if (departmentForm.description && departmentForm.description.length > DEPT_LIMITS.description) {
      errors.push(`Description must be at most ${DEPT_LIMITS.description} characters`);
    }
    if (departmentForm.imageUrl && departmentForm.imageUrl.length > DEPT_LIMITS.imageUrl) {
      errors.push(`Image URL must be at most ${DEPT_LIMITS.imageUrl} characters`);
    }
    if (departmentForm.accentColor && departmentForm.accentColor.length > DEPT_LIMITS.accentColor) {
      errors.push(`Accent color must be at most ${DEPT_LIMITS.accentColor} characters`);
    }
    if (departmentForm.bgColor && departmentForm.bgColor.length > DEPT_LIMITS.bgColor) {
      errors.push(`Background color must be at most ${DEPT_LIMITS.bgColor} characters`);
    }
    if (departmentForm.icon && departmentForm.icon.length > DEPT_LIMITS.icon) {
      errors.push(`Icon text must be at most ${DEPT_LIMITS.icon} characters`);
    }
    return errors;
  };

  const totalEstimatedRevenue = useMemo(
    () => overview.reduce((sum, b) => sum + (b.estimatedRevenue || 0), 0),
    [overview]
  );

  const loadOverview = async () => {
    const res   = await API.get("/head-admin/overview");
    const items = Array.isArray(res.data) ? res.data : [];
    setOverview(items);
    if (!selectedBranchId && items.length) setSelectedBranchId(items[0].branchId);
  };

  const loadBranchDetails = async (branchId) => {
    if (!branchId) return;
    setDetailsLoading(true);
    try {
      const res = await API.get(`/head-admin/branch/${branchId}/details`);
      setDetails(res.data);
      setDetailsError("");
    } catch (e) {
      setDetailsError(getApiErrorMessage(e, "Failed to load branch details"));
      setDetails(null);
    } finally { setDetailsLoading(false); }
  };

  const loadDepartmentTemplates = async () => {
    try {
      const res = await API.get("/head-admin/departments");
      setDepartmentTemplates(Array.isArray(res.data) ? res.data : []);
      setDepartmentError("");
    } catch (e) {
      setDepartmentError(getApiErrorMessage(e, "Failed to load department templates"));
      setDepartmentTemplates([]);
    }
  };

  const refreshAll = async () => {
    setLoading(true); setSpinning(true);
    try { await Promise.all([loadOverview(), loadDepartmentTemplates()]); setError(""); }
    catch (e) { setError(getApiErrorMessage(e, "Failed to load dashboard")); }
    finally { setLoading(false); setTimeout(() => setSpinning(false), 800); }
  };

  useEffect(() => { refreshAll(); }, []);
  useEffect(() => { if (selectedBranchId) loadBranchDetails(selectedBranchId); }, [selectedBranchId]);

  useEffect(() => {
    const q = adminForm.username?.trim();
    if (!q) { setAdminUsernameSuggestions([]); return; }
    const t = setTimeout(async () => {
      try { const r = await API.get("/head-admin/user-suggestions", { params: { query: q } }); setAdminUsernameSuggestions(Array.isArray(r.data) ? r.data : []); }
      catch { setAdminUsernameSuggestions([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [adminForm.username]);

  useEffect(() => {
    const q = doctorForm.username?.trim();
    if (!q) { setDoctorUsernameSuggestions([]); return; }
    const t = setTimeout(async () => {
      try { const r = await API.get("/head-admin/user-suggestions", { params: { query: q } }); setDoctorUsernameSuggestions(Array.isArray(r.data) ? r.data : []); }
      catch { setDoctorUsernameSuggestions([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [doctorForm.username]);

  useEffect(() => {
    const query = (adminForm.branchName || doctorForm.branchName || "").trim();
    if (!query) { setBranchNameSuggestions([]); return; }
    const t = setTimeout(async () => {
      try { const r = await API.get("/head-admin/branch-suggestions", { params: { query } }); setBranchNameSuggestions(Array.isArray(r.data) ? r.data : []); }
      catch { setBranchNameSuggestions([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [adminForm.branchName, doctorForm.branchName]);

  const handleCreateBranch = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await API.post("/head-admin/createNewBranch", branchForm); setBranchForm(emptyBranchForm); await refreshAll(); }
    catch (err) { setError(getApiErrorMessage(err, "Failed to create branch")); }
    finally { setSubmitting(false); }
  };

  const handleAssignAdmin = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await API.post("/head-admin/onBoardNewAdmin", {
        ...adminForm,
        username: adminForm.username.trim(), branchName: adminForm.branchName.trim(),
        name: adminForm.name.trim(), email: adminForm.email.trim(),
      });
      setAdminForm(emptyAdminForm); await refreshAll();
      if (selectedBranchId) await loadBranchDetails(selectedBranchId);
    } catch (err) { setError(getApiErrorMessage(err, "Failed to assign branch admin")); }
    finally { setSubmitting(false); }
  };

  const handleOnboardDoctor = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await API.post("/admin/onBoardNewDoctor", {
        ...doctorForm,
        username: doctorForm.username.trim(), branchName: doctorForm.branchName.trim(),
        name: doctorForm.name.trim(), specialization: doctorForm.specialization.trim(), email: doctorForm.email.trim(),
      });
      setDoctorForm(emptyDoctorForm); await refreshAll();
      if (selectedBranchId) await loadBranchDetails(selectedBranchId);
    } catch (err) { setError(getApiErrorMessage(err, "Failed to onboard doctor")); }
    finally { setSubmitting(false); }
  };

  const handleCreateDepartmentTemplate = async (e) => {
    e.preventDefault(); setDepartmentSubmitting(true);
    try {
      setDepartmentError("");
      const errors = validateDepartmentTemplate();
      if (errors.length > 0) {
        setDepartmentError(errors[0]);
        return;
      }
      await API.post("/head-admin/departments", {
        ...departmentForm,
        name: departmentForm.name.trim(),
        description: departmentForm.description.trim(),
        imageUrl: departmentForm.imageUrl.trim(),
        accentColor: departmentForm.accentColor.trim(),
        bgColor: departmentForm.bgColor.trim(),
        icon: departmentForm.icon.trim(),
      });
      setDepartmentForm({
        name: "",
        description: "",
        imageUrl: "",
        accentColor: "#2563eb",
        bgColor: "#eff6ff",
        icon: "DEPT",
      });
      await loadDepartmentTemplates();
    } catch (err) {
      setDepartmentError(getApiErrorMessage(err, "Failed to create department template"));
    } finally { setDepartmentSubmitting(false); }
  };

  return (
    <div className="had-root">
      <FontLoader />
      <Header />

      <div className="had-body" style={{ paddingTop: 88, paddingBottom: 64, paddingInline: "clamp(16px, 4vw, 48px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* â”€â”€ Hero â”€â”€ */}
          <div className="had-hero">
            <div className="had-hero-glow" />
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 20, position: "relative", zIndex: 1 }}>
              <div>
                <p className="had-hero-sub">Hospital Governance</p>
                <h1 className="had-hero-title">Head Admin<br/>Command Center</h1>
                <p className="had-hero-desc">Branch operations, admin assignment, doctor onboarding, and organization-wide visibility - all in one place.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                <button className={`had-refresh-btn${spinning ? " had-spin-wrap" : ""}`} onClick={refreshAll}>
                  <RefreshCw size={14} className={spinning ? "had-spin" : ""} />
                  Refresh Data
                </button>
                {error && (
                  <div className="had-error">
                    <span style={{ fontSize: 15 }}>âš </span> {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* â”€â”€ Stats â”€â”€ */}
          <div className="had-stat-grid">
            <div className="had-stat had-stat-teal">
              <div className="had-stat-icon" style={{ background: "rgba(45,212,191,0.1)" }}>
                <Building2 size={20} color="var(--teal)" />
              </div>
              <p className="had-stat-label">Total Branches</p>
              <p className="had-stat-value" style={{ color: "var(--teal)" }}>{overview.length}</p>
            </div>
            <div className="had-stat had-stat-gold">
              <div className="had-stat-icon" style={{ background: "rgba(201,168,76,0.1)" }}>
                <Stethoscope size={20} color="var(--gold)" />
              </div>
              <p className="had-stat-label">Total Doctors</p>
              <p className="had-stat-value" style={{ color: "var(--gold)" }}>{overview.reduce((s, b) => s + (b.doctorCount || 0), 0)}</p>
            </div>
            <div className="had-stat had-stat-violet">
              <div className="had-stat-icon" style={{ background: "rgba(167,139,250,0.1)" }}>
                <Users size={20} color="var(--violet)" />
              </div>
              <p className="had-stat-label">Total Patients</p>
              <p className="had-stat-value" style={{ color: "var(--violet)" }}>{overview.reduce((s, b) => s + (b.patientCount || 0), 0)}</p>
            </div>
            <div className="had-stat had-stat-rose">
              <div className="had-stat-icon" style={{ background: "rgba(251,113,133,0.1)" }}>
                <IndianRupee size={20} color="var(--rose)" />
              </div>
              <p className="had-stat-label">Estimated Revenue</p>
              <p className="had-stat-value" style={{ color: "var(--rose)", fontSize: totalEstimatedRevenue > 9999999 ? 22 : 28 }}>
                â‚¹{totalEstimatedRevenue.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* â”€â”€ Branch overview table â”€â”€ */}
          <div className="had-card">
            <h2 className="had-section-title">
              <span className="had-section-title-dot" />
              Branch Overview
              <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)", fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>
                Click a row to inspect
              </span>
            </h2>
            {loading ? (
              <div className="had-placeholder">
                <div className="had-placeholder-icon"><Activity size={20} color="var(--muted)" /></div>
                Loading branches...
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="had-table">
                  <thead>
                    <tr>
                      <th>Branch</th>
                      <th>Admin</th>
                      <th>Doctors</th>
                      <th>Patients</th>
                      <th>Departments</th>
                      <th>Est. Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.map((branch) => (
                      <tr
                        key={branch.branchId}
                        onClick={() => setSelectedBranchId(branch.branchId)}
                        className={selectedBranchId === branch.branchId ? "had-table-row-active" : ""}
                      >
                        <td>
                          <p className="had-branch-name">{branch.branchName}</p>
                          <p className="had-branch-addr">{branch.branchAddress}</p>
                        </td>
                        <td>
                          {branch.adminName
                            ? <><p style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{branch.adminName}</p><p style={{ fontSize: 11, color: "var(--muted)" }}>@{branch.adminUsername}</p></>
                            : <span className="had-unassigned">Unassigned</span>
                          }
                        </td>
                        <td><span className="had-badge had-badge-teal">{branch.doctorCount}</span></td>
                        <td>{branch.patientCount}</td>
                        <td>{branch.departmentCount}</td>
                        <td className="had-revenue">â‚¹{(branch.estimatedRevenue || 0).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* â”€â”€ Three forms â”€â”€ */}
          <div className="had-forms-grid">

            {/* Create Branch */}
            <form className="had-form-card" onSubmit={handleCreateBranch}>
              <div className="had-form-header">
                <div className="had-form-icon" style={{ background: "rgba(45,212,191,0.1)" }}>
                  <Building2 size={18} color="var(--teal)" />
                </div>
                <div>
                  <p className="had-form-title">Create Branch</p>
                  <p className="had-form-subtitle">Register a new hospital branch</p>
                </div>
              </div>
              <div className="had-form-grid">
                <Field label="Branch Name" className="had-field-full" value={branchForm.branchName} onChange={(e) => setBranchForm(p => ({ ...p, branchName: e.target.value }))} required />
                <Field label="Address" className="had-field-full" value={branchForm.branchAddress} onChange={(e) => setBranchForm(p => ({ ...p, branchAddress: e.target.value }))} required />
                <Field label="Contact Number" value={branchForm.branchContactNumber} onChange={(e) => setBranchForm(p => ({ ...p, branchContactNumber: e.target.value }))} required />
                <Field label="Email" type="email" value={branchForm.branchEmail} onChange={(e) => setBranchForm(p => ({ ...p, branchEmail: e.target.value }))} required />
              </div>
              <div className="had-form-actions">
                <button type="submit" disabled={submitting} className={`had-btn had-btn-slate${submitting ? " had-btn-loading" : ""}`}>
                  {!submitting && <Plus size={15} />}
                  {submitting ? "" : "Create Branch"}
                </button>
              </div>
            </form>

            {/* Assign Admin */}
            <form className="had-form-card" onSubmit={handleAssignAdmin}>
              <div className="had-form-header">
                <div className="had-form-icon" style={{ background: "rgba(201,168,76,0.1)" }}>
                  <UserCog size={18} color="var(--gold)" />
                </div>
                <div>
                  <p className="had-form-title">Assign Admin</p>
                  <p className="had-form-subtitle">Onboard a branch administrator</p>
                </div>
              </div>
              <div className="had-form-grid">
                <Field label="Username" type="text" list="admin-username-suggestions" value={adminForm.username} onChange={(e) => setAdminForm(p => ({ ...p, username: e.target.value }))} required />
                <Field label="Full Name" value={adminForm.name} onChange={(e) => setAdminForm(p => ({ ...p, name: e.target.value }))} required />
                <Field label="Email" type="email" value={adminForm.email} onChange={(e) => setAdminForm(p => ({ ...p, email: e.target.value }))} required />
                <Field label="Branch Name" type="text" list="branch-name-suggestions" value={adminForm.branchName} onChange={(e) => setAdminForm(p => ({ ...p, branchName: e.target.value }))} required />
              </div>
              <div className="had-form-actions">
                <button type="submit" disabled={submitting} className={`had-btn had-btn-gold${submitting ? " had-btn-loading" : ""}`}>
                  {!submitting && <ChevronRight size={15} />}
                  {submitting ? "" : "Assign Admin"}
                </button>
              </div>
            </form>

            {/* Onboard Doctor */}
            <form className="had-form-card" onSubmit={handleOnboardDoctor}>
              <div className="had-form-header">
                <div className="had-form-icon" style={{ background: "var(--teal-soft)" }}>
                  <Stethoscope size={18} color="var(--teal)" />
                </div>
                <div>
                  <p className="had-form-title">Onboard Doctor</p>
                  <p className="had-form-subtitle">Add a specialist to a branch</p>
                </div>
              </div>
              <div className="had-form-grid">
                <Field label="Username" type="text" list="doctor-username-suggestions" value={doctorForm.username} onChange={(e) => setDoctorForm(p => ({ ...p, username: e.target.value }))} required />
                <Field label="Doctor Name" value={doctorForm.name} onChange={(e) => setDoctorForm(p => ({ ...p, name: e.target.value }))} required />
                <Field label="Specialization" value={doctorForm.specialization} onChange={(e) => setDoctorForm(p => ({ ...p, specialization: e.target.value }))} required />
                <Field label="Email" type="email" value={doctorForm.email} onChange={(e) => setDoctorForm(p => ({ ...p, email: e.target.value }))} required />
                <Field label="Branch Name" type="text" list="branch-name-suggestions" value={doctorForm.branchName} onChange={(e) => setDoctorForm(p => ({ ...p, branchName: e.target.value }))} required />
              </div>
              <div className="had-form-actions">
                <button type="submit" disabled={submitting} className={`had-btn had-btn-teal${submitting ? " had-btn-loading" : ""}`}>
                  {!submitting && <Sparkles size={15} />}
                  {submitting ? "" : "Onboard Doctor"}
                </button>
              </div>
            </form>

            {/* Create Department Template */}
            <form className="had-form-card" onSubmit={handleCreateDepartmentTemplate}>
              <div className="had-form-header">
                <div className="had-form-icon" style={{ background: "rgba(167,139,250,0.12)" }}>
                  <Activity size={18} color="var(--violet)" />
                </div>
                <div>
                  <p className="had-form-title">Department Template</p>
                  <p className="had-form-subtitle">Create a department type (not public until added)</p>
                </div>
              </div>
              <div className="had-form-grid">
                <Field label="Department Name" className="had-field-full" maxLength={DEPT_LIMITS.name} value={departmentForm.name} onChange={(e) => setDepartmentForm(p => ({ ...p, name: e.target.value }))} required />
                <Field label="Description (optional)" className="had-field-full" maxLength={DEPT_LIMITS.description} value={departmentForm.description} onChange={(e) => setDepartmentForm(p => ({ ...p, description: e.target.value }))} />
                <Field label="Image URL (optional)" className="had-field-full" maxLength={DEPT_LIMITS.imageUrl} value={departmentForm.imageUrl} onChange={(e) => setDepartmentForm(p => ({ ...p, imageUrl: e.target.value }))} hint="Use a full URL (https://...)" />
                <Field label="Accent Color" maxLength={DEPT_LIMITS.accentColor} value={departmentForm.accentColor} onChange={(e) => setDepartmentForm(p => ({ ...p, accentColor: e.target.value }))} />
                <Field label="Background Color" maxLength={DEPT_LIMITS.bgColor} value={departmentForm.bgColor} onChange={(e) => setDepartmentForm(p => ({ ...p, bgColor: e.target.value }))} />
                <Field label="Icon Text" maxLength={DEPT_LIMITS.icon} value={departmentForm.icon} onChange={(e) => setDepartmentForm(p => ({ ...p, icon: e.target.value }))} hint="2-4 letters (e.g. CARD)" />
              </div>
              <div className="had-form-actions">
                <button type="submit" disabled={departmentSubmitting} className={`had-btn had-btn-slate${departmentSubmitting ? " had-btn-loading" : ""}`}>
                  {!departmentSubmitting && <Plus size={15} />}
                  {departmentSubmitting ? "" : "Create Template"}
                </button>
              </div>
              {departmentError && (
                <div className="had-error" style={{ marginTop: 10 }}>
                  <span style={{ fontSize: 15 }}>âš </span> {departmentError}
                </div>
              )}
            </form>
          </div>

          {/* Department Templates */}
          <div className="had-card">
            <h2 className="had-section-title">
              <span className="had-section-title-dot" style={{ background: "var(--violet)" }} />
              Department Templates
            </h2>
            {departmentTemplates.length === 0 ? (
              <div className="had-placeholder">
                <div className="had-placeholder-icon"><Activity size={20} color="var(--muted)" /></div>
                No department templates created yet.
              </div>
            ) : (
              <div className="had-detail-pane had-scroll">
                {(departmentTemplates || []).map(dep => (
                  <div key={dep.id} className="had-detail-item" style={{ justifyContent: "space-between" }}>
                    <div>
                      <p className="had-detail-name">{dep.name}</p>
                      {dep.description && <p className="had-detail-sub">{dep.description}</p>}
                    </div>
                    <span className="had-detail-id">#{dep.id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* â”€â”€ Branch detail panel â”€â”€ */}
          <div className="had-card">
            <h2 className="had-section-title">
              <span className="had-section-title-dot" style={{ background: "var(--gold)" }} />
              Selected Branch Details
            </h2>
            {detailsError && (
              <div className="had-error" style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 15 }}>!</span> {detailsError}
              </div>
            )}
            {detailsLoading ? (
              <div className="had-placeholder">
                <div className="had-placeholder-icon"><Activity size={20} color="var(--muted)" /></div>
                Loading branch data...
              </div>
            ) : !details ? (
              <div className="had-placeholder">
                <div className="had-placeholder-icon"><Building2 size={20} color="var(--muted)" /></div>
                Select a branch in the table above to view its doctors, patients, admins, and departments.
              </div>
            ) : (
              <div>
                {details?.summary && (
                  <div className="had-summary">
                    <div className="had-summary-main">
                      <div className="had-summary-title">{details.summary.branchName}</div>
                      <div className="had-summary-sub">{details.summary.branchAddress}</div>
                    </div>
                    <div className="had-summary-pills">
                      <span className="had-summary-pill">Admin: {details.summary.adminName || "Unassigned"}</span>
                      <span className="had-summary-pill">Doctors: {details.summary.doctorCount || 0}</span>
                      <span className="had-summary-pill">Patients: {details.summary.patientCount || 0}</span>
                      <span className="had-summary-pill">Departments: {details.summary.departmentCount || 0}</span>
                    </div>
                  </div>
                )}
                <div className="had-detail-grid">
                {/* Admins */}
                <div className="had-detail-pane">
                  <p className="had-detail-pane-title">
                    Admins <span className="had-detail-pane-count">{details.admins?.length || 0}</span>
                  </p>
                  {(details.admins || []).map(a => (
                    <div key={a.id} className="had-detail-item">
                      <span className="had-detail-id">#{a.id}</span>
                      <div><p className="had-detail-name">{a.name}</p><p className="had-detail-sub">{a.email}</p></div>
                    </div>
                  ))}
                </div>
                {/* Doctors */}
                <div className="had-detail-pane">
                  <p className="had-detail-pane-title">
                    Doctors <span className="had-detail-pane-count">{details.doctors?.length || 0}</span>
                  </p>
                  {(details.doctors || []).map(d => (
                    <div key={d.id} className="had-detail-item">
                      <span className="had-detail-id">#{d.id}</span>
                      <div><p className="had-detail-name">{d.name}</p><p className="had-detail-sub">{d.specialization}</p></div>
                    </div>
                  ))}
                </div>
                {/* Patients */}
                <div className="had-detail-pane">
                  <p className="had-detail-pane-title">
                    Patients <span className="had-detail-pane-count">{details.patients?.length || 0}</span>
                  </p>
                  <div className="had-scroll">
                    {(details.patients || []).map(p => (
                      <div key={p.id} className="had-detail-item">
                        <span className="had-detail-id">#{p.id}</span>
                        <div><p className="had-detail-name">{p.name}</p><p className="had-detail-sub">{p.email}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Departments */}
                <div className="had-detail-pane">
                  <p className="had-detail-pane-title">
                    Departments <span className="had-detail-pane-count">{details.departments?.length || 0}</span>
                  </p>
                  {(details.departments || []).map(dep => (
                    <div key={dep.id} className="had-detail-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: 3 }}>
                      <p className="had-detail-name">{dep.name}</p>
                      <p className="had-detail-sub">Head: {dep.headDoctorName || "N/A"} - {dep.doctorCount} doctors - {dep.patientCount} patients</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}
          </div>

        </div>
      </div>

      {/* Datalists */}
      <datalist id="admin-username-suggestions">
        {adminUsernameSuggestions.map(u => <option key={u} value={u} />)}
      </datalist>
      <datalist id="doctor-username-suggestions">
        {doctorUsernameSuggestions.map(u => <option key={u} value={u} />)}
      </datalist>
      <datalist id="branch-name-suggestions">
        {branchNameSuggestions.map(b => <option key={b} value={b} />)}
      </datalist>
    </div>
  );
};

export default HeadAdminPanel;



