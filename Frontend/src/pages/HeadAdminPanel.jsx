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
      background: var(--background);
      border: 1.5px solid var(--border);
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 14px;
      color: var(--foreground);
      outline: none;
      transition: all 0.2s;
    }
    .had-field-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 12%, transparent);
    }
    
    .had-btn-teal { background: var(--primary); color: #fff; }
    .had-btn-slate { background: var(--secondary); color: var(--primary); border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent); }
    .had-detail-pane { background: var(--sidebar); border: 1px solid var(--border); }
    .had-detail-item { border-bottom: 1px solid var(--border); }
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
          <div className="lg:col-span-4 space-y-10">
            <div className="had-form-card">
              <h3 className="had-form-title">Branch Operations</h3>
              <p className="had-form-subtitle mb-6">Initialize a new medical center</p>
              <form onSubmit={handleCreateBranch} className="space-y-4">
                 <Field label="Branch Name" value={branchForm.branchName} onChange={e => setBranchForm({...branchForm, branchName: e.target.value})} required />
                 <Field label="Postal Address" value={branchForm.branchAddress} onChange={e => setBranchForm({...branchForm, branchAddress: e.target.value})} required />
                 <button className="had-btn had-btn-teal" type="submit" disabled={submitting}>Onboard Branch</button>
              </form>
            </div>

            <div className="had-form-card">
               <h3 className="had-form-title">Dept Protocol</h3>
               <p className="had-form-subtitle mb-6">Create global department template</p>
               <form onSubmit={handleCreateDepartmentTemplate} className="space-y-4">
                  <Field label="Dept Name" value={departmentForm.name} onChange={e => setDepartmentForm({...departmentForm, name: e.target.value})} required />
                  <Field label="Icon / Code" value={departmentForm.icon} onChange={e => setDepartmentForm({...departmentForm, icon: e.target.value})} required />
                  <button className="had-btn had-btn-slate" type="submit" disabled={departmentSubmitting}>Register Template</button>
               </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadAdminPanel;
