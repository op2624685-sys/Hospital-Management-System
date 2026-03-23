import { useState, useEffect } from "react";

const DEPT_COLORS = {
  Cardiology: { bg: "#FEF2F2", accent: "#DC2626", light: "#FCA5A5", icon: "🫀" },
  Neurology: { bg: "#EEF2FF", accent: "#4F46E5", light: "#A5B4FC", icon: "🧠" },
  Orthopedics: { bg: "#F0FDF4", accent: "#16A34A", light: "#86EFAC", icon: "🦴" },
  Pediatrics: { bg: "#FFF7ED", accent: "#EA580C", light: "#FDBA74", icon: "👶" },
  Oncology: { bg: "#FDF4FF", accent: "#9333EA", light: "#D8B4FE", icon: "🔬" },
  Emergency: { bg: "#FFF1F2", accent: "#E11D48", light: "#FDA4AF", icon: "🚨" },
};

const MOCK_DEPT = {
  name: "Cardiology",
  branch: "City General Hospital — North Wing, Floor 4",
  established: "2008",
  totalPatients: 1284,
  totalDoctors: 14,
  totalAdmins: 3,
  pendingAppointments: 47,
  image: null,
};

const MOCK_DOCTORS = [
  { id: 1, name: "Dr. Sarah Mitchell", specialty: "Interventional Cardiology", status: "active", patients: 92, joined: "2019-03" },
  { id: 2, name: "Dr. James Okafor", specialty: "Electrophysiology", status: "active", patients: 74, joined: "2020-07" },
  { id: 3, name: "Dr. Priya Nair", specialty: "Cardiac Surgery", status: "on-leave", patients: 61, joined: "2017-11" },
  { id: 4, name: "Dr. Elena Vasquez", specialty: "Echocardiography", status: "active", patients: 88, joined: "2021-02" },
  { id: 5, name: "Dr. Marcus Chen", specialty: "Heart Failure", status: "active", patients: 55, joined: "2022-05" },
  { id: 6, name: "Dr. Yuki Tanaka", specialty: "Preventive Cardiology", status: "active", patients: 43, joined: "2023-01" },
];

const MOCK_APPOINTMENTS = Array.from({ length: 58 }, (_, i) => ({
  id: i + 1,
  patient: ["Aiden Brooks", "Clara Singh", "Mohammed Al-Hassan", "Fatima Osei", "Liam Park", "Nora Johansson", "Raj Patel", "Sofia Lima", "Chen Wei", "Amara Diallo"][i % 10],
  doctor: MOCK_DOCTORS[i % 6].name,
  date: new Date(2025, 5, (i % 28) + 1).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  time: `${String(8 + (i % 9)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"} AM`,
  type: ["Consultation", "Follow-up", "Procedure", "Emergency", "Screening"][i % 5],
  status: ["confirmed", "pending", "completed", "cancelled"][i % 4],
  reason: ["Chest pain", "Arrhythmia", "Post-op review", "Hypertension", "ECG check"][i % 5],
}));

const STATUS_STYLES = {
  confirmed: { bg: "#D1FAE5", text: "#065F46", label: "Confirmed" },
  pending: { bg: "#FEF9C3", text: "#854D0E", label: "Pending" },
  completed: { bg: "#E0E7FF", text: "#3730A3", label: "Completed" },
  cancelled: { bg: "#FEE2E2", text: "#991B1B", label: "Cancelled" },
  active: { bg: "#D1FAE5", text: "#065F46", label: "Active" },
  "on-leave": { bg: "#FEF9C3", text: "#854D0E", label: "On Leave" },
};

const ITEMS_PER_PAGE = 8;

