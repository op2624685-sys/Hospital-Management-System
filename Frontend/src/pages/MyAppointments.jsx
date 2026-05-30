import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import appointmentApi from "../api/appointments";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageLoader from "../components/PageLoader";
import DoctorRatingModal from "../components/DoctorRatingModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";

const MyAppointments = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isLoggedIn, user } = useAuth();
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [page, setPage] = useState(0);
  const [size] = useState(15);
  const [ratingTarget, setRatingTarget] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const { data: appointments = [], isFetching: loading, error } = useQuery({
    queryKey: ["my-appointments", page, size],
    queryFn: async () => {
      const response = await appointmentApi.getMyAppointments(page, size);
      return response.data || [];
    },
    enabled: isLoggedIn && !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  useEffect(() => {
    if (!error) return;
    console.error(error);
    toast.error("Failed to load appointments");
  }, [error]);

  const hasMore = appointments.length === size;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return appointments;
    return appointments.filter((a) => {
      const doctor = a.doctor?.name?.toLowerCase() || "";
      const reason = a.reason?.toLowerCase() || "";
      const id = a.appointmentId?.toLowerCase() || "";
      return doctor.includes(q) || reason.includes(q) || id.includes(q);
    });
  }, [appointments, search]);

  const badgeClassByStatus = (status) => {
    const value = (status || "").toUpperCase();
    if (value === "CONFIRMED") return "ux-badge ux-badge-approved";
    if (value === "VISITED") return "ux-badge ux-badge-progress";
    if (value === "QUEUED") return "ux-badge ux-badge-progress";
    if (value === "IN_PROGRESS") return "ux-badge ux-badge-progress";
    if (value === "CANCELLED") return "ux-badge ux-badge-pending";
    if (value === "NO_SHOW") return "ux-badge ux-badge-pending";
    if (value === "PENDING") return "ux-badge ux-badge-waiting";
    return "ux-badge ux-badge-completed";
  };

  const statusLabel = (status) => {
    const value = (status || "").toUpperCase();
    const labels = {
      PENDING: "Awaiting Confirmation",
      CONFIRMED: "Confirmed",
      VISITED: "Checked In",
      QUEUED: "In Queue",
      IN_PROGRESS: "In Progress",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
      NO_SHOW: "No Show",
    };
    return labels[value] || value;
  };

  const handleCancel = async (appointment) => {
    setBusyId(appointment.appointmentId);
    try {
      const response = await appointmentApi.cancelByPatient(appointment.appointmentId);
      queryClient.setQueryData(["my-appointments", page, size], (prev = []) =>
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

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
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
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
          transition: transform .2s ease, border-color .2s ease;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        .ux-card::before {
          content: ''; position: absolute; top:0; left:0; right:0; height:4px;
          background: var(--primary); opacity: 0; transition: opacity .2s;
        }
        .ux-card:hover {
          transform: translateY(-3px);
          border-color: var(--primary);
        }
        .ux-card:hover::before { opacity: 1; }
        .ux-card-summary {
          padding: 20px;
        }
        .ux-card-details {
          padding: 0 20px 20px;
          border-top: 1px solid var(--border);
          margin-top: 4px;
          animation: uxSlide 0.25s ease;
        }
        @keyframes uxSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ux-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .ux-name { font-size: 1.15rem; font-weight: 800; color: var(--foreground); }
        .ux-meta { color: var(--primary); font-size: 13px; font-weight: 600; margin-top: 2px; }
        .ux-submeta { color: var(--muted-foreground); font-size: 12px; margin-top: 4px; }
        .ux-reason-preview {
          margin-top: 12px;
          color: var(--foreground);
          font-size: 13px;
          background: var(--background);
          padding: 8px 12px;
          border-radius: 10px;
          border-left: 3px solid var(--primary);
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ux-expand-hint {
          font-size: 11px;
          color: var(--primary);
          margin-top: 10px;
          font-weight: 700;
          letter-spacing: .02em;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .ux-actions {
          margin-top: 18px;
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
        .ux-badge-pending  { color: var(--destructive); background: color-mix(in srgb, var(--destructive) 10%, transparent); border: 1px solid color-mix(in srgb, var(--destructive) 20%, transparent); }
        .ux-badge-approved { color: #16a34a; background: rgba(22,163,74,0.1); border: 1px solid rgba(22,163,74,0.2); }
        .ux-badge-progress { color: #0f766e; background: rgba(6,182,212,0.12); border: 1px solid rgba(6,182,212,0.24); }
        .ux-badge-waiting  { color: #a16207; background: rgba(234,179,8,0.12); border: 1px solid rgba(234,179,8,0.22); }
        .ux-badge-completed { color: var(--primary); background: var(--secondary); border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent); }
        .ux-btn-rate {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #fff;
          box-shadow: 0 4px 12px rgba(245,158,11,0.30);
        }
        .ux-btn-rate:hover { opacity: 0.9; transform: scale(1.02); }
        .ux-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 16px;
        }
        .ux-detail-cell {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 14px;
        }
        .ux-detail-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: var(--muted-foreground);
          margin-bottom: 6px;
        }
        .ux-detail-value {
          font-size: 13px;
          font-weight: 700;
          color: var(--foreground);
          line-height: 1.4;
        }
        .ux-full-reason {
          margin-top: 12px;
          background: var(--background);
          border: 1px solid var(--border);
          border-left: 3px solid var(--primary);
          border-radius: 14px;
          padding: 14px;
        }
        .ux-timeline {
          margin-top: 14px;
        }
        .ux-timeline-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: var(--muted-foreground);
          margin-bottom: 10px;
        }
        .ux-timeline-steps {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .ux-timeline-step {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--muted-foreground);
        }
        .ux-timeline-step.active {
          background: var(--primary);
          color: var(--primary-foreground);
          border-color: var(--primary);
        }
        .ux-timeline-step .dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: currentColor;
        }
        .ux-divider {
          height: 1px;
          background: var(--border);
          margin: 16px 0;
        }
        .ux-rate-inline {
          padding: 14px;
          background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.04));
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 14px;
          margin-top: 14px;
        }
        .ux-rate-inline-label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: #d97706;
          margin-bottom: 8px;
          letter-spacing: .04em;
        }
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
        @media (max-width: 600px) {
          .ux-detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <Header />
      <div className="ux-wrap">
        <div className="ux-hero">
          <h1>My Appointments</h1>
          <p>View your healthcare journey and active clinical bookings.</p>
        </div>

        <input
          className="ux-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder=" Search by doctor, reason, or appointment ID..."
        />

        {loading && page === 0 && <PageLoader message="Loading your schedule..." fullPage={false} bg="Transparent"/>}
        {!loading && filtered.length === 0 && (
          <div className="ux-msg">
            No clinical records found matching your search.
          </div>
        )}

        <div className="ux-grid">
          {filtered.map((a) => {
            const isExpanded = expandedId === a.appointmentId;
            return (
              <div
                key={a.appointmentId}
                className="ux-card"
                onClick={() => toggleExpand(a.appointmentId)}
              >
                {/* Summary (always visible) */}
                <div className="ux-card-summary">
                  <div className="ux-row">
                    <div>
                      <div className="ux-name">Dr. {a.doctor?.name || "Healthcare Specialist"}</div>
                      <div className="ux-meta">{a.departmentName || a.doctor?.specialization || "Clinical Division"}</div>
                      <div className="ux-submeta">REF: {a.appointmentId}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className={badgeClassByStatus(a.status)}>{statusLabel(a.status)}</div>
                      <div className="ux-submeta" style={{ marginTop: 8, fontWeight: 700 }}>
                        {new Date(a.appointmentTime).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="ux-reason-preview">
                    {a.reason || "General Consultation"}
                  </div>
                  <div className="ux-expand-hint">
                    {isExpanded ? "▲ Hide details" : "▼ Click to view full details"}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div
                    className="ux-card-details"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="ux-divider" />

                    {/* Status Timeline */}
                    <div className="ux-timeline">
                      <div className="ux-timeline-title">Status Timeline</div>
                      <div className="ux-timeline-steps">
                        {[
                          { key: "PENDING",     label: "Pending" },
                          { key: "CONFIRMED",   label: "Confirmed" },
                          { key: "VISITED",     label: "Visited" },
                          { key: "QUEUED",      label: "Queued" },
                          { key: "IN_PROGRESS", label: "In Progress" },
                          { key: "COMPLETED",   label: "Completed" },
                        ].map((step) => {
                          const order = ["PENDING","CONFIRMED","VISITED","QUEUED","IN_PROGRESS","COMPLETED"];
                          const currentIdx = order.indexOf(a.status);
                          const stepIdx = order.indexOf(step.key);
                          const isDone = currentIdx >= stepIdx && currentIdx >= 0;
                          const isCancelled = a.status === "CANCELLED" || a.status === "NO_SHOW";
                          return (
                            <span
                              key={step.key}
                              className={`ux-timeline-step ${isDone && !isCancelled ? "active" : ""}`}
                            >
                              <span className="dot" />
                              {step.label}
                            </span>
                          );
                        })}
                        {(a.status === "CANCELLED" || a.status === "NO_SHOW") && (
                          <span className="ux-timeline-step" style={{ background: "var(--destructive)", color: "#fff", borderColor: "var(--destructive)" }}>
                            <span className="dot" />
                            {a.status === "CANCELLED" ? "Cancelled" : "No Show"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ux-detail-grid">
                      <div className="ux-detail-cell">
                        <div className="ux-detail-label">Appointment ID</div>
                        <div className="ux-detail-value" style={{ fontFamily: "monospace", fontSize: 11, wordBreak: "break-all" }}>
                          {a.appointmentId}
                        </div>
                      </div>
                      <div className="ux-detail-cell">
                        <div className="ux-detail-label">Schedule Time</div>
                        <div className="ux-detail-value">
                          {new Date(a.appointmentTime).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
                        </div>
                      </div>
                      <div className="ux-detail-cell">
                        <div className="ux-detail-label">Doctor</div>
                        <div className="ux-detail-value">Dr. {a.doctor?.name || "N/A"}</div>
                      </div>
                      <div className="ux-detail-cell">
                        <div className="ux-detail-label">Department</div>
                        <div className="ux-detail-value">{a.departmentName || a.doctor?.specialization || "N/A"}</div>
                      </div>
                      {a.queueNumber && (
                        <div className="ux-detail-cell">
                          <div className="ux-detail-label">Queue Position</div>
                          <div className="ux-detail-value">#{a.queueNumber}</div>
                        </div>
                      )}
                      {a.branch?.name && (
                        <div className="ux-detail-cell">
                          <div className="ux-detail-label">Branch</div>
                          <div className="ux-detail-value">{a.branch.name}</div>
                        </div>
                      )}
                    </div>

                    <div className="ux-full-reason">
                      <div className="ux-detail-label">Clinical Reason</div>
                      <div style={{ fontSize: 13, color: "var(--foreground)", marginTop: 6, lineHeight: 1.6 }}>
                        {a.reason || "General Consultation"}
                      </div>
                    </div>

                    {/* Prescription */}
                    {a.hasPrescription && (a.prescriptionDocumentStatus === "PENDING_GENERATION" || a.prescriptionDocumentStatus === "GENERATING") && (
                      <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--secondary)", borderRadius: 12, fontSize: 12, color: "var(--muted-foreground)", fontWeight: 700 }}>
                        ⏳ Prescription is being generated...
                      </div>
                    )}
                    {a.prescriptionDocumentStatus === "READY" && a.prescriptionDocumentUrl && (
                      <div style={{ marginTop: 14 }}>
                        <a
                          href={a.prescriptionDocumentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="ux-btn ux-btn-view"
                          style={{ display: "inline-flex" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          📄 Download Prescription PDF
                        </a>
                      </div>
                    )}

                    {/* Edit Rating section (inside expanded, only for COMPLETED) */}
                    {a.status === "COMPLETED" && (
                      <div className="ux-rate-inline">
                        <div className="ux-rate-inline-label">★ Rate Your Doctor</div>
                        <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: "0 0 10px" }}>
                          Share feedback about Dr. {a.doctor?.name || "your doctor"} to help others.
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRatingTarget({ doctorId: a.doctor?.id, doctorName: a.doctor?.name || "Doctor" });
                          }}
                          className="ux-btn ux-btn-rate"
                        >
                          ★ Update / Edit Rating
                        </button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="ux-actions">
                      <button
                        className="ux-btn ux-btn-view"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/appointment/${a.appointmentId}`);
                        }}
                      >
                        View Full Receipt
                      </button>
                      {a.status !== "CANCELLED" && a.status !== "COMPLETED" && a.status !== "NO_SHOW" && (
                        <button
                          disabled={busyId === a.appointmentId}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel(a);
                          }}
                          className="ux-btn ux-btn-cancel"
                        >
                          {busyId === a.appointmentId ? "Processing..." : "Cancel Visit"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
