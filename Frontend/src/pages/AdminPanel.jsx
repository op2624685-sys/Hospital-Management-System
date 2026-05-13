import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import API from "../api/api";
import adminApi from "../api/admin";
import { gsap } from "gsap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  AppointmentsTrendChart, 
  DepartmentLoadChart, 
  StatusDoughnut,
  PaymentsGrowthChart
} from "../components/DashboardCharts";


// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => n >= 100000
  ? `₹${(n / 100000).toFixed(1)}L`
  : n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`;

const statusColor = {
  Completed:    { bg: "color-mix(in srgb, var(--primary) 10%, transparent)", color: "var(--primary)", dot: "var(--primary)" },
  "In Progress":{ bg: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--primary)", dot: "var(--chart-5)" },
  Pending:      { bg: "var(--secondary)", color: "var(--secondary-foreground)", dot: "var(--primary)" },
  Confirmed:    { bg: "var(--secondary)", color: "var(--primary)", dot: "var(--primary)" },
  Cancelled:    { bg: "color-mix(in srgb, var(--destructive) 10%, transparent)", color: "var(--destructive)", dot: "var(--destructive)" },
  Success:      { bg: "color-mix(in srgb, var(--primary) 10%, transparent)", color: "var(--primary)", dot: "var(--primary)" },
  Refunded:     { bg: "var(--muted)", color: "var(--muted-foreground)", dot: "var(--muted-foreground)" },
};

const formatStatus = (status) => {
  if (!status) return "Pending";
  const upper = String(status).toUpperCase();
  if (upper === "PENDING") return "Pending";
  if (upper === "CONFIRMED") return "Confirmed";
  if (upper === "IN_PROGRESS") return "In Progress";
  if (upper === "CANCELLED") return "Cancelled";
  return String(status);
};

const formatTime = (value) => {
  if (!value) return "—";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleString();
};

const deptColor = {
  Cardiology:   "var(--primary)",
  Neurology:    "var(--chart-5)",
  Pediatrics:   "var(--chart-4)",
  Orthopedics:  "var(--chart-3)",
  Dental:       "var(--chart-2)",
  Oncology:     "var(--chart-1)",
  General:      "var(--muted-foreground)",
  default:      "var(--primary)"
};

const DEFAULT_DEPARTMENT_SECTIONS = [
  {
    title: "About",
    icon: "📋",
    items: ["Department providing specialized medical services"],
  },
  {
    title: "Team",
    icon: "👥",
    items: ["Head Doctor: TBD", "Total Members: 0", "Specialized medical professionals"],
  },
  {
    title: "Services",
    icon: "⚕️",
    items: ["Specialized medical care", "Patient consultation", "Treatment and diagnosis", "Follow-up support"],
  },
];

const DEPT_LIMITS = {
  name: 100,
  description: 2000,
  imageUrl: 2000,
  accentColor: 20,
  bgColor: 20,
  icon: 20,
  sectionsJson: 10000,
};

const EMPTY_STATS = {
  totalDoctors: 0,
  activeDoctors: 0,
  totalPatients: 0,
  todayAppointments: 0,
  pendingAppointments: 0,
  completedAppointments: 0,
  totalRevenue: 0,
  todayRevenue: 0,
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
      {action && (
        typeof action === "string" ? (
          <button className="admin-view-all">{action}</button>
        ) : (
          <button className="admin-view-all" onClick={action.onClick}>
            {action.label}
          </button>
        )
      )}
    </div>
    {children}
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const AdminPanel = () => {
  const queryClient = useQueryClient();
  const [stats, setStats] = useState(EMPTY_STATS);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");
  const [appointmentsPage, setAppointmentsPage] = useState(0);
  const [overviewDoctors, setOverviewDoctors] = useState([]);
  const [departmentLoad, setDepartmentLoad] = useState([]);
  const [weeklyAppointments, setWeeklyAppointments] = useState([]);
  const [revenueGrowth, setRevenueGrowth] = useState([]);

  const [doctors, setDoctors] = useState([]);
  const [doctorPage, setDoctorPage] = useState(0);
  const [doctorSearch, setDoctorSearch] = useState("");
  const doctorSpec = "";
  const doctorSort = "name";
  const [payments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    accentColor: "var(--primary)",
    bgColor: "var(--secondary)",
    icon: "DEPT",
    sections: DEFAULT_DEPARTMENT_SECTIONS,
  });
  const [headDoctorName, setHeadDoctorName] = useState("");
  const [headDoctorSuggestions, setHeadDoctorSuggestions] = useState([]);
  const [headDoctorError, setHeadDoctorError] = useState("");
  const [departmentDoctorName, setDepartmentDoctorName] = useState("");
  const [departmentDoctorSuggestions, setDepartmentDoctorSuggestions] = useState([]);
  const [selectedDepartmentDoctors, setSelectedDepartmentDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState("");
  const [departmentTemplates, setDepartmentTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [doctorForm, setDoctorForm] = useState({
    username: "",
    name: "",
    specialization: "",
    email: "",
    consultationFee: "",
  });
  const [doctorSubmitting, setDoctorSubmitting] = useState(false);
  const [doctorMessage, setDoctorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [_totalPatients, _setTotalPatients] = useState(0);
  const headerRef = useRef(null);

  const tabs = ["overview", "appointments", "doctors", "payments", "patients", "departments"];

  const getApiErrorMessage = (err, fallback) => {

    return err?.response?.data?.error || err?.response?.data?.message || fallback;
  };

  const validateDepartmentPayload = () => {
    const errors = [];
    if (formData.description && formData.description.length > DEPT_LIMITS.description) {
      errors.push(`Description must be at most ${DEPT_LIMITS.description} characters`);
    }
    if (formData.imageUrl && formData.imageUrl.length > DEPT_LIMITS.imageUrl) {
      errors.push(`Image URL must be at most ${DEPT_LIMITS.imageUrl} characters`);
    }
    const sectionsJson = JSON.stringify(formData.sections || []);
    return { errors, sectionsJson };
  };

  const patientsQuery = useQuery({
    queryKey: ["admin-patients", currentPage],
    queryFn: async () => {
      const response = await adminApi.getPatients(currentPage, 10);
      return response.data;
    },
    enabled: activeTab === "patients",
  });

  const doctorsQuery = useQuery({
    queryKey: ["admin-doctors", doctorPage, doctorSearch.trim(), doctorSpec.trim(), doctorSort],
    queryFn: async () => {
      const response = await adminApi.getDoctors({
        page: doctorPage,
        size: 10,
        search: doctorSearch.trim() || undefined,
        specialization: doctorSpec.trim() || undefined,
        sort: doctorSort,
      });
      return response.data || [];
    },
    enabled: activeTab === "doctors",
  });

  const departmentsQuery = useQuery({
    queryKey: ["admin-departments"],
    queryFn: async () => {
      const response = await adminApi.getDepartments();
      return response.data || [];
    },
    enabled: activeTab === "departments",
  });

  const templatesQuery = useQuery({
    queryKey: ["admin-department-templates"],
    queryFn: async () => {
      const response = await adminApi.getDepartmentTemplates();
      return response.data || [];
    },
    enabled: activeTab === "departments",
  });

  const overviewQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const response = await adminApi.getOverview();
      return response.data || {};
    },
    enabled: activeTab === "overview",
  });

  const appointmentsQuery = useQuery({
    queryKey: ["admin-appointments", appointmentsPage],
    queryFn: async () => {
      const response = await adminApi.getAppointments(appointmentsPage, 10);
      return response.data || [];
    },
    enabled: activeTab === "appointments" || activeTab === "overview",
  });


  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: .6, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    if (activeTab === "overview" && overviewQuery.data) {
      const data = overviewQuery.data;
      if (data.stats) {
        setStats((prev) => ({
          ...prev,
          ...data.stats
        }));
      }
      setOverviewDoctors(data.recentDoctors || []);
      setDepartmentLoad(data.departmentLoad || []);
      setWeeklyAppointments(data.weeklyAppointments || []);
      setRevenueGrowth(data.revenueGrowth || []);
    }

  }, [activeTab, overviewQuery.data]);

  useEffect(() => {
    if (activeTab === "appointments" || activeTab === "overview") {
      setAppointmentsLoading(appointmentsQuery.isFetching);
      setAppointments(appointmentsQuery.data || []);
    }
  }, [activeTab, appointmentsQuery.data, appointmentsQuery.isFetching]);

  useEffect(() => {
    if (activeTab !== "patients") return;
    setLoading(patientsQuery.isFetching);
    if (!patientsQuery.data) return;
    setPatients(patientsQuery.data.content || patientsQuery.data);
    _setTotalPatients(patientsQuery.data.totalElements || (patientsQuery.data || []).length || 0);
  }, [activeTab, patientsQuery.isFetching, patientsQuery.data]);

  useEffect(() => {
    if (activeTab !== "doctors") return;
    if (doctorsQuery.data) {
      setDoctors(doctorsQuery.data || []);
    }
  }, [activeTab, doctorsQuery.data]);


  return (
    <>
      <style>{`
        .admin-root, .admin-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        .admin-page { min-height: 100vh; background: transparent; color: var(--foreground); overflow-x: hidden; position: relative; }
        .admin-container { position: relative; z-index: 10; max-width: 1400px; margin: 0 auto; padding: 120px 48px 80px; }
        .admin-topbar { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; gap: 24px; flex-wrap: wrap; }
        .admin-eyebrow { display: inline-flex; align-items: center; gap: 10px; padding: 8px 20px; border-radius: 999px; background: var(--secondary); border: 1.5px solid color-mix(in srgb, var(--primary) 20%, transparent); color: var(--primary); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; }
        .admin-live { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; animation: adminPulse 2s infinite; }
        @keyframes adminPulse { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); } 70% { box-shadow: 0 0 0 10px rgba(34,197,94,0); } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); } }
        .admin-title { font-size: clamp(2.4rem, 5vw, 3.8rem); font-weight: 900; color: var(--foreground); line-height: 1.0; letter-spacing: -.03em; margin: 0; }
        .admin-title em { font-style: italic; color: var(--primary); font-family: serif; }
        .admin-date { font-size: 14px; color: var(--muted-foreground); margin-top: 8px; font-weight: 600; }
        .admin-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--card); border: 1.5px solid var(--border); padding: 10px 18px; border-radius: 14px; font-size: 12px; font-weight: 800; color: var(--foreground); }
        .admin-refresh-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--primary); color: var(--primary-foreground); border: none; padding: 12px 24px; border-radius: 14px; font-size: 13px; font-weight: 800; cursor: pointer; transition: all .2s; box-shadow: 0 10px 25px -5px color-mix(in srgb, var(--primary) 40%, transparent); }
        .admin-tabs { display: flex; gap: 10px; margin-bottom: 48px; background: var(--card); padding: 8px; border-radius: 20px; border: 1.5px solid var(--border); overflow-x: auto; }
        .admin-tab { padding: 12px 24px; border-radius: 14px; border: none; background: transparent; font-size: 13px; font-weight: 800; color: var(--muted-foreground); cursor: pointer; transition: all .2s; text-transform: uppercase; }
        .admin-tab.active { background: var(--primary); color: var(--primary-foreground); }
        .admin-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px; }
        .admin-stat-card { position: relative; background: var(--card); border: 1.5px solid var(--border); padding: 28px; border-radius: 24px; display: flex; align-items: flex-start; gap: 20px; overflow: hidden; transition: all .3s; }
        .admin-stat-icon { width: 52px; height: 52px; border-radius: 16px; background: var(--secondary); display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .admin-stat-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 4px; }
        .admin-stat-value { font-size: 28px; font-weight: 900; color: var(--foreground); line-height: 1; }
        .admin-sections-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 32px; }
        .admin-section { grid-column: span 6; background: var(--card); border: 1.5px solid var(--border); border-radius: 32px; padding: 32px; }
        .admin-section.full { grid-column: span 12; }
        .admin-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1.5px solid var(--border); }
        .admin-section-title { font-size: 20px; font-weight: 900; color: var(--foreground); }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { text-align: left; padding: 16px; font-size: 11px; font-weight: 800; color: var(--muted-foreground); text-transform: uppercase; border-bottom: 1.5px solid var(--border); }
        .admin-table td { padding: 18px 16px; border-bottom: 1.5px solid var(--border); }
        .admin-status-pill { padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; }
        .admin-progress-track { height: 8px; background: var(--secondary); border-radius: 999px; overflow: hidden; margin-top: 8px; }
        .admin-progress-fill { height: 100%; transition: width 1s ease-out; }
        @media (max-width: 1200px) { .admin-stats-grid { grid-template-columns: repeat(2, 1fr); } .admin-sections-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="admin-page">
        <Header />
        <div className="admin-container" ref={headerRef} style={{ opacity: 0 }}>
          <div className="admin-topbar">
            <div className="admin-topbar-left">
              <div className="admin-eyebrow"><div className="admin-live" />HMS Hospital · Admin Panel {overviewQuery.isLoading && "(Loading Data...)"}</div>
              <h1 className="admin-title">Control <em>Centre</em></h1>

              <p className="admin-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="admin-topbar-right">
              <div className="admin-badge">Administrator</div>
              <button className="admin-refresh-btn" onClick={() => window.location.reload()}>Refresh</button>
            </div>
          </div>

          <div className="admin-tabs">
            {tabs.map(t => (
              <button key={t} className={`admin-tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
            ))}
          </div>

          <div className="admin-stats-grid">
            <StatCard delay={0}    label="Total Doctors" value={stats.totalDoctors} sub={`${stats.activeDoctors} active`} icon="👨‍⚕️" accent="var(--primary)" />
            <StatCard delay={0.08} label="Total Patients" value={(stats.totalPatients || 0).toLocaleString()} sub="Registered" icon="🏥" accent="var(--chart-5)" />
            <StatCard delay={0.16} label="Today's Appointments" value={stats.todayAppointments || 0} sub={`${stats.pendingAppointments || 0} pending`} icon="📅" accent="var(--primary)" />
            <StatCard delay={0.24} label="Total Revenue" value={fmt(stats.totalRevenue || 0)} sub="Gross earnings" icon="💰" accent="var(--chart-5)" />

          </div>

          <div className="admin-sections-grid">
            {activeTab === "overview" && (
              <>
                <div className="admin-section full">
                  <Section title="Real-time Activity" subtitle="Weekly performance insights">
                    <div style={{ minHeight: '320px', height: '320px', marginTop: '20px', position: 'relative', width: '100%' }}>
                      <AppointmentsTrendChart key={`atc-${weeklyAppointments.length}`} data={weeklyAppointments} />
                    </div>
                  </Section>
                </div>
                <div className="admin-section">
                  <Section title="Department Load" subtitle="Patient distribution">
                    <div style={{ display: 'flex', gap: '30px', alignItems: 'center', minHeight: '300px', position: 'relative', width: '100%' }}>
                      <div style={{ flex: 1, height: '260px' }}><DepartmentLoadChart key={`dlc-${departmentLoad.length}`} data={departmentLoad} /></div>
                      <div style={{ flex: 1 }}>
                        {departmentLoad.slice(0, 4).map(d => (
                          <div key={d.name} style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800 }}>
                              <span style={{ color: deptColor[d.name] || deptColor.default }}>{d.name}</span>
                              <span>{d.patientCount || 0}</span>
                            </div>
                            <div className="admin-progress-track">
                              <div className="admin-progress-fill" style={{ width: `${Math.min(100, ((d.patientCount || 0)/10)*100)}%`, background: deptColor[d.name] || deptColor.default }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Section>
                </div>
                <div className="admin-section">
                  <Section title="Appointment Status" subtitle="Capacity distribution">
                    <div style={{ height: '300px', minHeight: '300px', position: 'relative', width: '100%' }}>
                      <StatusDoughnut key={`sd-${stats.totalAppointments || 0}`} stats={stats} />
                    </div>
                  </Section>
                </div>

                <div className="admin-section">
                  <Section title="Payments Growth" subtitle="Monthly revenue trend">
                    <div style={{ height: '300px', minHeight: '300px', marginTop: '10px', position: 'relative', width: '100%' }}>
                      <PaymentsGrowthChart key={`pgc-${revenueGrowth.length}`} data={revenueGrowth} />
                    </div>
                  </Section>
                </div>



              </>
            )}

            {activeTab === "appointments" && (
              <div className="admin-section full">
                <Section title="Appointments" subtitle="Manage hospital visits">
                  <table className="admin-table">
                    <thead><tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Time</th><th>Status</th></tr></thead>
                    <tbody>
                      {appointments.map(apt => (
                        <tr key={apt.id}>
                          <td className="admin-apt-id">#{apt.id}</td>
                          <td>{apt.patient?.name}</td>
                          <td>Dr. {apt.doctor?.name}</td>
                          <td>{formatTime(apt.appointmentTime)}</td>
                          <td>
                            <span className="admin-status-pill" style={{ background: statusColor[formatStatus(apt.status)]?.bg, color: statusColor[formatStatus(apt.status)]?.color }}>
                              {formatStatus(apt.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Section>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2500} />
    </>
  );
};

export default AdminPanel;
