import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import appointmentApi from "../api/appointments";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageLoader from "../components/PageLoader";
import DoctorRatingModal from "../components/DoctorRatingModal";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [page, setPage] = useState(0);
  const [size] = useState(15);
  const [hasMore, setHasMore] = useState(true);
  const [ratingTarget, setRatingTarget] = useState(null); // { doctorId, doctorName }

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

  const badgeClassByStatus = (status) => {
    const value = (status || "").toUpperCase();
    if (value === "CONFIRMED") return "ux-badge ux-badge-approved";
    if (value === "CANCELLED") return "ux-badge ux-badge-pending";
    return "ux-badge ux-badge-completed";
  };

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

  return (
    <div className="ux-page">
      <style>{`
        .ux-page {
          min-height: 100vh;
          background: var(--background);
          color: var(--foreground);
        }
        .ux-wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 110px 20px 30px;
        }
        .ux-hero h1 {
          margin: 0;
          font-family: 'Outfit', sans-serif;
          font-size: clamp(2.2rem, 3.5vw, 3rem);
          font-weight: 800;
          letter-spacing: -.03em;
          color: var(--foreground);
        }
        .ux-hero p {
          margin: 8px 0 24px;
          color: var(--muted-foreground);
          font-size: 1.1rem;
        }
        .ux-input {
          width: 100%;
          border-radius: 16px;
          border: 1.5px solid var(--border);
          background: var(--card);
          color: var(--foreground);
          padding: 14px 18px;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          outline: none;
          transition: all 0.2s;
        }
        .ux-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 12%, transparent);
          background: var(--background);
        }
        .ux-grid { display: grid; gap: 16px; }
        .ux-card {
          border: 1px solid var(--border);
          border-radius: 20px;
          background: var(--card);
          padding: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
          transition: transform .2s ease, border-color .2s ease;
          position: relative;
          overflow: hidden;
        }
        .ux-card::before {
          content: ''; position: absolute; top:0; left:0; right:0; height:4px;
          background: var(--primary); opacity: 0; transition: opacity .2s;
        }
        .ux-card:hover {
          transform: translateY(-4px);
          border-color: var(--primary);
        }
        .ux-card:hover::before { opacity: 1; }
        .ux-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .ux-name { font-size: 1.15rem; font-weight: 800; color: var(--foreground); }
        .ux-meta { color: var(--primary); font-size: 13px; font-weight: 600; margin-top: 2px; }
        .ux-submeta { color: var(--muted-foreground); font-size: 12px; margin-top: 4px; }
        .ux-actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .ux-btn {
          text-decoration: none;
          padding: 10px 18px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all .2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .ux-btn-view {
          background: var(--secondary);
          color: var(--secondary-foreground);
          border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
        }
        .ux-btn-view:hover { filter: brightness(0.96); transform: scale(1.02); }
        .ux-btn-cancel {
          background: var(--primary);
          color: var(--primary-foreground);
          box-shadow: 0 4px 12px color-mix(in srgb, var(--primary) 30%, transparent);
        }
        .ux-btn-cancel:hover { opacity: 0.9; transform: scale(1.02); }
        .ux-msg {
          color: var(--muted-foreground);
          padding: 24px 4px;
          text-align: center;
          font-style: italic;
        }
        .ux-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .03em;
          text-transform: uppercase;
        }
        .ux-badge-pending { color: var(--destructive); background: color-mix(in srgb, var(--destructive) 10%, transparent); border: 1px solid color-mix(in srgb, var(--destructive) 20%, transparent); }
        .ux-badge-approved { color: #16a34a; background: rgba(22,163,74,0.1); border: 1px solid rgba(22,163,74,0.2); }
        .ux-btn-rate {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #fff;
          box-shadow: 0 4px 12px rgba(245,158,11,0.30);
        }
        .ux-btn-rate:hover { opacity: 0.9; transform: scale(1.02); }

        .ux-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 40px;
          padding-bottom: 60px;
        }
        .ux-page-btn {
          display: inline-flex;
          align-items: center;
          padding: 10px 20px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          color: var(--foreground);
          cursor: pointer;
          transition: all .2s;
        }
        .ux-page-btn:hover:not(:disabled) {
          border-color: var(--primary);
          background: var(--background);
          color: var(--primary);
        }
        .ux-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ux-page-num { font-size: 14px; font-weight: 800; color: var(--muted-foreground); min-width: 80px; text-align: center; }
      `}</style>
      <Header />
      <div className="ux-wrap">
        <div className="ux-hero">
          <h1>My Appointments</h1>
          <p>
          View your healthcare journey and active clinical bookings.
          </p>
        </div>

        <input
          className="ux-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder=" Search by doctor, reason, or appointment ID..."
        />

        {loading && page === 0 && <PageLoader message="Loading your schedule..." fullPage={false} bg="Transparent"/>}
        {!loading && filtered.length === 0 && (
          <div className="ux-msg">
            No clinical records found matching your search.
          </div>
        )}

        <div className="ux-grid">
          {filtered.map((a) => (
            <div key={a.appointmentId} className="ux-card">
              <div className="ux-row">
                <div>
                  <div className="ux-name">Dr. {a.doctor?.name || "Healthcare Specialist"}</div>
                  <div className="ux-meta">{a.departmentName || a.doctor?.specialization || "Clinical Division"}</div>
                  <div className="ux-submeta">REF: {a.appointmentId}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className={badgeClassByStatus(a.status)}>{a.status}</div>
                  <div className="ux-submeta" style={{ marginTop: 8, fontWeight: 700 }}>
                    {new Date(a.appointmentTime).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              </div>

              <div className="ux-submeta" style={{ marginTop: 12, color: "var(--foreground)", fontSize: 13, background: "var(--background)", padding: '8px 12px', borderRadius: '10px', borderLeft: '3px solid var(--primary)' }}>
                {a.reason || "General Consultation"}
              </div>

              <div className="ux-actions">
                <Link
                  to={`/appointment/${a.appointmentId}`}
                  className="ux-btn ux-btn-view"
                >
                  Details
                </Link>
                {a.status === "COMPLETED" && (
                  <button
                    onClick={() => setRatingTarget({ doctorId: a.doctor?.id, doctorName: a.doctor?.name || "Doctor" })}
                    className="ux-btn ux-btn-rate"
                  >
                    ★ Rate Doctor
                  </button>
                )}
                {a.status !== "CANCELLED" && a.status !== "COMPLETED" && (
                  <button
                    disabled={busyId === a.appointmentId}
                    onClick={() => handleCancel(a)}
                    className="ux-btn ux-btn-cancel"
                  >
                    {busyId === a.appointmentId ? "Processing..." : "Cancel Visit"}
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
              ← Previous
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
              Next →
            </button>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={2500} />
      {ratingTarget && (
        <DoctorRatingModal
          doctorId={ratingTarget.doctorId}
          doctorName={ratingTarget.doctorName}
          onClose={() => setRatingTarget(null)}
          onSuccess={() => setRatingTarget(null)}
        />
      )}
    </div>
  );
};

export default MyAppointments;