function Avatar({ name, size = 36, color = "#4F46E5" }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const light = color + "22";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: light, border: `1.5px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 600, color, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
      {initials}
    </div>
  );
}

function Badge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span style={{ background: s.bg, color: s.text, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.2 }}>{s.label}</span>
  );
}

function StatCard({ label, value, sub, color = "#4F46E5", icon }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 8, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -10, right: -10, fontSize: 48, opacity: 0.07 }}>{icon}</div>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", letterSpacing: 0.8, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
      <span style={{ fontSize: 32, fontWeight: 700, color, fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: "#64748B", fontFamily: "'DM Sans', sans-serif" }}>{sub}</span>}
    </div>
  );
}

function AddDoctorModal({ onClose }) {
  const [form, setForm] = useState({ name: "", specialty: "", email: "" });
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "32px 36px", width: 420, boxShadow: "0 24px 64px rgba(15,23,42,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#0F172A" }}>Add Doctor to Department</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94A3B8" }}>✕</button>
        </div>
        {["Doctor Full Name", "Specialty", "Email Address"].map((label, i) => (
          <div key={label} style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.4, textTransform: "uppercase" }}>{label}</label>
            <input placeholder={label} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box", color: "#0F172A" }} />
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#64748B", fontSize: 14 }}>Cancel</button>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "#4F46E5", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#fff", fontSize: 14 }}>Add Doctor</button>
        </div>
      </div>
    </div>
  );
}

function DoctorsPanel({ color }) {
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      {showModal && <AddDoctorModal onClose={() => setShowModal(false)} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#0F172A" }}>Department Doctors</h3>
        <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", background: color, border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#fff", fontSize: 13 }}>
          <span style={{ fontSize: 16 }}>+</span> Add Doctor
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {MOCK_DOCTORS.map(doc => (
          <div key={doc.id} style={{ background: "#fff", border: "1px solid #F1F5F9", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, transition: "border-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = color + "66"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#F1F5F9"}>
            <Avatar name={doc.name} size={44} color={color} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#0F172A", fontSize: 14 }}>{doc.name}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#64748B", fontSize: 12, marginTop: 2 }}>{doc.specialty}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color, fontWeight: 700 }}>{doc.patients}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#94A3B8" }}>patients</div>
            </div>
            <div style={{ marginLeft: 8 }}><Badge status={doc.status} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppointmentsPanel({ color }) {
  const [show, setShow] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? MOCK_APPOINTMENTS : MOCK_APPOINTMENTS.filter(a => a.status === filter);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const TYPE_COLORS = { Consultation: "#4F46E5", "Follow-up": "#0891B2", Procedure: "#7C3AED", Emergency: "#DC2626", Screening: "#059669" };

  if (!show) return (
    <div style={{ textAlign: "center", padding: "48px 24px", background: "#fff", borderRadius: 20, border: "1px solid #F1F5F9" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
      <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#0F172A", marginBottom: 8 }}>Patient Appointments</h3>
      <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#64748B", marginBottom: 24, fontSize: 14 }}>View all scheduled appointments across the department.</p>
      <button onClick={() => setShow(true)} style={{ padding: "12px 28px", background: color, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14 }}>
        View All Appointments →
      </button>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h3 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#0F172A" }}>
          All Appointments <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: 14, color: "#94A3B8" }}>({filtered.length} total)</span>
        </h3>
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "confirmed", "pending", "completed", "cancelled"].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${filter === f ? color : "#E2E8F0"}`, background: filter === f ? color : "#fff", color: filter === f ? "#fff" : "#64748B", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: "capitalize", transition: "all 0.15s" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              {["Patient", "Doctor", "Date & Time", "Type", "Reason", "Status"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 0.8, textTransform: "uppercase", borderBottom: "1px solid #F1F5F9" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((apt, idx) => (
              <tr key={apt.id} style={{ borderBottom: idx < paged.length - 1 ? "1px solid #F8FAFC" : "none" }}
                onMouseEnter={e => e.currentTarget.style.background = "#FAFBFF"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={apt.patient} size={32} color={color} />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{apt.patient}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#334155" }}>{apt.doctor.replace("Dr. ", "Dr.")}</td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0F172A", fontWeight: 600 }}>{apt.date}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#94A3B8" }}>{apt.time}</div>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ background: (TYPE_COLORS[apt.type] || "#4F46E5") + "15", color: TYPE_COLORS[apt.type] || "#4F46E5", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{apt.type}</span>
                </td>
                <td style={{ padding: "14px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#64748B" }}>{apt.reason}</td>
                <td style={{ padding: "14px 16px" }}><Badge status={apt.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #F1F5F9" }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#94A3B8" }}>
            Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: 34, height: 34, borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1, fontFamily: "'DM Sans', sans-serif", color: "#64748B", fontSize: 14 }}>‹</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${page === p ? color : "#E2E8F0"}`, background: page === p ? color : "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: page === p ? "#fff" : "#64748B", fontSize: 13 }}>{p}</button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ width: 34, height: 34, borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1, fontFamily: "'DM Sans', sans-serif", color: "#64748B", fontSize: 14 }}>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DepartmentControl() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dept] = useState(MOCK_DEPT);
  const colors = DEPT_COLORS[dept.name] || DEPT_COLORS.Cardiology;
  const color = colors.accent;

  const NAV_TABS = [
    { id: "overview", label: "Overview", emoji: "🏥" },
    { id: "doctors", label: "Doctors", emoji: "👨‍⚕️" },
    { id: "appointments", label: "Appointments", emoji: "📋" },
  ];

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top Navbar */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #F1F5F9", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏥</div>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#0F172A" }}>MediCore HMS</span>
          </div>
          <div style={{ width: 1, height: 28, background: "#E2E8F0" }} />
          {["Dashboard", "Patients", "Doctors", "Schedule"].map(item => (
            <button key={item} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#64748B", padding: "4px 0", fontWeight: 500 }}>{item}</button>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: color + "15", borderRadius: 20, border: `1.5px solid ${color}33` }}>
            <span style={{ fontSize: 13 }}>🏛️</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color }}>Department Control</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Dr. Alex Morgan</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color, fontWeight: 600 }}>Head of {dept.name}</div>
          </div>
          <Avatar name="Dr. Alex Morgan" size={38} color={color} />
        </div>
      </nav>

      {/* Hero Banner */}
      <div style={{ background: `linear-gradient(135deg, ${color}08 0%, ${color}18 100%)`, borderBottom: `3px solid ${color}22`, padding: "36px 40px", display: "flex", alignItems: "center", gap: 28, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 40, top: -20, fontSize: 160, opacity: 0.06 }}>{colors.icon}</div>
        <div style={{ width: 88, height: 88, borderRadius: 24, background: `linear-gradient(135deg, ${color}22, ${color}44)`, border: `3px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, flexShrink: 0 }}>
          {colors.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color, letterSpacing: 1.2, textTransform: "uppercase" }}>Department Control</span>
            <span style={{ background: color, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, letterSpacing: 0.5 }}>HEAD DOCTOR</span>
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 34, color: "#0F172A", margin: 0, marginBottom: 6 }}>{dept.name} Department</h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#64748B", margin: 0 }}>📍 {dept.branch} · Est. {dept.established}</p>
        </div>
        <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "14px 20px", textAlign: "center", border: `1px solid ${color}22`, minWidth: 80 }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color, fontWeight: 700 }}>{dept.totalPatients.toLocaleString()}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#94A3B8", fontWeight: 600, marginTop: 2 }}>PATIENTS</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 14, padding: "14px 20px", textAlign: "center", border: `1px solid ${color}22`, minWidth: 80 }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color, fontWeight: 700 }}>{dept.totalDoctors}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#94A3B8", fontWeight: 600, marginTop: 2 }}>DOCTORS</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 14, padding: "14px 20px", textAlign: "center", border: `1px solid ${color}22`, minWidth: 80 }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color, fontWeight: 700 }}>{dept.pendingAppointments}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#94A3B8", fontWeight: 600, marginTop: 2 }}>PENDING</div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F1F5F9", padding: "0 40px", display: "flex", gap: 0 }}>
        {NAV_TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 24px", border: "none", background: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: activeTab === tab.id ? color : "#94A3B8", borderBottom: `2.5px solid ${activeTab === tab.id ? color : "transparent"}`, transition: "all 0.15s", marginBottom: -1 }}>
            <span style={{ fontSize: 16 }}>{tab.emoji}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Page Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 40px" }}>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
              <StatCard label="Total Patients" value={dept.totalPatients.toLocaleString()} sub="All time registered" color={color} icon="👤" />
              <StatCard label="Active Doctors" value={dept.totalDoctors} sub={`${MOCK_DOCTORS.filter(d => d.status === "active").length} on duty today`} color={color} icon="👨‍⚕️" />
              <StatCard label="Admins" value={dept.totalAdmins} sub="Department admin staff" color={color} icon="🗂️" />
              <StatCard label="Appointments" value={dept.pendingAppointments} sub="Pending this week" color="#F59E0B" icon="📅" />
            </div>

            {/* Info Cards Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #F1F5F9", padding: "24px 28px" }}>
                <h3 style={{ margin: "0 0 20px", fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#0F172A" }}>Department Info</h3>
                {[
                  { label: "Branch", value: "City General Hospital" },
                  { label: "Location", value: "North Wing, Floor 4" },
                  { label: "Established", value: dept.established },
                  { label: "Head Doctor", value: "Dr. Alex Morgan" },
                  { label: "Specialization", value: dept.name },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F8FAFC" }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#94A3B8", fontWeight: 600 }}>{row.label}</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0F172A", fontWeight: 700 }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #F1F5F9", padding: "24px 28px" }}>
                <h3 style={{ margin: "0 0 20px", fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#0F172A" }}>Quick Actions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "View All Patient Appointments", emoji: "📋", tab: "appointments" },
                    { label: "Manage Department Doctors", emoji: "👨‍⚕️", tab: "doctors" },
                    { label: "Add New Doctor", emoji: "➕", tab: "doctors" },
                  ].map(action => (
                    <button key={action.label} onClick={() => setActiveTab(action.tab)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: colors.bg, border: `1.5px solid ${color}22`, borderRadius: 12, cursor: "pointer", textAlign: "left", transition: "border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = color + "66"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = color + "22"}>
                      <span style={{ fontSize: 20 }}>{action.emoji}</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{action.label}</span>
                      <span style={{ marginLeft: "auto", color, fontSize: 16 }}>→</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Doctors Preview */}
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #F1F5F9", padding: "24px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#0F172A" }}>Top Doctors by Patient Count</h3>
                <button onClick={() => setActiveTab("doctors")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color, fontWeight: 700 }}>See all →</button>
              </div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {[...MOCK_DOCTORS].sort((a, b) => b.patients - a.patients).slice(0, 4).map(doc => (
                  <div key={doc.id} style={{ flex: "1 1 180px", background: colors.bg, borderRadius: 14, padding: "16px", border: `1px solid ${color}18`, textAlign: "center" }}>
                    <Avatar name={doc.name} size={48} color={color} />
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, color: "#0F172A", marginTop: 10 }}>{doc.name}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#94A3B8", marginBottom: 8 }}>{doc.specialty}</div>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color, fontWeight: 700 }}>{doc.patients}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#94A3B8" }}>patients</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DOCTORS TAB */}
        {activeTab === "doctors" && <DoctorsPanel color={color} />}

        {/* APPOINTMENTS TAB */}
        {activeTab === "appointments" && <AppointmentsPanel color={color} />}
      </div>
    </div>
  );
}