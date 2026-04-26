import React, { useEffect, useMemo, useState } from "react";
import { Building2, IndianRupee, RefreshCw, Stethoscope, Users, Plus, UserCog, ChevronRight, Activity, Sparkles } from "lucide-react";
import API from "../api/api";
import Header from "../components/Header";
import PageLoader from "../components/PageLoader";

/* ─── Google Fonts injected once ─── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700;800&display=swap');

    .had-root *, .had-root *::before, .had-root *::after { box-sizing: border-box; }

    :root {
      --bg:        var(--background);
      --surface:   var(--card);
      --surface2:  var(--sidebar);
      --border:    var(--sidebar-border);
      --gold:      var(--primary);
      --gold-soft: var(--secondary);
      --teal:      var(--primary);
      --teal-soft: var(--secondary);
      --rose:      var(--destructive);
      --violet:    var(--chart-5);
      --text:      var(--foreground);
      --muted:     var(--muted-foreground);
      --radius:    var(--radius);
    }

    .had-root {
      min-height: 100vh;
      background: var(--bg);
      background-image:
        radial-gradient(ellipse 70% 50% at 70% -10%, color-mix(in srgb, var(--primary) 5%, transparent) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 0% 80%,  color-mix(in srgb, var(--secondary) 5%, transparent) 0%, transparent 60%),
        radial-gradient(ellipse 55% 45% at 100% 60%, color-mix(in srgb, var(--chart-5) 5%, transparent) 0%, transparent 60%);
    }

    .had-body {
      font-family: 'Outfit', sans-serif;
      color: var(--text);
    }

    /* ── Hero banner ── */
    .had-hero {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 26px;
      padding: 36px 40px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 26px 70px rgba(0,0,0,0.05);
    }
    .had-hero::after {
      content: '';
      position: absolute;
      inset: -40% -30% auto auto;
      height: 200px;
      width: 300px;
      background: radial-gradient(circle, color-mix(in srgb, var(--primary) 10%, transparent) 0%, transparent 70%);
      opacity: 0.7;
      animation: heroFloat 6s ease-in-out infinite;
    }
    .had-hero-title {
      font-family: 'DM Serif Display', serif;
      font-size: clamp(28px, 4vw, 42px);
      font-weight: 400;
      line-height: 1.15;
      color: var(--foreground);
    }
    .had-hero-title em { font-style: italic; color: var(--primary); }
    .had-hero-sub {
      font-size: 12px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--primary);
      font-weight: 600;
      margin-bottom: 8px;
    }
    .had-hero-desc {
      font-size: 14px;
      color: var(--muted-foreground);
      max-width: 480px;
      margin-top: 10px;
      line-height: 1.7;
    }
    .had-refresh-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--secondary);
      border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent);
      border-radius: 12px;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 700;
      color: var(--primary);
      cursor: pointer;
      transition: all 0.25s ease;
      font-family: 'Outfit', sans-serif;
    }

    /* ── Stat cards ── */
    .had-stat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .had-stat {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 22px 24px;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .had-stat:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.05);
      border-color: var(--primary);
    }
    .had-stat-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 16px;
      background: var(--secondary);
      color: var(--primary);
    }
    .had-stat-value {
      font-family: 'DM Serif Display', serif;
      font-size: 34px;
      font-weight: 400;
      color: var(--foreground);
    }

    /* ── Cards etc ── */
    .had-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 22px;
      padding: 28px 32px;
      box-shadow: 0 10px 36px rgba(0,0,0,0.03);
    }
    .had-table th { color: var(--muted-foreground); border-bottom: 1px solid var(--border); }
    .had-table td { border-bottom: 1px solid var(--border); color: var(--foreground); }
    .had-table tbody tr:hover { background: var(--secondary); }
    .had-badge-teal { background: var(--secondary); color: var(--primary); border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent); }
    
    .had-form-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.03);
    }
    .had-field-input {
      width: 100%;
      background: var(--card);
      border: 1.5px solid color-mix(in srgb, var(--primary) 28%, var(--border));
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 14px;
      color: var(--foreground);
      outline: none;
      transition: all 0.2s;
    }
    .had-field-input::placeholder {
      color: var(--muted-foreground);
      opacity: 0.9;
    }
    .had-field-input option {
      background: var(--card);
      color: var(--foreground);
    }
    .had-field-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 12%, transparent);
    }
    
    .had-btn-teal { background: var(--primary); color: #fff; border: none; border-radius: 12px; padding: 12px 24px; font-weight: 800; cursor: pointer; width: 100%; transition: all 0.2s; box-shadow: 0 10px 25px -5px color-mix(in srgb, var(--primary) 40%, transparent); }
    .had-btn-teal:hover { transform: translateY(-2px); filter: brightness(1.1); }
    .had-btn-slate { background: var(--secondary); color: var(--primary); border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent); border-radius: 12px; padding: 12px 24px; font-weight: 800; cursor: pointer; width: 100%; transition: all 0.2s; }
    .had-btn-slate:hover { background: color-mix(in srgb, var(--primary) 10%, var(--secondary)); }
    
    .had-section-title { font-size: 18px; font-weight: 800; color: var(--foreground); display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .had-section-title-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); }
    
    .had-table { width: 100%; border-collapse: collapse; }
    .had-table tr { cursor: pointer; transition: all 0.2s; }
    .had-table th { text-align: left; padding: 14px 16px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }
    .had-table td { padding: 16px; font-size: 14px; }
    .had-table-row-active td { background: var(--secondary); border-left: 3px solid var(--primary); }
    .had-branch-name { font-weight: 800; color: var(--foreground); }
    .had-branch-addr { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .had-revenue { font-weight: 800; color: var(--primary); text-align: right; }

    .had-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .had-detail-pane { background: var(--surface2); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; }
    .had-detail-pane-title { padding: 16px 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; }
    .had-detail-pane-count { color: var(--primary); opacity: 0.6; }
    .had-scroll { max-height: 280px; overflow-y: auto; }
    .had-detail-item { padding: 14px 20px; border-bottom: 1px solid var(--border); display: flex; items-center; gap: 14px; transition: all 0.2s; }
    .had-detail-item:last-child { border-bottom: none; }
    .had-detail-item:hover { background: var(--surface); }
    .had-detail-name { font-size: 13px; font-weight: 800; color: var(--foreground); }
    .had-detail-sub { font-size: 11px; color: var(--muted); }
    
    .had-form-title { font-size: 20px; font-weight: 800; color: var(--foreground); margin-bottom: 4px; }
    .had-form-subtitle { font-size: 12px; color: var(--muted); }

    .had-spin { animation: spin 0.8s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes heroFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

    .had-tabs { display: flex; gap: 8px; margin-bottom: 32px; overflow-x: auto; padding-bottom: 4px; }
    .had-tab { padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 800; cursor: pointer; border: 1.5px solid var(--border); transition: all 0.2s; white-space: nowrap; color: var(--muted); }
    .had-tab.active { background: var(--gold); color: white; border-color: var(--gold); }

    @media (max-width: 768px) {
      .had-stat-grid { grid-template-columns: repeat(2, 1fr); }
      .had-detail-grid { grid-template-columns: 1fr; }
    }
  `}</style>
);

const Field = ({ label, className = "", hint, ...props }) => (
  <div className={`had-field ${className}`.trim()}>
    <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '8px', display: 'block' }}>{label}</label>
    <input className="had-field-input" {...props} />
    {hint && <div className="had-field-hint" style={{ fontSize: '10px', color: 'var(--muted-foreground)', marginTop: '4px' }}>{hint}</div>}
  </div>
);

const emptyBranchForm = { branchName: "", branchAddress: "", branchContactNumber: "", branchEmail: "" };
const emptyAdminForm  = { username: "", name: "", email: "", branchName: "" };
const emptyDoctorForm = { username: "", name: "", specialization: "", email: "", consultationFee: "", branchName: "" };

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
  const [selectedTab, setSelectedTab]         = useState("Branch");

  const [branchForm, setBranchForm] = useState(emptyBranchForm);
  const [adminForm,  setAdminForm]  = useState(emptyAdminForm);
  const [doctorForm, setDoctorForm] = useState(emptyDoctorForm);
  const [branchNameSuggestions,     setBranchNameSuggestions]     = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [departmentTemplates, setDepartmentTemplates] = useState([]);
  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    accentColor: "var(--primary)",
    bgColor: "var(--secondary)",
    icon: "DEPT",
    sections: [
      { title: "Overview", icon: "📋", items: ["Specialized medical care"] },
      { title: "Team", icon: "👥", items: ["Expert Doctors"] }
    ],
  });
  const [departmentSubmitting, setDepartmentSubmitting] = useState(false);
  const [departmentError, setDepartmentError] = useState("");

  const refreshAll = async () => {
    setLoading(true); setSpinning(true);
    try { 
      const [overRes, deptRes] = await Promise.all([
        API.get("/head-admin/overview"),
        API.get("/head-admin/departments")
      ]);
      const items = Array.isArray(overRes.data) ? overRes.data : [];
      setOverview(items);
      if (items.length && !selectedBranchId) setSelectedBranchId(items[0].branchId);
      setDepartmentTemplates(Array.isArray(deptRes.data) ? deptRes.data : []);
      setError(""); 
    }
    catch (e) { setError("Failed to load dashboard data"); }
    finally { setLoading(false); setTimeout(() => setSpinning(false), 800); }
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/head-admin/createNewBranch", branchForm);
      setBranchForm(emptyBranchForm);
      refreshAll();
    } catch (err) {
      console.error(err);
      alert("Failed to create branch");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateDepartmentTemplate = async (e) => {
    e.preventDefault();
    setDepartmentSubmitting(true);
    try {
      await API.post("/head-admin/departments", {
        ...departmentForm,
        sectionsJson: JSON.stringify(departmentForm.sections)
      });
      setDepartmentForm({
        name: "",
        description: "",
        imageUrl: "",
        accentColor: "var(--primary)",
        bgColor: "var(--secondary)",
        icon: "DEPT",
        sections: [
          { title: "Overview", icon: "📋", items: ["Specialized medical care"] },
          { title: "Team", icon: "👥", items: ["Expert Doctors"] }
        ],
      });
      refreshAll();
    } catch (err) {
      console.error(err);
      alert("Failed to create department template");
    } finally {
      setDepartmentSubmitting(false);
    }
  };

  const addDeptSection = () => {
    setDepartmentForm({
      ...departmentForm,
      sections: [...departmentForm.sections, { title: "New Section", icon: "✨", items: ["Service 1"] }]
    });
  };

  const updateDeptSection = (idx, field, val) => {
    const next = [...departmentForm.sections];
    next[idx][field] = val;
    setDepartmentForm({ ...departmentForm, sections: next });
  };

  const removeDeptSection = (idx) => {
    setDepartmentForm({
      ...departmentForm,
      sections: departmentForm.sections.filter((_, i) => i !== idx)
    });
  };

  const addSectionItem = (sIdx) => {
    const next = [...departmentForm.sections];
    next[sIdx].items.push("New Item");
    setDepartmentForm({ ...departmentForm, sections: next });
  };

  const updateSectionItem = (sIdx, iIdx, val) => {
    const next = [...departmentForm.sections];
    next[sIdx].items[iIdx] = val;
    setDepartmentForm({ ...departmentForm, sections: next });
  };

  const handleOnboardAdmin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/head-admin/onBoardNewAdmin", adminForm);
      setAdminForm(emptyAdminForm);
      alert("Branch administrator successfully onboarded.");
      refreshAll();
    } catch (err) {
      console.error(err);
      alert("Failed to onboard administrator");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOnboardDoctor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...doctorForm,
        consultationFee: Number(doctorForm.consultationFee)
      };
      await API.post("/admin/onBoardNewDoctor", payload);
      setDoctorForm(emptyDoctorForm);
      alert("Clinical personnel successfully onboarded.");
      refreshAll();
    } catch (err) {
      console.error(err);
      alert("Failed to onboard clinical staff");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { refreshAll(); }, []);

  useEffect(() => {
    if (!selectedBranchId) return;
    const loadDetails = async () => {
      setDetailsLoading(true);
      try {
        const res = await API.get(`/head-admin/branch/${selectedBranchId}/details`);
        setDetails(res.data);
      } catch (e) { setDetailsError("Failed to load branch details"); }
      finally { setDetailsLoading(false); }
    };
    loadDetails();
  }, [selectedBranchId]);

  if (loading) return <PageLoader message="Accessing global systems..." />;

  const totalRev = overview.reduce((acc, b) => acc + (b.estimatedRevenue || 0), 0);

  return (
    <div className="had-root had-body">
      <FontLoader />
      <Header />
      <div className="max-w-[1400px] mx-auto px-6 pt-32 pb-20">
        
        {/* Hero */}
        <div className="had-hero mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="had-hero-sub">Global Operations</div>
              <h1 className="had-hero-title">Head <em>Administration</em></h1>
              <p className="had-hero-desc">Consolidated management of branches, personnel, and departmental protocols across the entire medical network.</p>
            </div>
            <button className="had-refresh-btn" onClick={refreshAll} disabled={spinning}>
              <RefreshCw size={16} className={spinning ? "had-spin" : ""} />
              Refresh Node
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="had-stat-grid mb-10">
          {[
            { label: 'Active Branches', value: overview.length, icon: Building2, type: 'teal' },
            { label: 'Total Personnel', value: overview.reduce((a, b) => a + (b.doctorCount || 0), 0), icon: Users, type: 'violet' },
            { label: 'Network Revenue', value: `₹${(totalRev / 100000).toFixed(1)}L`, icon: IndianRupee, type: 'gold' },
            { label: 'Active Depts', value: departmentTemplates.length, icon: Activity, type: 'rose' }
          ].map((s, i) => (
            <div key={i} className={`had-stat had-stat-${s.type}`}>
               <div className="had-stat-icon"><s.icon size={22} /></div>
               <div className="had-stat-label">{s.label}</div>
               <div className="had-stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Branches Table */}
          <div className="lg:col-span-8 space-y-10">
            <div className="had-card">
              <h2 className="had-section-title"><div className="had-section-title-dot" /> Branch List & Performance</h2>
              <table className="had-table">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Admins</th>
                    <th>Staff</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.map(b => (
                    <tr key={b.branchId} onClick={() => setSelectedBranchId(b.branchId)} className={selectedBranchId === b.branchId ? "had-table-row-active" : ""}>
                      <td>
                        <div className="had-branch-name">{b.branchName}</div>
                        <div className="had-branch-addr truncate max-w-[200px]">{b.branchAddress}</div>
                      </td>
                      <td>{b.adminCount}</td>
                      <td>{b.doctorCount}</td>
                      <td className="had-revenue">₹{b.estimatedRevenue?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Selected Branch Details */}
            {selectedBranchId && details && (
              <div className="had-card">
                 <h2 className="had-section-title"><div className="had-section-title-dot" /> Details: {details.branchName}</h2>
                 <div className="had-detail-grid">
                    <div className="had-detail-pane">
                       <div className="had-detail-pane-title">Branch Administrators <span className="had-detail-pane-count">{details.admins?.length || 0}</span></div>
                       <div className="had-scroll">
                         {details.admins?.map(adm => (
                           <div key={adm.id} className="had-detail-item">
                              <UserCog size={14} />
                              <div className="flex-1">
                                <div className="had-detail-name">{adm.name}</div>
                                <div className="had-detail-sub">{adm.email}</div>
                              </div>
                           </div>
                         ))}
                       </div>
                    </div>
                    <div className="had-detail-pane">
                       <div className="had-detail-pane-title">Clinical Staff <span className="had-detail-pane-count">{details.doctors?.length || 0}</span></div>
                       <div className="had-scroll">
                         {details.doctors?.map(doc => (
                           <div key={doc.id} className="had-detail-item">
                              <Stethoscope size={14} />
                              <div className="flex-1">
                                <div className="had-detail-name">{doc.name}</div>
                                <div className="had-detail-sub">{doc.specialization}</div>
                              </div>
                           </div>
                         ))}
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="lg:col-span-4 space-y-8">
            <div className="had-tabs">
              {['Branch', 'Admin', 'Doctor', 'Protocol'].map(t => (
                <div key={t} className={`had-tab ${selectedTab === t ? 'active' : ''}`} onClick={() => setSelectedTab(t)}>{t}</div>
              ))}
            </div>

            {selectedTab === 'Branch' && (
              <div className="had-form-card">
                <h3 className="had-form-title">Branch Operations</h3>
                <p className="had-form-subtitle mb-6">Initialize a new medical center</p>
                <form onSubmit={handleCreateBranch} className="space-y-4">
                  <Field label="Branch Name" value={branchForm.branchName} onChange={e => setBranchForm({...branchForm, branchName: e.target.value})} required />
                  <Field label="Postal Address" value={branchForm.branchAddress} onChange={e => setBranchForm({...branchForm, branchAddress: e.target.value})} required />
                  <Field label="Contact Number" value={branchForm.branchContactNumber} onChange={e => setBranchForm({...branchForm, branchContactNumber: e.target.value})} required />
                  <Field label="Branch Email" type="email" value={branchForm.branchEmail} onChange={e => setBranchForm({...branchForm, branchEmail: e.target.value})} required />
                  <button className="had-btn-teal" type="submit" disabled={submitting}>Onboard Branch</button>
                </form>
              </div>
            )}

            {selectedTab === 'Admin' && (
              <div className="had-form-card">
                <h3 className="had-form-title">Admin Management</h3>
                <p className="had-form-subtitle mb-6">Assign branch administrator</p>
                <form onSubmit={handleOnboardAdmin} className="space-y-4">
                  <Field label="Username" value={adminForm.username} onChange={e => setAdminForm({...adminForm, username: e.target.value})} required />
                  <Field label="Full Name" value={adminForm.name} onChange={e => setAdminForm({...adminForm, name: e.target.value})} required />
                  <Field label="Email Address" type="email" value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} required />
                  <div className="had-field">
                    <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '8px', display: 'block' }}>Branch</label>
                    <select className="had-field-input" value={adminForm.branchName} onChange={e => setAdminForm({...adminForm, branchName: e.target.value})} required>
                      <option value="">Select Branch</option>
                      {overview.map(b => (
                        <option key={b.branchId} value={b.branchName}>{b.branchName}</option>
                      ))}
                    </select>
                  </div>
                  <button className="had-btn-teal" type="submit" disabled={submitting}>Link Administrator</button>
                </form>
              </div>
            )}

            {selectedTab === 'Doctor' && (
              <div className="had-form-card">
                <h3 className="had-form-title">Staff Credentials</h3>
                <p className="had-form-subtitle mb-6">Onboard clinical personnel</p>
                <form onSubmit={handleOnboardDoctor} className="space-y-4">
                  <Field label="Username" value={doctorForm.username} onChange={e => setDoctorForm({...doctorForm, username: e.target.value})} required />
                  <Field label="Full Name" value={doctorForm.name} onChange={e => setDoctorForm({...doctorForm, name: e.target.value})} required />
                  <Field label="Specialization" value={doctorForm.specialization} onChange={e => setDoctorForm({...doctorForm, specialization: e.target.value})} required />
                  <Field label="Email" type="email" value={doctorForm.email} onChange={e => setDoctorForm({...doctorForm, email: e.target.value})} required />
                  <Field label="Consultation Fee (₹)" type="number" min="0" value={doctorForm.consultationFee} onChange={e => setDoctorForm({...doctorForm, consultationFee: e.target.value})} required />
                  <div className="had-field">
                    <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '8px', display: 'block' }}>Assigned Branch</label>
                    <select className="had-field-input" value={doctorForm.branchName} onChange={e => setDoctorForm({...doctorForm, branchName: e.target.value})} required>
                      <option value="">Select Branch</option>
                      {overview.map(b => (
                        <option key={b.branchId} value={b.branchName}>{b.branchName}</option>
                      ))}
                    </select>
                  </div>
                  <button className="had-btn-teal" type="submit" disabled={submitting}>Register Personnel</button>
                </form>
              </div>
            )}

            {selectedTab === 'Protocol' && (
              <div className="had-form-card">
                <h3 className="had-form-title">Dept Protocol</h3>
                <p className="had-form-subtitle mb-6">Create global department template</p>
                <form onSubmit={handleCreateDepartmentTemplate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Dept Name" value={departmentForm.name} onChange={e => setDepartmentForm({...departmentForm, name: e.target.value})} required />
                    <Field label="Icon / Code" value={departmentForm.icon} onChange={e => setDepartmentForm({...departmentForm, icon: e.target.value})} required />
                  </div>
                  <Field label="Description" value={departmentForm.description} onChange={e => setDepartmentForm({...departmentForm, description: e.target.value})} required />
                  <Field label="Image URL" value={departmentForm.imageUrl} onChange={e => setDepartmentForm({...departmentForm, imageUrl: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Accent Color" value={departmentForm.accentColor} onChange={e => setDepartmentForm({...departmentForm, accentColor: e.target.value})} />
                    <Field label="Bg Color" value={departmentForm.bgColor} onChange={e => setDepartmentForm({...departmentForm, bgColor: e.target.value})} />
                  </div>

                  <div className="border-t border-dashed border-[var(--border)] pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black uppercase text-[var(--muted)]">Sections & Guidelines</span>
                      <button type="button" onClick={addDeptSection} className="text-[10px] bg-[var(--primary)] text-white px-2 py-1 rounded-sm">+ Add Section</button>
                    </div>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                       {departmentForm.sections.map((s, si) => (
                         <div key={si} className="p-3 bg-[var(--background)] rounded-lg border border-[var(--border)] relative">
                            <button type="button" onClick={() => removeDeptSection(si)} className="absolute top-2 right-2 text-rose-500 text-[10px]">✕</button>
                            <div className="flex gap-2 mb-2">
                              <input className="had-field-input !py-1 text-xs" value={s.title} onChange={e => updateDeptSection(si, 'title', e.target.value)} placeholder="Title" />
                              <input className="had-field-input !py-1 text-xs w-12 text-center" value={s.icon} onChange={e => updateDeptSection(si, 'icon', e.target.value)} placeholder="Icon" />
                            </div>
                            <div className="space-y-1">
                               {s.items.map((it, ii) => (
                                 <input key={ii} className="had-field-input !py-1 text-[11px] !bg-white/50" value={it} onChange={e => updateSectionItem(si, ii, e.target.value)} placeholder="Item text" />
                               ))}
                               <button type="button" onClick={() => addSectionItem(si)} className="text-[9px] text-[var(--primary)] mt-1 opacity-70 hover:opacity-100">+ Add Item</button>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>

                  <button className="had-btn-slate !mt-6" type="submit" disabled={departmentSubmitting}>Register Global Template</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadAdminPanel;
