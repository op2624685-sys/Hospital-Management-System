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
          background: transparent;
          font-family: 'Outfit', sans-serif;
        }
        .dr-wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 110px 20px 60px;
          color: var(--foreground);
        }
        .dr-title {
          margin: 0;
          font-size: clamp(2.2rem, 3.5vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -.03em;
          color: var(--primary);
        }
        .dr-sub {
          color: var(--muted-foreground);
          margin: 10px 0 24px;
          font-size: 1.1rem;
        }
        .dr-search {
          width: 100%;
          padding: 14px 18px;
          border-radius: 16px;
          border: 1.5px solid var(--border);
          background: var(--card);
          color: var(--foreground);
          margin-bottom: 28px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          outline: none;
          transition: all 0.2s;
        }
        .dr-search:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 12%, transparent);
          background: var(--background);
        }
        .dr-msg { color: var(--muted-foreground); text-align: center; padding: 40px; font-style: italic; }
        .dr-grid { display: grid; gap: 16px; }
        .dr-card {
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 24px;
          background: var(--card);
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
          transition: all 0.2s;
        }
        .dr-card:hover { border-color: var(--primary); transform: translateY(-2px); }
        .dr-head {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .dr-name { font-size: 1.2rem; font-weight: 800; color: var(--foreground); }
        .dr-email { color: var(--primary); font-size: 13px; font-weight: 600; }
        .dr-id { color: var(--muted-foreground); font-size: 12px; margin-top: 2px; }
        
        .dr-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 20px;
        }
        .dr-label { display: grid; gap: 8px; }
        .dr-label span {
          font-size: 11px;
          color: var(--muted-foreground);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .dr-input {
          padding: 12px 14px;
          border-radius: 12px;
          border: 1.5px solid var(--border);
          background: var(--background);
          color: var(--foreground);
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }
        .dr-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 12%, transparent); }

        .dr-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          flex-wrap: wrap;
        }
        .dr-btn {
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          transition: all .2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .dr-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .dr-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .dr-btn-primary {
          background: var(--primary);
          color: var(--primary-foreground);
          box-shadow: 0 4px 12px color-mix(in srgb, var(--primary) 30%, transparent);
        }
        .dr-btn-outline {
          background: var(--secondary);
          color: var(--primary);
          border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
        }
        
        .dr-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 40px;
        }
        .dr-page-num { font-weight: 800; color: var(--muted-foreground); font-size: 14px; min-width: 80px; text-align: center; }

        .dr-badge {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .dr-badge-pending { color: #d97706; background: rgba(217,119,6,0.1); border: 1px solid rgba(217,119,6,0.2); }
        .dr-badge-approved { color: #16a34a; background: rgba(22,163,74,0.1); border: 1px solid rgba(22,163,74,0.2); }
        .dr-badge-completed { color: var(--primary); background: var(--secondary); border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent); }
        .dr-badge-rejected { color: var(--destructive); background: color-mix(in srgb, var(--destructive) 10%, transparent); border: 1px solid color-mix(in srgb, var(--destructive) 20%, transparent); }
        .dr-badge-progress { color: var(--primary); background: var(--secondary); border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent); }
        
        @media (max-width: 760px) {
          .dr-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <Header />
      <div className="dr-wrap">
        <h1 className="dr-title">Manage Consultations</h1>
        <p className="dr-sub">
          Review and update appointment statuses for patient visits.
        </p>

        <input
          className="dr-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔎 Search by patient name, ID, or clinical reason..."
        />

        {loading && page === 0 && <PageLoader message="Fetching clinic schedule..." />}
        {!loading && filtered.length === 0 && (
          <p className="dr-msg">No clinical records found.</p>
        )}

        <div className="dr-grid">
          {filtered.map((a) => {
            const form = getForm(a);
            const isSaving = savingId === a.appointmentId;
            return (
              <div key={a.appointmentId} className="dr-card">
                <div className="dr-head">
                  <div>
                    <div className="dr-name">{a.patient?.name || "Patient Record"}</div>
                    <div className="dr-email">{a.patient?.email}</div>
                    <div className="dr-id">REF: {a.appointmentId}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={badgeClassByStatus(a.status)}>{a.status}</div>
                    <div className="dr-id" style={{ marginTop: 8, fontWeight: 700 }}>{a.branch?.name}</div>
                  </div>
                </div>

                <div className="dr-form-grid">
                  <label className="dr-label">
                    <span>Scheduled Time</span>
                    <input
                      className="dr-input"
                      type="datetime-local"
                      value={form.appointmentTime}
                      readOnly
                      style={{ backgroundColor: "var(--background)", cursor: "not-allowed", opacity: 0.7 }}
                    />
                  </label>

                  <label className="dr-label">
                    <span>Consultation Status</span>
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

                <div className="dr-label" style={{ marginTop: 16 }}>
                  <span>Clinical Reason</span>
                  <div style={{ background: 'var(--background)', padding: '12px 14px', borderRadius: '12px', fontSize: '14px', border: '1.5px solid var(--border)' }}>
                    {form.reason || "N/A"}
                  </div>
                </div>

                <div className="dr-actions">
                  <button
                    disabled={isSaving || a.status === "CANCELLED"}
                    onClick={() => handleUpdate(a)}
                    className="dr-btn dr-btn-primary"
                  >
                    {isSaving ? "Updating..." : a.status === "CANCELLED" ? "Booking Cancelled" : "Save Changes"}
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
            ← Previous
          </button>
          <span className="dr-page-num">Page {page + 1}</span>
          <button
            disabled={loading || !hasMore}
            onClick={() => loadAppointments(page + 1)}
            className="dr-btn dr-btn-outline"
          >
            Next →
          </button>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default DoctorAppointments;
