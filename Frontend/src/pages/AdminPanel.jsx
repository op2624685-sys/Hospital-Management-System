import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "../components/Header";
import API from "../api/api";
import adminApi from "../api/admin";
import { gsap } from "gsap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  Orthopedics:  "var(--primary)",
  Pediatrics:   "var(--primary)",
  Dermatology:  "var(--chart-5)",
  default:      "var(--primary)",
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
  const [stats, setStats] = useState(MOCK.stats);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");
  const [appointmentsPage, setAppointmentsPage] = useState(0);
  const [overviewDoctors, setOverviewDoctors] = useState([]);
  const [departmentLoad, setDepartmentLoad] = useState([]);
  const [weeklyAppointments, setWeeklyAppointments] = useState([]);
  const [overviewError, setOverviewError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState("");
  const [doctorPage, setDoctorPage] = useState(0);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorSpec, setDoctorSpec] = useState("");
  const [doctorSort, setDoctorSort] = useState("name");
  const [payments] = useState(MOCK.payments);
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
  });
  const [doctorSubmitting, setDoctorSubmitting] = useState(false);
  const [doctorMessage, setDoctorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [_totalPatients, _setTotalPatients] = useState(0);
  const headerRef = useRef(null);

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
    if (formData.accentColor && formData.accentColor.length > DEPT_LIMITS.accentColor) {
      errors.push(`Accent color must be at most ${DEPT_LIMITS.accentColor} characters`);
    }
    if (formData.bgColor && formData.bgColor.length > DEPT_LIMITS.bgColor) {
      errors.push(`Background color must be at most ${DEPT_LIMITS.bgColor} characters`);
    }
    if (formData.icon && formData.icon.length > DEPT_LIMITS.icon) {
      errors.push(`Icon text must be at most ${DEPT_LIMITS.icon} characters`);
    }
    const sectionsJson = JSON.stringify(formData.sections || []);
    if (sectionsJson.length > DEPT_LIMITS.sectionsJson) {
      errors.push(`Sections must be at most ${DEPT_LIMITS.sectionsJson} characters`);
    }
    return { errors, sectionsJson };
  };

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getPatients(currentPage, 10);
      setPatients(response.data.content || response.data);
      _setTotalPatients(response.data.totalElements || response.data.length);
    } catch (error) {
      console.error("Error fetching patients:", error);
      alert(getApiErrorMessage(error, "Failed to load patients"));
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const fetchDoctors = useCallback(async (page = 0, size = 10, search = "", specialization = "", sort = "name") => {
    try {
      setDoctorsError("");
      setDoctorsLoading(true);
      const response = await adminApi.getDoctors({
        page,
        size,
        search: search || undefined,
        specialization: specialization || undefined,
        sort,
      });
      setDoctors(response.data || []);
    } catch (error) {
      setDoctorsError(getApiErrorMessage(error, "Failed to load doctors"));
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  }, []);

  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: .6, ease: "power3.out" }
    );
  }, []);

  // Fetch patients when tab changes to patients
  useEffect(() => {
    if (activeTab === "patients") {
      fetchPatients();
    }
  }, [activeTab, fetchPatients]);

  useEffect(() => {
    if (activeTab === "doctors") {
      fetchDoctors(doctorPage, 10, doctorSearch.trim(), doctorSpec.trim(), doctorSort);
    }
  }, [activeTab, doctorPage, doctorSearch, doctorSpec, doctorSort, fetchDoctors]);

  const fetchDepartments = useCallback(async () => {
    try {
      setDepartmentsError("");
      setDepartmentsLoading(true);
      const response = await adminApi.getDepartments();
      setDepartments(response.data || []);
    } catch (error) {
      setDepartmentsError(getApiErrorMessage(error, "Failed to load departments"));
      setDepartments([]);
    } finally {
      setDepartmentsLoading(false);
    }
  }, []);

  const fetchDepartmentTemplates = useCallback(async () => {
    try {
      setTemplatesError("");
      setTemplatesLoading(true);
      const response = await adminApi.getDepartmentTemplates();
      setDepartmentTemplates(response.data || []);
    } catch (error) {
      setTemplatesError(getApiErrorMessage(error, "Failed to load department templates"));
      setDepartmentTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "departments") {
      fetchDepartments();
      fetchDepartmentTemplates();
    }
  }, [activeTab, fetchDepartments, fetchDepartmentTemplates]);

  useEffect(() => {
    const selected = departmentTemplates.find(t => String(t.id) === String(selectedTemplateId));
    if (!selected) {
      setFormData({
        name: "",
        description: "",
        imageUrl: "",
        accentColor: "#2563eb",
        bgColor: "#eff6ff",
        icon: "DEPT",
        sections: DEFAULT_DEPARTMENT_SECTIONS,
      });
      return;
    }
    let sections = DEFAULT_DEPARTMENT_SECTIONS;
    if (selected.sectionsJson) {
      try {
        const parsed = JSON.parse(selected.sectionsJson);
        if (Array.isArray(parsed) && parsed.length) {
          sections = parsed;
        }
      } catch {
        // ignore invalid JSON
      }
    }
    setFormData({
      name: selected.name || "",
      description: selected.description || "",
      imageUrl: selected.imageUrl || "",
      accentColor: selected.accentColor || "#2563eb",
      bgColor: selected.bgColor || "#eff6ff",
      icon: selected.icon || "DEPT",
      sections,
    });
  }, [selectedTemplateId, departmentTemplates]);



  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!selectedTemplateId) {
      alert("Please select a department template");
      return;
    }

    try {
      setLoading(true);
      setHeadDoctorError("");
      const { errors, sectionsJson } = validateDepartmentPayload();
      if (errors.length > 0) {
        toast.error(errors[0]);
        return;
      }
      let headDoctorId = null;
      if (headDoctorName.trim()) {
        const match = headDoctorSuggestions.find(
          d => d.name && d.name.toLowerCase() === headDoctorName.trim().toLowerCase()
        );
        if (!match) {
          setHeadDoctorError("Please select a valid head doctor from suggestions");
          setLoading(false);
          return;
        }
        headDoctorId = match.id;
      }
      const payload = {
        templateId: Number(selectedTemplateId),
        headDoctorId,
        doctorIds: selectedDepartmentDoctors.map(d => d.id),
        description: formData.description,
        imageUrl: formData.imageUrl,
        accentColor: formData.accentColor,
        bgColor: formData.bgColor,
        icon: formData.icon,
        sectionsJson,
      };
      await adminApi.addDepartmentToBranch(payload);
      toast.success("Department added to your branch!");
      setFormData({
        name: "",
        description: "",
        imageUrl: "",
        accentColor: "#2563eb",
        bgColor: "#eff6ff",
        icon: "DEPT",
        sections: DEFAULT_DEPARTMENT_SECTIONS,
      });
      setSelectedTemplateId("");
      setHeadDoctorName("");
      setHeadDoctorSuggestions([]);
      setDepartmentDoctorName("");
      setDepartmentDoctorSuggestions([]);
      setSelectedDepartmentDoctors([]);
      setShowDepartmentForm(false);
      await fetchDepartments();
    } catch (error) {
      console.error("Error adding department to branch:", error);
      toast.error("Failed to add department. " + getApiErrorMessage(error, ""));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = headDoctorName.trim();
    if (!showDepartmentForm || q.length < 2) {
      setHeadDoctorSuggestions([]);
      return;
    }
    let cancelled = false;
    adminApi.getDoctors({ page: 0, size: 10, search: q, sort: "name" })
      .then(res => {
        if (!cancelled) {
          setHeadDoctorSuggestions(res.data || []);
        }
      })
      .catch(() => {
        if (!cancelled) setHeadDoctorSuggestions([]);
      });
    return () => { cancelled = true; };
  }, [headDoctorName, showDepartmentForm]);

  useEffect(() => {
    const q = departmentDoctorName.trim();
    if (!showDepartmentForm || q.length < 2) {
      setDepartmentDoctorSuggestions([]);
      return;
    }
    let cancelled = false;
    adminApi.getDoctors({ page: 0, size: 10, search: q, sort: "name" })
      .then(res => {
        if (!cancelled) {
          setDepartmentDoctorSuggestions(res.data || []);
        }
      })
      .catch(() => {
        if (!cancelled) setDepartmentDoctorSuggestions([]);
      });
    return () => { cancelled = true; };
  }, [departmentDoctorName, showDepartmentForm]);

  const addDepartmentDoctor = () => {
    const match = departmentDoctorSuggestions.find(
      d => d.name && d.name.toLowerCase() === departmentDoctorName.trim().toLowerCase()
    );
    if (!match) return;
    if (selectedDepartmentDoctors.some(d => d.id === match.id)) return;
    setSelectedDepartmentDoctors([...selectedDepartmentDoctors, { id: match.id, name: match.name }]);
    setDepartmentDoctorName("");
    setDepartmentDoctorSuggestions([]);
  };

  const updateSectionField = (idx, field, value) => {
    const next = [...formData.sections];
    next[idx] = { ...next[idx], [field]: value };
    setFormData({ ...formData, sections: next });
  };

  const updateSectionItem = (sectionIdx, itemIdx, value) => {
    const next = [...formData.sections];
    const items = Array.isArray(next[sectionIdx].items) ? [...next[sectionIdx].items] : [];
    items[itemIdx] = value;
    next[sectionIdx] = { ...next[sectionIdx], items };
    setFormData({ ...formData, sections: next });
  };

  const addSection = () => {
    const next = [
      ...formData.sections,
      { title: "New Section", icon: "➕", items: ["New item"] },
    ];
    setFormData({ ...formData, sections: next });
  };

  const removeSection = (idx) => {
    const next = formData.sections.filter((_, i) => i !== idx);
    setFormData({ ...formData, sections: next });
  };

  const addSectionItem = (idx) => {
    const next = [...formData.sections];
    const items = Array.isArray(next[idx].items) ? [...next[idx].items] : [];
    items.push("New item");
    next[idx] = { ...next[idx], items };
    setFormData({ ...formData, sections: next });
  };

  const removeSectionItem = (sectionIdx, itemIdx) => {
    const next = [...formData.sections];
    const items = Array.isArray(next[sectionIdx].items) ? [...next[sectionIdx].items] : [];
    next[sectionIdx] = { ...next[sectionIdx], items: items.filter((_, i) => i !== itemIdx) };
    setFormData({ ...formData, sections: next });
  };

  const removeDepartmentDoctor = (id) => {
    setSelectedDepartmentDoctors(selectedDepartmentDoctors.filter(d => d.id !== id));
  };

  const handleOnboardDoctor = async (e) => {
    e.preventDefault();
    setDoctorMessage("");
    const payload = {
      username: doctorForm.username.trim(),
      name: doctorForm.name.trim(),
      specialization: doctorForm.specialization.trim(),
      email: doctorForm.email.trim(),
    };
    if (!payload.username || !payload.name || !payload.specialization || !payload.email) {
      setDoctorMessage("Please fill all fields");
      return;
    }

    try {
      setDoctorSubmitting(true);
      await adminApi.onboardDoctor(payload);
      setDoctorMessage("Doctor onboarded successfully");
      setDoctorForm({ username: "", name: "", specialization: "", email: "" });
    } catch (error) {
      setDoctorMessage(getApiErrorMessage(error, "Failed to onboard doctor"));
    } finally {
      setDoctorSubmitting(false);
    }
  };

  const tabs = ["overview", "appointments", "doctors", "payments", "patients", "departments"];

  const fetchAppointments = useCallback(async (page = 0, size = 10) => {
    try {
      setAppointmentsError("");
      setAppointmentsLoading(true);
      const response = await adminApi.getAppointments(page, size);
      setAppointments(response.data || []);
    } catch (error) {
      setAppointmentsError(getApiErrorMessage(error, "Failed to load appointments"));
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  const fetchOverview = useCallback(async () => {
    try {
      setOverviewError("");
      const response = await adminApi.getOverview();
      const data = response.data || {};
      if (data.stats) {
        setStats((prev) => ({
          ...prev,
          totalDoctors: data.stats.totalDoctors ?? prev.totalDoctors,
          totalPatients: data.stats.totalPatients ?? prev.totalPatients,
          todayAppointments: data.stats.todayAppointments ?? prev.todayAppointments,
          pendingAppointments: data.stats.pendingAppointments ?? prev.pendingAppointments,
          completedAppointments: data.stats.confirmedAppointments ?? prev.completedAppointments,
          totalRevenue: prev.totalRevenue,
          todayRevenue: prev.todayRevenue,
        }));
      }
      setOverviewDoctors(data.recentDoctors || []);
      setDepartmentLoad(data.departmentLoad || []);
      setWeeklyAppointments(data.weeklyAppointments || []);
    } catch (error) {
      setOverviewError(getApiErrorMessage(error, "Failed to load overview"));
    }
  }, []);

  useEffect(() => {
    if (activeTab === "overview") {
      setAppointmentsPage(0);
      fetchAppointments(0, 5);
      fetchOverview();
    }
  }, [activeTab, fetchAppointments, fetchOverview]);

  useEffect(() => {
    if (activeTab === "appointments") {
      fetchAppointments(appointmentsPage, 10);
    }
  }, [activeTab, appointmentsPage, fetchAppointments]);

  return (
    <>
      <style>{`
        .admin-root, .admin-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        
        .admin-page {
          min-height: 100vh;
          background: var(--background);
          color: var(--foreground);
          overflow-x: hidden;
          position: relative;
        }

        .admin-ambient { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
        .admin-orb { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.1; }
        .admin-orb-1 { width: 700px; height: 700px; top: -200px; left: -100px; background: radial-gradient(circle, var(--primary), transparent); }
        .admin-orb-2 { width: 500px; height: 500px; bottom: -100px; right: -50px; background: radial-gradient(circle, var(--secondary), transparent); }

        .admin-grid-bg {
          position: absolute; inset: 0; opacity: 0.03; z-index: 0;
          background-image: radial-gradient(var(--foreground) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        .admin-container {
          position: relative; z-index: 10;
          max-width: 1400px; margin: 0 auto;
          padding: 120px 48px 80px;
        }

        /* Top Bar */
        .admin-topbar { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; gap: 24px; flex-wrap: wrap; }
        .admin-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 8px 20px; border-radius: 999px;
          background: var(--secondary); border: 1.5px solid color-mix(in srgb, var(--primary) 20%, transparent);
          color: var(--primary); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;
          margin-bottom: 16px;
        }
        .admin-live { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; animation: adminPulse 2s infinite; }
        @keyframes adminPulse { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); } 70% { box-shadow: 0 0 0 10px rgba(34,197,94,0); } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); } }

        .admin-title { font-size: clamp(2.4rem, 5vw, 3.8rem); font-weight: 900; color: var(--foreground); line-height: 1.0; letter-spacing: -.03em; margin: 0; }
        .admin-title em { font-style: italic; color: var(--primary); font-family: serif; }
        .admin-date { font-size: 14px; color: var(--muted-foreground); margin-top: 8px; font-weight: 600; }

        .admin-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--card); border: 1.5px solid var(--border);
          padding: 10px 18px; border-radius: 14px;
          font-size: 12px; font-weight: 800; color: var(--foreground);
        }
        .admin-refresh-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--primary); color: #fff; border: none;
          padding: 12px 24px; border-radius: 14px;
          font-size: 13px; font-weight: 800; cursor: pointer;
          transition: all .2s; box-shadow: 0 10px 25px -5px color-mix(in srgb, var(--primary) 40%, transparent);
        }
        .admin-refresh-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }

        /* Tabs */
        .admin-tabs {
          display: flex; gap: 10px; margin-bottom: 48px;
          background: var(--card); padding: 8px; border-radius: 20px;
          border: 1.5px solid var(--border); box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          overflow-x: auto; scroll-hide: true;
        }
        .admin-tab {
          padding: 12px 24px; border-radius: 14px; border: none; background: transparent;
          font-size: 13px; font-weight: 800; color: var(--muted-foreground); cursor: pointer;
          transition: all .2s; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .admin-tab.active { background: var(--primary); color: #fff; box-shadow: 0 8px 16px -4px color-mix(in srgb, var(--primary) 40%, transparent); }
        .admin-tab:not(.active):hover { background: var(--secondary); color: var(--primary); }

        /* Stats Grid */
        .admin-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px; }
        .admin-stat-card {
          position: relative; background: var(--card); border: 1.5px solid var(--border); padding: 28px; border-radius: 24px;
          display: flex; align-items: flex-start; gap: 20px; overflow: hidden; transition: all .3s;
        }
        .admin-stat-card:hover { border-color: var(--primary); transform: translateY(-4px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05); }
        .admin-stat-icon {
          width: 52px; height: 52px; border-radius: 16px;
          background: var(--secondary); display: flex; align-items: center; justify-content: center;
          font-size: 24px; flex-shrink: 0;
        }
        .admin-stat-body { display: flex; flex-direction: column; }
        .admin-stat-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--muted-foreground); letter-spacing: .12em; margin-bottom: 4px; }
        .admin-stat-value { font-size: 28px; font-weight: 900; color: var(--foreground); line-height: 1; }
        .admin-stat-sub { font-size: 12px; color: var(--muted-foreground); margin-top: 6px; font-weight: 600; }

        /* Sections Grid */
        .admin-sections-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 32px; }
        .admin-section { grid-column: span 6; background: var(--card); border: 1.5px solid var(--border); border-radius: 32px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
        .admin-section.full { grid-column: span 12; }
        .admin-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1.5px solid var(--border); }
        .admin-section-title { font-size: 20px; font-weight: 900; color: var(--foreground); margin: 0; }
        .admin-section-sub { font-size: 13px; color: var(--muted-foreground); margin-top: 4px; font-weight: 600; }
        .admin-view-all { padding: 8px 18px; border-radius: 12px; background: var(--secondary); color: var(--primary); border: none; font-size: 12px; font-weight: 800; cursor: pointer; transition: all .2s; }
        .admin-view-all:hover { filter: brightness(0.95); }

        /* Table */
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { text-align: left; padding: 16px; font-size: 11px; font-weight: 800; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: .1em; border-bottom: 1.5px solid var(--border); }
        .admin-table td { padding: 18px 16px; border-bottom: 1.5px solid var(--border); vertical-align: middle; }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: var(--secondary); }

        .admin-apt-id { font-family: monospace; font-weight: 800; color: var(--primary); }
        .admin-patient-name { font-weight: 800; color: var(--foreground); font-size: 14px; }
        .admin-dept-tag { padding: 4px 10px; border-radius: 8px; background: var(--secondary); font-size: 11px; font-weight: 800; }
        .admin-status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; }
        .admin-status-dot { width: 6px; height: 6px; border-radius: 50%; }

        /* Doctors & Payments */
        .admin-doctor-row, .admin-payment-row { display: flex; align-items: center; gap: 16px; padding: 16px; border-bottom: 1.5px solid var(--border); transition: all .2s; }
        .admin-doctor-row:hover, .admin-payment-row:hover { background: var(--secondary); }
        .admin-doc-avatar { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #fff; font-size: 16px; }
        .admin-doc-info { flex: 1; }
        .admin-doc-name { font-weight: 800; color: var(--foreground); font-size: 14px; }
        .admin-doc-spec { font-size: 12px; color: var(--muted-foreground); font-weight: 500; }
        .admin-doc-pts { font-size: 12px; color: var(--primary); font-weight: 700; }

        .admin-pay-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--secondary); display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .admin-pay-info { flex: 1; }
        .admin-pay-amount { font-weight: 900; color: var(--foreground); font-size: 15px; }
        .admin-pay-meta { font-size: 11px; color: var(--muted-foreground); font-weight: 600; margin-top: 2px; }

        /* Progress & Charts */
        .admin-progress-row { margin-bottom: 20px; }
        .admin-progress-head { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .admin-progress-label { font-size: 12px; font-weight: 800; color: var(--muted-foreground); text-transform: uppercase; }
        .admin-progress-val { font-size: 13px; font-weight: 900; color: var(--foreground); }
        .admin-progress-track { height: 8px; background: var(--secondary); border-radius: 999px; overflow: hidden; }
        .admin-progress-fill { height: 100%; border-radius: 999px; transition: width 1s ease-out; }

        .admin-chart-bars { display: flex; align-items: flex-end; gap: 12px; height: 180px; padding-top: 20px; }
        .admin-chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 12px; height: 100%; justify-content: flex-end; }
        .admin-bar-wrap { width: 100%; flex: 1; display: flex; align-items: flex-end; justify-content: center; position: relative; }
        .admin-bar { width: 16px; border-radius: 8px 8px 4px 4px; transition: height .6s cubic-bezier(0.2, 0.8, 0.2, 1); min-height: 4px; }
        .admin-bar.secondary { width: 12px; opacity: 0.4; margin-left: -6px; }
        .admin-bar-label { font-size: 10px; font-weight: 800; color: var(--muted-foreground); text-transform: uppercase; }

        /* Forms */
        .admin-form { display: flex; flex-direction: column; gap: 24px; padding: 24px; background: var(--sidebar); border-radius: 20px; border: 1.5px solid var(--border); margin-bottom: 32px; }
        .admin-form-group { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .admin-form-group.full { grid-template-columns: 1fr; }
        .admin-form-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--muted-foreground); letter-spacing: .1em; margin-bottom: 8px; display: block; }
        .admin-form input, .admin-form select { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1.5px solid var(--border); background: var(--card); color: var(--foreground); font-family: inherit; font-size: 14px; outline: none; transition: all .2s; }
        .admin-form input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 12%, transparent); }
        .admin-form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 12px; }
        .btn-primary { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: all .2s; }
        .btn-cancel { background: var(--card); border: 1.5px solid var(--border); color: var(--foreground); padding: 12px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; }

        @media (max-width: 1200px) {
          .admin-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .admin-sections-grid { grid-template-columns: 1fr; }
          .admin-container { padding: 24px 24px 60px; }
        }
        @media (max-width: 640px) {
          .admin-stats-grid { grid-template-columns: 1fr; }
          .admin-form-group { grid-template-columns: 1fr; }
          .admin-topbar { flex-direction: column; align-items: flex-start; }
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
            <StatCard delay={0}    label="Total Doctors"         value={stats.totalDoctors}          sub={`${stats.activeDoctors} active now`}             icon="👨‍⚕️" accent="var(--primary)" />
            <StatCard delay={0.08} label="Total Patients"        value={stats.totalPatients.toLocaleString()} sub="Registered patients"                   icon="🏥"   accent="var(--chart-5)" />
            <StatCard delay={0.16} label="Today's Appointments"  value={stats.todayAppointments}     sub={`${stats.pendingAppointments} pending`}           icon="📅"   accent="var(--primary)" />
            <StatCard delay={0.24} label="Total Revenue"         value={fmt(stats.totalRevenue)}     sub={`${fmt(stats.todayRevenue)} today`}               icon="💰"   accent="var(--chart-5)" />
          </div>

          <div className="admin-stats-grid">
            <StatCard delay={0.30} label="Completed Appointments" value={stats.completedAppointments.toLocaleString()} sub="All time"       icon="✅"   accent="var(--primary)" />
            <StatCard delay={0.36} label="Pending Appointments"   value={stats.pendingAppointments}                     sub="Require action" icon="⏳"   accent="var(--chart-5)" />
            <StatCard delay={0.42} label="Active Doctors"         value={stats.activeDoctors}                           sub="On duty today"  icon="🩺"   accent="var(--primary)" />
            <StatCard delay={0.48} label="Today's Revenue"        value={fmt(stats.todayRevenue)}                       sub="Live earnings"  icon="📈"   accent="var(--chart-5)" />
          </div>

          {/* ── Sections ── */}
          <div className="admin-sections-grid">

            {activeTab === "overview" && (
              <>

            {/* Recent Appointments */}
            <div className="admin-section full">
              <Section
                title="Recent Appointments"
                subtitle="Today's appointment activity"
                action={{ label: "View All", onClick: () => setActiveTab("appointments") }}
              >
                {appointmentsLoading ? (
                  <div className="admin-loading">Loading appointments...</div>
                ) : appointmentsError ? (
                  <div className="admin-empty-state">{appointmentsError}</div>
                ) : appointments.length === 0 ? (
                  <div className="admin-empty-state">No appointments found</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th><th>Patient</th><th>Doctor</th><th>Department</th>
                        <th>Time</th><th>Status</th><th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(apt => {
                        const statusLabel = formatStatus(apt.status);
                        const s = statusColor[statusLabel] || statusColor.Pending;
                        const dept = apt?.doctor?.departments?.[0]?.name || apt?.doctor?.specialization || "General";
                        return (
                          <tr key={apt.appointmentId || apt.id}>
                            <td><span className="admin-apt-id">{apt.appointmentId || apt.id}</span></td>
                            <td><span className="admin-patient-name">{apt?.patient?.name || "—"}</span></td>
                            <td>{apt?.doctor?.name ? `Dr. ${apt.doctor.name}` : "—"}</td>
                            <td>
                              <span className="admin-dept-tag"
                                style={{ color: deptColor[dept] || deptColor.default }}>
                                {dept}
                              </span>
                            </td>
                            <td>{formatTime(apt.appointmentTime)}</td>
                            <td>
                              <span className="admin-status-pill"
                                style={{ background: s.bg, color: s.color }}>
                                <span className="admin-status-dot" style={{ background: s.dot }} />
                                {statusLabel}
                              </span>
                            </td>
                            <td><span className="admin-amount">—</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </Section>
            </div>

            {/* Active Doctors */}
            <div className="admin-section">
              <Section
                title="Recent Doctors"
                subtitle="Latest doctors in your branch"
                action={{ label: "View All", onClick: () => setActiveTab("doctors") }}
              >
                <div className="admin-doctor-list">
                  {overviewDoctors.map(doc => {
                    const patientCount = Array.isArray(doc.patients)
                      ? doc.patients.length
                      : (typeof doc.patients === "number" ? doc.patients : 0);
                    const initials = (doc.name || "DR").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                    return (
                    <div key={doc.id} className="admin-doctor-row">
                      <div className="admin-doc-avatar"
                        style={{ background: `linear-gradient(135deg, ${deptColor[doc.specialization] || deptColor.default}, #1a1a1a)` }}>
                        {initials}
                      </div>
                      <div className="admin-doc-info">
                        <div className="admin-doc-name">Dr. {doc.name}</div>
                        <div className="admin-doc-spec">{doc.specialization || "General"}</div>
                      </div>
                      <div className="admin-doc-meta">
                        <span className="admin-doc-pts">{doc.email || "—"}</span>
                      </div>
                    </div>
                    );
                  })}
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
                  {departmentLoad.map((d, idx) => {
                    const max = Math.max(1, ...departmentLoad.map(x => x.patientCount || 0));
                    const val = Math.round(((d.patientCount || 0) / max) * 100);
                    const color = deptColor[d.name] || deptColor.default;
                    return (
                    <div key={d.name} className="admin-progress-row">
                      <div className="admin-progress-head">
                        <span className="admin-progress-label" style={{ color }}>{d.name}</span>
                        <span className="admin-progress-val">{val}%</span>
                      </div>
                      <div className="admin-progress-track">
                        <div className="admin-progress-fill"
                          style={{ width: `${val}%`, background: color }} />
                      </div>
                    </div>
                  )})}
                  {departmentLoad.length === 0 && (
                    <div className="admin-empty-state">No department data</div>
                  )}
                </div>
              </Section>
            </div>

            {/* Weekly Chart */}
            <div className="admin-section">
              <Section title="Weekly Appointments" subtitle="This week vs last week">
                <div className="admin-chart-bars">
                  {weeklyAppointments.map(d => {
                    const max = Math.max(1, ...weeklyAppointments.map(x => x.count || 0));
                    const cur = Math.round((d.count / max) * 90);
                    return (
                    <div key={d.day} className="admin-bar-wrap">
                      <div style={{ display: "flex", gap: 3, alignItems: "flex-end", flex: 1, width: "100%" }}>
                        <div className="admin-bar"
                          style={{ height: `${cur}%`, flex: 1 }} />
                      </div>
                      <span className="admin-bar-label">{d.day}</span>
                    </div>
                  )})}
                  {weeklyAppointments.length === 0 && (
                    <div className="admin-empty-state">No weekly data</div>
                  )}
                </div>
              </Section>
            </div>

              </>
            )}

            {activeTab === "appointments" && (
              <div className="admin-section full">
                <Section title="All Appointments" subtitle="Paginated appointment list">
                  {appointmentsLoading ? (
                    <div className="admin-loading">Loading appointments...</div>
                  ) : appointmentsError ? (
                    <div className="admin-empty-state">{appointmentsError}</div>
                  ) : appointments.length === 0 ? (
                    <div className="admin-empty-state">No appointments found</div>
                  ) : (
                    <>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>ID</th><th>Patient</th><th>Doctor</th><th>Department</th>
                            <th>Time</th><th>Status</th><th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map(apt => {
                            const statusLabel = formatStatus(apt.status);
                            const s = statusColor[statusLabel] || statusColor.Pending;
                            const dept = apt?.doctor?.departments?.[0]?.name || apt?.doctor?.specialization || "General";
                            return (
                              <tr key={apt.appointmentId || apt.id}>
                                <td><span className="admin-apt-id">{apt.appointmentId || apt.id}</span></td>
                                <td><span className="admin-patient-name">{apt?.patient?.name || "—"}</span></td>
                                <td>{apt?.doctor?.name ? `Dr. ${apt.doctor.name}` : "—"}</td>
                                <td>
                                  <span className="admin-dept-tag"
                                    style={{ color: deptColor[dept] || deptColor.default }}>
                                    {dept}
                                  </span>
                                </td>
                                <td>{formatTime(apt.appointmentTime)}</td>
                                <td>
                                  <span className="admin-status-pill"
                                    style={{ background: s.bg, color: s.color }}>
                                    <span className="admin-status-dot" style={{ background: s.dot }} />
                                    {statusLabel}
                                  </span>
                                </td>
                                <td><span className="admin-amount">—</span></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="admin-pagination">
                        <button
                          onClick={() => setAppointmentsPage(Math.max(0, appointmentsPage - 1))}
                          disabled={appointmentsPage === 0}>
                          Previous
                        </button>
                        <span style={{ padding: "6px 12px", fontSize: 12, color: "#aaa" }}>
                          Page {appointmentsPage + 1}
                        </span>
                        <button
                          onClick={() => setAppointmentsPage(appointmentsPage + 1)}
                          disabled={appointments.length < 10}>
                          Next
                        </button>
                      </div>
                    </>
                  )}
                </Section>
              </div>
            )}

            {activeTab === "doctors" && (
              <div className="admin-section full">
                <Section title="Onboard Doctor" subtitle="Doctors are assigned to your branch automatically">
                  <form className="admin-form-wrapper" onSubmit={handleOnboardDoctor}>
                    <div className="admin-form-group">
                      <div>
                        <label className="admin-form-label">Username</label>
                        <input
                          type="text"
                          placeholder="Doctor username"
                          value={doctorForm.username}
                          onChange={(e) => setDoctorForm({ ...doctorForm, username: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="admin-form-label">Doctor Name</label>
                        <input
                          type="text"
                          placeholder="Doctor name"
                          value={doctorForm.name}
                          onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="admin-form-group">
                      <div>
                        <label className="admin-form-label">Specialization</label>
                        <input
                          type="text"
                          placeholder="Specialization"
                          value={doctorForm.specialization}
                          onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="admin-form-label">Email</label>
                        <input
                          type="email"
                          placeholder="doctor@example.com"
                          value={doctorForm.email}
                          onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    {doctorMessage && <div className="admin-form-message">{doctorMessage}</div>}
                    <div className="admin-form-actions">
                      <button type="submit" className="btn-primary" disabled={doctorSubmitting}>
                        {doctorSubmitting ? "Onboarding..." : "Onboard Doctor"}
                      </button>
                    </div>
                  </form>
                </Section>
                <Section title="Doctors" subtitle="Doctors in your branch">
                  <div className="admin-form-wrapper" style={{ marginBottom: 16 }}>
                    <div className="admin-form-group full">
                      <label className="admin-form-label">Search Doctor</label>
                      <input
                        type="text"
                        placeholder="Search by name"
                        value={doctorSearch}
                        onChange={(e) => { setDoctorSearch(e.target.value); setDoctorPage(0); }}
                      />
                    </div>
                  </div>
                  {doctorsLoading ? (
                    <div className="admin-loading">Loading doctors...</div>
                  ) : doctorsError ? (
                    <div className="admin-empty-state">{doctorsError}</div>
                  ) : doctors.length === 0 ? (
                    <div className="admin-empty-state">No doctors found</div>
                  ) : (
                    <>
                      <div className="admin-doctor-list">
                        {doctors.map(doc => (
                          <div key={doc.id} className="admin-doctor-row">
                            <div className="admin-doc-avatar"
                              style={{ background: `linear-gradient(135deg, ${deptColor[doc.specialization] || deptColor.default}, #1a1a1a)` }}>
                              {(doc.name || "DR").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <div className="admin-doc-info">
                              <div className="admin-doc-name">Dr. {doc.name}</div>
                              <div className="admin-doc-spec">{doc.specialization || "General"}</div>
                            </div>
                            <div className="admin-doc-meta">
                              <span className="admin-doc-pts">{doc.email || "—"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="admin-pagination">
                        <button
                          onClick={() => setDoctorPage(Math.max(0, doctorPage - 1))}
                          disabled={doctorPage === 0}>
                          Previous
                        </button>
                        <span style={{ padding: "6px 12px", fontSize: 12, color: "#aaa" }}>
                          Page {doctorPage + 1}
                        </span>
                        <button
                          onClick={() => setDoctorPage(doctorPage + 1)}
                          disabled={doctors.length < 10}>
                          Next
                        </button>
                      </div>
                    </>
                  )}
                </Section>
              </div>
            )}

            {activeTab === "patients" && (
              <div className="admin-section full">
                <Section title="All Patients" subtitle="Hospital registered patients" action="Refresh">
                  {loading ? (
                    <div className="admin-loading">Loading patients...</div>
                  ) : patients.length === 0 ? (
                    <div className="admin-empty-state">No patients found</div>
                  ) : (
                    <div className="admin-patients-list">
                    <div className="admin-patients-header">
                        <div style={{ fontWeight: 600, fontSize: 13 }}>Patient</div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>Blood Group</div>
                        <div style={{ fontWeight: 600, fontSize: 13, textAlign: "center" }}>Birth Date</div>
                      </div>
                      {patients.map(patient => (
                        <div key={patient.id} className="admin-patient-row">
                          <div className="admin-patient-col name">
                            <div>{patient.name || "N/A"}</div>
                            <div className="admin-patient-sub">{patient.email || "N/A"}</div>
                          </div>
                          <div className="admin-patient-col">{patient.bloodGroup || "N/A"}</div>
                          <div className="admin-patient-col" style={{ textAlign: "center", fontSize: 12, color: "#aaa" }}>
                            {patient.birthDate || "N/A"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!loading && patients.length > 0 && (
                    <div className="admin-pagination">
                      <button 
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}>
                        Previous
                      </button>
                      <span style={{ padding: "6px 12px", fontSize: 12, color: "#aaa" }}>
                        Page {currentPage + 1}
                      </span>
                      <button 
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={patients.length < 10}>
                        Next
                      </button>
                    </div>
                  )}
                </Section>
              </div>
            )}

            {activeTab === "departments" && (
              <div className="admin-section full">
                <Section title="Department Management" subtitle="Add department templates to your branch and manage details">
                  {!showDepartmentForm ? (
                    <button className="admin-refresh-btn" 
                      onClick={() => setShowDepartmentForm(true)}
                      style={{ marginBottom: "20px" }}>
                      + Add Department to Branch
                    </button>
                  ) : (
                    <form className="admin-form-wrapper" onSubmit={handleAddDepartment}>
                      <div className="admin-form-group">
                        <div>
                          <label className="admin-form-label">Department Template</label>
                          <select
                            value={selectedTemplateId}
                            onChange={(e) => setSelectedTemplateId(e.target.value)}
                            required
                          >
                            <option value="">Select department</option>
                            {departmentTemplates.map(dep => (
                              <option key={dep.id} value={dep.id}>{dep.name}</option>
                            ))}
                          </select>
                          {templatesLoading && (
                            <div className="admin-form-message">Loading templates…</div>
                          )}
                          {templatesError && (
                            <div className="admin-form-message">{templatesError}</div>
                          )}
                          {!templatesLoading && !templatesError && departmentTemplates.length === 0 && (
                            <div className="admin-form-message">No templates found. Ask head admin to create one.</div>
                          )}
                        </div>
                        <div>
                          <label className="admin-form-label">Head Doctor Name (optional)</label>
                          <input
                            type="text"
                            list="head-doctor-suggestions"
                            placeholder="Search doctor by name"
                            value={headDoctorName}
                            onChange={(e) => setHeadDoctorName(e.target.value)}
                          />
                          <datalist id="head-doctor-suggestions">
                            {headDoctorSuggestions.map(d => (
                              <option key={d.id} value={d.name} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                      <div className="admin-form-group">
                        <div>
                          <label className="admin-form-label">Department Description</label>
                          <input
                            type="text"
                            placeholder="Short description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            maxLength={DEPT_LIMITS.description}
                          />
                        </div>
                        <div>
                          <label className="admin-form-label">Department Photo URL</label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            maxLength={DEPT_LIMITS.imageUrl}
                          />
                        </div>
                      </div>
                      <div className="admin-form-group">
                        <div>
                          <label className="admin-form-label">Card Accent Color</label>
                          <input
                            type="text"
                            placeholder="#2563eb"
                            value={formData.accentColor}
                            onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                            maxLength={DEPT_LIMITS.accentColor}
                          />
                        </div>
                        <div>
                          <label className="admin-form-label">Card Background Color</label>
                          <input
                            type="text"
                            placeholder="#eff6ff"
                            value={formData.bgColor}
                            onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                            maxLength={DEPT_LIMITS.bgColor}
                          />
                        </div>
                      </div>
                      <div className="admin-form-group">
                        <div>
                          <label className="admin-form-label">Card Icon Text</label>
                          <input
                            type="text"
                            placeholder="DEPT"
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            maxLength={DEPT_LIMITS.icon}
                          />
                        </div>
                      </div>
                      <div className="admin-form-group full">
                        <div>
                          <label className="admin-form-label">Department Sections</label>
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {formData.sections.map((section, idx) => (
                              <div key={idx} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
                                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                  <input
                                    type="text"
                                    placeholder="Section Title"
                                    value={section.title}
                                    onChange={(e) => updateSectionField(idx, "title", e.target.value)}
                                    style={{ flex: 1, minWidth: 180 }}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Icon (e.g. 📋)"
                                    value={section.icon}
                                    onChange={(e) => updateSectionField(idx, "icon", e.target.value)}
                                    style={{ width: 120 }}
                                  />
                                  <button
                                    type="button"
                                    className="admin-view-all"
                                    onClick={() => removeSection(idx)}
                                  >
                                    Remove Section
                                  </button>
                                </div>

                                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                                  {(section.items || []).map((item, itemIdx) => (
                                    <div key={itemIdx} style={{ display: "flex", gap: 8 }}>
                                      <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => updateSectionItem(idx, itemIdx, e.target.value)}
                                        style={{ flex: 1 }}
                                      />
                                      <button
                                        type="button"
                                        className="admin-view-all"
                                        onClick={() => removeSectionItem(idx, itemIdx)}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    className="admin-refresh-btn"
                                    onClick={() => addSectionItem(idx)}
                                  >
                                    + Add Item
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              className="admin-refresh-btn"
                              onClick={addSection}
                            >
                              + Add Section
                            </button>
                          </div>
                        </div>
                      </div>
                      {headDoctorError && (
                        <div className="admin-form-message">{headDoctorError}</div>
                      )}
                      <div className="admin-form-group">
                        <div>
                          <label className="admin-form-label">Add Doctors</label>
                          <input
                            type="text"
                            list="department-doctor-suggestions"
                            placeholder="Search doctor by name"
                            value={departmentDoctorName}
                            onChange={(e) => setDepartmentDoctorName(e.target.value)}
                          />
                          <datalist id="department-doctor-suggestions">
                            {departmentDoctorSuggestions.map(d => (
                              <option key={d.id} value={d.name} />
                            ))}
                          </datalist>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end" }}>
                          <button
                            type="button"
                            className="admin-refresh-btn"
                            onClick={addDepartmentDoctor}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                      {selectedDepartmentDoctors.length > 0 && (
                        <div className="admin-form-group full">
                          <div>
                            <label className="admin-form-label">Selected Doctors</label>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              {selectedDepartmentDoctors.map(d => (
                                <button
                                  key={d.id}
                                  type="button"
                                  className="admin-view-all"
                                  onClick={() => removeDepartmentDoctor(d.id)}
                                  title="Remove"
                                >
                                  Dr. {d.name} ×
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="admin-form-actions">
                        <button 
                          type="button" 
                          className="btn-cancel"
                          onClick={() => {
                            setShowDepartmentForm(false);
                            setSelectedTemplateId("");
                            setHeadDoctorName("");
                            setHeadDoctorSuggestions([]);
                            setDepartmentDoctorName("");
                            setDepartmentDoctorSuggestions([]);
                            setSelectedDepartmentDoctors([]);
                          }}>
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="btn-primary"
                          disabled={loading}>
                          {loading ? "Adding..." : "Add Department"}
                        </button>
                      </div>
                    </form>
                  )}
                  <Section title="Departments" subtitle="Head doctor and members">
                    {departmentsLoading ? (
                      <div className="admin-loading">Loading departments...</div>
                    ) : departmentsError ? (
                      <div className="admin-empty-state">{departmentsError}</div>
                    ) : departments.length === 0 ? (
                      <div className="admin-empty-state">No departments found</div>
                    ) : (
                      <div className="admin-patients-list">
                        <div className="admin-patients-header">
                          <div style={{ fontWeight: 600, fontSize: 13 }}>Department</div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>Head Doctor</div>
                          <div style={{ fontWeight: 600, fontSize: 13, textAlign: "center" }}>Members</div>
                        </div>
                        {departments.map(dep => (
                          <div key={dep.id} className="admin-patient-row">
                            <div className="admin-patient-col name">{dep.name}</div>
                            <div className="admin-patient-col">{dep.headDoctorName || "N/A"}</div>
                            <div className="admin-patient-col" style={{ textAlign: "center", fontSize: 12, color: "#aaa" }}>
                              {dep.memberCount ?? 0}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
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


