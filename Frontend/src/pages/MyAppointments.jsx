import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import appointmentApi from "../api/appointments";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [page, setPage] = useState(0);
  const [size] = useState(15);
  const [hasMore, setHasMore] = useState(true);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentApi.getMyAppointments(page, size);
      const data = response.data || [];
      setAppointments(data);
      setHasMore(data.length === size);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [page]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return appointments;
    return appointments
      .filter((a) => a.status !== "PENDING")
      .filter((a) => {
        const doctor = a.doctor?.name?.toLowerCase() || "";
        const reason = a.reason?.toLowerCase() || "";
        const id = a.appointmentId?.toLowerCase() || "";
        return doctor.includes(q) || reason.includes(q) || id.includes(q);
      });
  }, [appointments, search]);

  const handleCancel = async (appointment) => {
    setBusyId(appointment.appointmentId);
    try {
      const response = await appointmentApi.cancelByPatient(appointment.appointmentId);
      setAppointments((prev) =>
        prev.map((item) =>
          item.appointmentId === appointment.appointmentId ? response.data : item
        )
      );
      toast.success("Appointment cancelled. Email sent.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel appointment");
    } finally {
      setBusyId(null);
    }
  };

  const badgeClassByStatus = (status) => {
    const value = (status || "").toUpperCase();
    if (value === "CONFIRMED") return "ux-badge ux-badge-approved";
    if (value === "CANCELLED") return "ux-badge ux-badge-pending";
    return "ux-badge ux-badge-completed";
  };

  return (
    <div className="ux-page">
      <style>{`
        .ux-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 10% 10%, rgba(37,99,235,.12), transparent 40%),
            radial-gradient(circle at 90% 0%, rgba(20,184,166,.12), transparent 42%),
            linear-gradient(160deg, #f8fbff 0%, #f8fafc 100%);
          color: #0f172a;
        }
        .ux-wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 110px 20px 30px;
        }
        .ux-hero h1 {
          margin: 0;
          font-size: clamp(1.75rem, 2.6vw, 2.35rem);
          letter-spacing: -.02em;
          color: #0f172a;
        }
        .ux-hero p {
          margin: 8px 0 18px;
          color: #64748b;
        }
        .ux-input {
          width: 100%;
          border-radius: 14px;
          border: 1px solid #dbe6ff;
          background: #fff;
          color: #0f172a;
          padding: 12px 14px;
          margin-bottom: 16px;
          box-shadow: 0 8px 28px rgba(37,99,235,0.06);
          outline: none;
        }
        .ux-input:focus {
          border-color: #93c5fd;
          box-shadow: 0 0 0 4px rgba(37,99,235,.12);
        }
        .ux-grid { display: grid; gap: 12px; }
        .ux-card {
          border: 1px solid #dbe6ff;
          border-radius: 16px;
          background: rgba(255,255,255,.95);
          padding: 16px;
          box-shadow: 0 10px 26px rgba(15,23,42,.06);
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .ux-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px rgba(15,23,42,.1);
        }
        .ux-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }
        .ux-name { font-weight: 700; color: #0f172a; }
        .ux-meta { color: #2563eb; font-size: 13px; }
        .ux-submeta { color: #64748b; font-size: 12px; }
        .ux-actions {
          margin-top: 12px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .ux-btn {
          text-decoration: none;
          padding: 9px 13px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all .2s ease;
        }
        .ux-btn-view {
          border-color: #bfdbfe;
          color: #1d4ed8;
          background: #eff6ff;
        }
        .ux-btn-view:hover { background: #dbeafe; }
        .ux-btn-cancel {
          border: none;
          color: #fff;
          background: linear-gradient(120deg, #2563EB 0%, #14B8A6 100%);
        }
        .ux-btn-cancel:hover { filter: brightness(1.04); }
        .ux-msg {
          color: #64748b;
          padding: 8px 2px;
        }
        .ux-badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .02em;
        }
        .ux-badge-pending { color: #a16207; background: #fef3c7; border: 1px solid #fde68a; }
        .ux-badge-approved { color: #0f766e; background: #ccfbf1; border: 1px solid #99f6e4; }
        .ux-badge-completed { color: #065f46; background: #d1fae5; border: 1px solid #a7f3d0; }

        /* Pagination */
        .ux-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 24px;
          padding-bottom: 50px;
        }
        .ux-page-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #fff;
          border: 1px solid #dbe6ff;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: #2563eb;
          cursor: pointer;
          transition: all .2s;
          box-shadow: 0 4px 12px rgba(15,23,42,.04);
        }
        .ux-page-btn:hover:not(:disabled) {
          border-color: #93c5fd;
          background: #eff6ff;
          transform: translateY(-1px);
        }
        .ux-page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          color: #94a3b8;
        }
        .ux-page-num {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          min-width: 70px;
          text-align: center;
        }
      `}</style>
      <Header />
      <div className="ux-wrap">
        <div className="ux-hero">
          <h1>My Appointments</h1>
          <p>
          View all your bookings, open details, or cancel upcoming appointments.
          </p>
        </div>

        <input
          className="ux-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by doctor, reason, or appointment ID"
        />

        {loading && <p className="ux-msg">Loading appointments...</p>}
        {!loading && filtered.length === 0 && (
          <p className="ux-msg">No appointments found.</p>
        )}

        <div className="ux-grid">
          {filtered.map((a) => (
            <div key={a.appointmentId} className="ux-card">
              <div className="ux-row">
                <div>
                  <div className="ux-name">Dr. {a.doctor?.name || "Unknown"}</div>
                  <div className="ux-meta">{a.doctor?.specialization || "General"}</div>
                  <div className="ux-submeta">ID: {a.appointmentId}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className={badgeClassByStatus(a.status)}>{a.status}</div>
                  <div className="ux-submeta" style={{ marginTop: 6 }}>
                    {new Date(a.appointmentTime).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              </div>

              <div className="ux-submeta" style={{ marginTop: 8, color: "#334155", fontSize: 13 }}>
                {a.reason || "No reason provided"}
              </div>

              <div className="ux-actions">
                <Link
                  to={`/appointment/${a.appointmentId}`}
                  className="ux-btn ux-btn-view"
                >
                  View Details
                </Link>
                {a.status !== "CANCELLED" && (
                  <button
                    disabled={busyId === a.appointmentId}
                    onClick={() => handleCancel(a)}
                    className="ux-btn ux-btn-cancel"
                  >
                    {busyId === a.appointmentId ? "Cancelling..." : "Cancel"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {!loading && filtered.length > 0 && (
          <div className="ux-pagination">
            <button
              className="ux-page-btn"
              onClick={() => {
                setPage((p) => Math.max(0, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={page === 0 || loading}
            >
              Previous
            </button>
            <div className="ux-page-num">Page {page + 1}</div>
            <button
              className="ux-page-btn"
              onClick={() => {
                setPage((p) => p + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={!hasMore || loading}
            >
              Next
            </button>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default MyAppointments;
