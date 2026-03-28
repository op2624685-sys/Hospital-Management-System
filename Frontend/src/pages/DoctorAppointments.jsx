import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import appointmentApi from "../api/appointments";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageLoader from "../components/PageLoader";

const DoctorAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [query, setQuery] = useState("");
  const [formById, setFormById] = useState({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const size = 15;

  const loadAppointments = async (targetPage = 0) => {
    setLoading(true);
    try {
      const response = await appointmentApi.getDoctorAppointments(null, targetPage, size);
      const data = response.data || [];
      setAppointments(data);
      setPage(targetPage);
      setHasMore(data.length === size);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to load appointments";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments(0);
  }, []);

  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return appointments;
    return appointments.filter((a) => {
      const patientName = a.patient?.name?.toLowerCase() || "";
      const appointmentId = a.appointmentId?.toLowerCase() || "";
      const reason = a.reason?.toLowerCase() || "";
      return (
        patientName.includes(term) ||
        appointmentId.includes(term) ||
        reason.includes(term)
      );
    });
  }, [appointments, query]);

  const getForm = (appointment) =>
    formById[appointment.appointmentId] || {
      appointmentTime: appointment.appointmentTime?.slice(0, 16) || "",
      reason: appointment.reason || "",
      status: appointment.status || "PENDING",
    };

  const setForm = (appointmentId, patch) => {
    setFormById((prev) => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        ...patch,
      },
    }));
  };

  const handleUpdate = async (appointment) => {
    const f = getForm(appointment);
    if (!f) return;
    setSavingId(appointment.appointmentId);
    try {
      const payload = {
        status: f.status,
      };
      await appointmentApi.updateDetails(appointment.appointmentId, payload);
      toast.success("Appointment updated successfully");
      loadAppointments(page);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Update failed";
      toast.error(msg);
    } finally {
      setSavingId(null);
    }
  };

  const badgeClassByStatus = (status) => {
    const value = (status || "").toUpperCase();
    if (value === "CONFIRMED") return "dr-badge dr-badge-approved";
    if (value === "CANCELLED" || value === "REJECTED") return "dr-badge dr-badge-rejected";
    if (value === "COMPLETED") return "dr-badge dr-badge-completed";
    if (value === "IN_PROGRESS") return "dr-badge dr-badge-progress";
    return "dr-badge dr-badge-pending";
  };

  return (
    <div className="dr-page">
      <style>{`
        .dr-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 100% 0%, rgba(37,99,235,.15), transparent 40%),
            radial-gradient(circle at 0% 100%, rgba(20,184,166,.15), transparent 42%),
            linear-gradient(170deg, #f8fbff 0%, #f8fafc 100%);
        }
        .dr-wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 110px 20px 30px;
          color: #0f172a;
        }
        .dr-title {
          margin: 0;
          font-size: clamp(1.8rem, 2.6vw, 2.4rem);
          letter-spacing: -.02em;
        }
        .dr-sub {
          color: #64748b;
          margin: 8px 0 18px;
        }
        .dr-search {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #dbe6ff;
          background: #fff;
          color: #0f172a;
          margin-bottom: 20px;
          box-shadow: 0 8px 26px rgba(37,99,235,0.06);
          outline: none;
        }
        .dr-search:focus {
          border-color: #93c5fd;
          box-shadow: 0 0 0 4px rgba(37,99,235,.12);
        }
        .dr-msg { color: #64748b; }
        .dr-grid { display: grid; gap: 14px; }
        .dr-card {
          border: 1px solid #dbe6ff;
          border-radius: 16px;
          padding: 16px;
          background: rgba(255,255,255,.95);
          box-shadow: 0 10px 30px rgba(15,23,42,.06);
        }
        .dr-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .dr-name { font-weight: 700; color: #0f172a; }
        .dr-email { color: #0284c7; font-size: 13px; }
        .dr-id { color: #64748b; font-size: 12px; }
        .dr-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 14px;
        }
        .dr-label { display: grid; gap: 6px; }
        .dr-label span {
          font-size: 12px;
          color: #475569;
          font-weight: 600;
        }
        .dr-input {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          background: #fff;
          color: #0f172a;
          outline: none;
        }
        .dr-input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(37,99,235,.12);
        }
        .dr-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
        .dr-btn {
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          border: 1px solid transparent;
          cursor: pointer;
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }
        .dr-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .dr-btn:active:not(:disabled) {
          transform: scale(0.96);
        }
        .dr-btn-primary {
          background: #2563eb;
          color: #fff;
        }
        .dr-btn-primary:hover { background: #1d4ed8; }
        .dr-btn-success {
          background: #14b8a6;
          color: #fff;
        }
        .dr-btn-success:hover { background: #0f9f91; }
        .dr-btn-outline {
          border-color: #bfdbfe;
          color: #1d4ed8;
          background: #eff6ff;
        }
        .dr-btn-outline:hover { background: #dbeafe; }
        .dr-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-top: 30px;
          padding: 10px;
        }
        .dr-page-num {
          font-weight: 700;
          color: #1e293b;
          font-size: 14px;
          min-width: 80px;
          text-align: center;
        }
        .dr-badge {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 700;
        }
        .dr-badge-pending { color: #a16207; background: #fef3c7; border: 1px solid #fde68a; }
        .dr-badge-approved { color: #0f766e; background: #ccfbf1; border: 1px solid #99f6e4; }
        .dr-badge-completed { color: #065f46; background: #d1fae5; border: 1px solid #a7f3d0; }
        .dr-badge-rejected { color: #991b1b; background: #fee2e2; border: 1px solid #fecaca; }
        .dr-badge-progress { color: #1e40af; background: #dbeafe; border: 1px solid #bfdbfe; }
        @media (max-width: 760px) {
          .dr-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <Header />
      <div className="dr-wrap">
        <h1 className="dr-title">Doctor Appointments</h1>
        <p className="dr-sub">
          Logged in as doctor #{user?.id}. Update status, time, or reason. Patients get email on every change.
        </p>

        <input
          className="dr-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by patient name, appointment ID, reason"
        />

        {loading && page === 0 && <PageLoader message="Loading appointments..." />}
        {!loading && filtered.length === 0 && (
          <p className="dr-msg">No appointments found.</p>
        )}

        <div className="dr-grid">
          {filtered.map((a) => {
            const form = getForm(a);
            const isSaving = savingId === a.appointmentId;
            return (
              <div key={a.appointmentId} className="dr-card">
                <div className="dr-head">
                  <div>
                    <div className="dr-name">{a.patient?.name || "Unknown patient"}</div>
                    <div className="dr-email">{a.patient?.email}</div>
                    <div className="dr-id">ID: {a.appointmentId}</div>
                    <div className="dr-id">Branch: {a.branch?.name || "N/A"}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#475569" }}>
                    Current status: <span className={badgeClassByStatus(a.status)}>{a.status}</span>
                  </div>
                </div>

                <div className="dr-form-grid">
                  <label className="dr-label">
                    <span>Appointment time</span>
                    <input
                      className="dr-input"
                      type="datetime-local"
                      value={form.appointmentTime}
                      readOnly
                      style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed" }}
                    />
                  </label>

                  <label className="dr-label">
                    <span>Status</span>
                    <select
                      className="dr-input"
                      value={form.status}
                      onChange={(e) => setForm(a.appointmentId, { status: e.target.value })}
                      disabled={a.status === "CANCELLED"}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </label>
                </div>

                <label className="dr-label" style={{ marginTop: 10 }}>
                  <span>Reason</span>
                  <input
                    className="dr-input"
                    value={form.reason}
                    readOnly
                    style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed" }}
                  />
                </label>

                <div className="dr-actions">
                  <button
                    disabled={isSaving || a.status === "CANCELLED"}
                    onClick={() => handleUpdate(a)}
                    className="dr-btn dr-btn-primary"
                  >
                    {a.status === "CANCELLED" ? "Appointment Cancelled" : "Update Appointment"}
                  </button>
                  <button
                    disabled={isSaving}
                    onClick={() => loadAppointments(page)}
                    className="dr-btn dr-btn-outline"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="dr-pagination">
          <button
            disabled={loading || page === 0}
            onClick={() => loadAppointments(page - 1)}
            className="dr-btn dr-btn-outline"
          >
            &laquo; Previous
          </button>
          <span className="dr-page-num">Page {page + 1}</span>
          <button
            disabled={loading || !hasMore}
            onClick={() => loadAppointments(page + 1)}
            className="dr-btn dr-btn-outline"
          >
            Next &raquo;
          </button>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default DoctorAppointments;
