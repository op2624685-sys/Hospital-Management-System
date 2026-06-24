import React, { useMemo, useState } from "react";
import Header from "../components/Header";
import appointmentApi from "../api/appointments";
import { useAuth } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQuery } from "@tanstack/react-query";

const formatDateTime = (value) => {
  if (!value) return "—";
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? value : dt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

const DoctorBookedDetails = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const { data: appointments = [], isFetching: loading, error } = useQuery({
    queryKey: ["doctor-appointments", "booked-details"],
    queryFn: async () => {
      const response = await appointmentApi.getDoctorAppointments();
      return response.data || [];
    },
    enabled: Boolean(user?.id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

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

  React.useEffect(() => {
    if (!error) return;
    console.error(error);
    toast.error("Failed to load booked appointments");
  }, [error]);

  const statusClass = (status) => {
    const value = (status || "").toUpperCase();
    if (value === "CONFIRMED")   return "doc-status doc-status-confirmed";
    if (value === "IN_PROGRESS") return "doc-status doc-status-progress";
    if (value === "VISITED")     return "doc-status doc-status-progress";
    if (value === "QUEUED")      return "doc-status doc-status-progress";
    if (value === "CANCELLED")   return "doc-status doc-status-cancelled";
    if (value === "COMPLETED")   return "doc-status doc-status-completed";
    if (value === "NO_SHOW")     return "doc-status doc-status-cancelled";
    return "doc-status doc-status-pending";
  };

  const statusLabel = (status) => {
    const map = {
      PENDING:     "Awaiting Confirmation",
      CONFIRMED:   "Confirmed",
      VISITED:     "Checked In",
      QUEUED:      "In Queue",
      IN_PROGRESS: "In Progress",
      COMPLETED:   "Completed",
      CANCELLED:   "Cancelled",
      NO_SHOW:     "No Show",
    };
    return map[(status || "").toUpperCase()] || (status || "PENDING");
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="doc-page">
      <style>{`
        .doc-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 100% 0%, rgba(37,99,235,.16), transparent 40%),
            radial-gradient(circle at 0% 100%, rgba(20,184,166,.14), transparent 45%),
            linear-gradient(170deg, #f8fbff 0%, #f8fafc 100%);
          background: var(--background);
        }
        .doc-wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 108px 20px 40px;
          color: var(--foreground);
        }
        .doc-hero {
          padding: 20px;
          border-radius: 18px;
          background: linear-gradient(120deg, #2563eb 0%, #0ea5e9 100%);
          color: #fff;
          box-shadow: 0 14px 36px rgba(37,99,235,.24);
          margin-bottom: 20px;
        }
        .doc-hero h1 { margin: 0; font-size: clamp(1.4rem, 2.6vw, 2rem); }
        .doc-hero p { margin: 8px 0 0; color: rgba(255,255,255,.88); font-size: 14px; }
        .doc-search {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1.5px solid var(--border);
          background: var(--card);
          color: var(--foreground);
          margin-bottom: 18px;
          box-shadow: 0 8px 26px rgba(37,99,235,0.06);
          outline: none;
          transition: all .2s;
        }
        .doc-search:focus {
          border-color: #93c5fd;
          box-shadow: 0 0 0 4px rgba(37,99,235,.12);
        }
        .doc-msg { color: var(--muted-foreground); padding: 20px 0; }
        .doc-grid {
          display: grid;
          gap: 14px;
        }
        .doc-card {
          border: 1.5px solid var(--border);
          border-radius: 18px;
          background: var(--card);
          box-shadow: 0 8px 24px rgba(15,23,42,.05);
          overflow: hidden;
          cursor: pointer;
          transition: border-color .2s, transform .2s;
          position: relative;
        }
        .doc-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #2563eb, #0ea5e9);
          opacity: 0; transition: opacity .2s;
        }
        .doc-card:hover { border-color: #93c5fd; transform: translateY(-2px); }
        .doc-card:hover::before { opacity: 1; }

        .doc-summary {
          padding: 18px 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          flex-wrap: wrap;
        }
        .doc-title { font-weight: 800; color: var(--foreground); font-size: 16px; }
        .doc-id { font-size: 12px; color: var(--muted-foreground); margin-top: 2px; }
        .doc-summary-meta { font-size: 13px; color: var(--muted-foreground); margin-top: 4px; }
        .doc-summary-reason {
          font-size: 13px;
          color: var(--foreground);
          background: var(--background);
          border-left: 3px solid #2563eb;
          padding: 6px 12px;
          border-radius: 8px;
          margin-top: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .doc-expand-hint {
          font-size: 11px;
          font-weight: 700;
          color: #2563eb;
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .doc-status {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 5px 12px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }
        .doc-status-confirmed  { color: #0f766e; background: #ccfbf1; border: 1px solid #99f6e4; }
        .doc-status-progress   { color: #1d4ed8; background: #dbeafe; border: 1px solid #93c5fd; }
        .doc-status-completed  { color: #6d28d9; background: #ede9fe; border: 1px solid #c4b5fd; }
        .doc-status-cancelled  { color: #991b1b; background: #fee2e2; border: 1px solid #fecaca; }
        .doc-status-pending    { color: #a16207; background: #fef3c7; border: 1px solid #fde68a; }

        .doc-details {
          border-top: 1.5px solid var(--border);
          padding: 18px 20px 20px;
          animation: docSlide .22s ease;
        }
        @keyframes docSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .doc-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 14px;
        }
        .doc-detail-cell {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px;
        }
        .doc-detail-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: var(--muted-foreground);
          margin-bottom: 5px;
        }
        .doc-detail-value {
          font-size: 13px;
          font-weight: 700;
          color: var(--foreground);
          line-height: 1.4;
          word-break: break-word;
        }
        .doc-full-reason {
          background: var(--background);
          border: 1px solid var(--border);
          border-left: 3px solid #2563eb;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 14px;
        }
        .doc-timeline {
          margin-top: 14px;
        }
        .doc-timeline-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: var(--muted-foreground);
          margin-bottom: 8px;
        }
        .doc-timeline-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 8px;
        }
        .doc-time-item {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px;
        }
        .doc-time-item span { display: block; font-size: 10px; text-transform: uppercase; color: var(--muted-foreground); font-weight: 800; margin-bottom: 4px; }
        .doc-time-item strong { font-size: 12px; color: var(--foreground); }
        @media (max-width: 600px) {
          .doc-detail-grid { grid-template-columns: 1fr; }
          .doc-summary { flex-direction: column; }
        }
      `}</style>

      <Header />

      <div className="doc-wrap">
        <div className="doc-hero">
          <h1>Booked Appointment Details</h1>
          <p>Doctor #{user?.id} · View all bookings assigned to you. Click an appointment to see full details.</p>
        </div>

        <input
          className="doc-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by patient name, appointment ID, reason"
        />

        {loading && <p className="doc-msg">Loading appointments...</p>}
        {!loading && filtered.length === 0 && (
          <p className="doc-msg">No booked appointments found.</p>
        )}

        <div className="doc-grid">
          {filtered.map((a) => {
            const isExpanded = expandedId === a.appointmentId;
            return (
              <div
                key={a.appointmentId}
                className="doc-card"
                onClick={() => toggleExpand(a.appointmentId)}
              >
                {/* Summary */}
                <div className="doc-summary">
                  <div style={{ flex: 1 }}>
                    <div className="doc-title">{a.patient?.name || "Unknown Patient"}</div>
                    <div className="doc-id">ID: {a.appointmentId}</div>
                    <div className="doc-summary-meta">
                      {formatDateTime(a.appointmentTime)}
                    </div>
                    <div className="doc-summary-reason">
                      {a.reason || "General Consultation"}
                    </div>
                    <div className="doc-expand-hint">
                      {isExpanded ? "▲ Hide details" : "▼ Click for full details"}
                    </div>
                  </div>
                  <div>
                    <span className={statusClass(a.status)}>{statusLabel(a.status)}</span>
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div
                    className="doc-details"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="doc-detail-grid">
                      <div className="doc-detail-cell">
                        <div className="doc-detail-label">Patient Email</div>
                        <div className="doc-detail-value">{a.patient?.email || "—"}</div>
                      </div>
                      <div className="doc-detail-cell">
                        <div className="doc-detail-label">Patient DOB</div>
                        <div className="doc-detail-value">{a.patient?.birthDate || "—"}</div>
                      </div>
                      <div className="doc-detail-cell">
                        <div className="doc-detail-label">Branch</div>
                        <div className="doc-detail-value">{a.branch?.name || "—"}</div>
                      </div>
                      <div className="doc-detail-cell">
                        <div className="doc-detail-label">Department</div>
                        <div className="doc-detail-value">{a.departmentName || "—"}</div>
                      </div>
                      {a.queueNumber && (
                        <div className="doc-detail-cell">
                          <div className="doc-detail-label">Queue Position</div>
                          <div className="doc-detail-value">#{a.queueNumber}</div>
                        </div>
                      )}
                    </div>

                    <div className="doc-full-reason">
                      <div className="doc-detail-label">Clinical Reason</div>
                      <div style={{ fontSize: 13, color: "var(--foreground)", marginTop: 6, lineHeight: 1.6 }}>
                        {a.reason || "General Consultation"}
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="doc-timeline">
                      <div className="doc-timeline-label">Status Timeline</div>
                      <div className="doc-timeline-grid">
                        {[
                          ["Confirmed",   a.confirmedAt],
                          ["Visited",     a.visitedAt],
                          ["Queued",      a.queuedAt],
                          ["In Progress", a.inProgressAt],
                          ["Completed",   a.completedAt],
                          ["No Show",     a.noShowAt],
                        ].filter(([, v]) => v).map(([label, value]) => (
                          <div key={label} className="doc-time-item">
                            <span>{label}</span>
                            <strong>{formatDateTime(value)}</strong>
                          </div>
                        ))}
                        {[a.confirmedAt, a.visitedAt, a.queuedAt, a.inProgressAt, a.completedAt, a.noShowAt].every((v) => !v) && (
                          <div style={{ color: "var(--muted-foreground)", fontSize: 12, fontStyle: "italic" }}>No timeline events recorded yet.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default DoctorBookedDetails;
