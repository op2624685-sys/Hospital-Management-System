import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import appointmentApi from "../api/appointments";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageLoader from "../components/PageLoader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const DoctorAppointments = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [savingId, setSavingId] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const size = 15;

  const {
    data: appointments = [],
    isFetching: loading,
    error,
  } = useQuery({
    queryKey: ["doctor-appointments", page, size],
    queryFn: async () => {
      const response = await appointmentApi.getDoctorAppointments(null, page, size);
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
    const msg = error.response?.data?.message || "Failed to load appointments";
    toast.error(msg);
  }, [error]);

  const hasMore = appointments.length === size;

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

  const handleStatusUpdate = async (appointment, status) => {
    setSavingId(appointment.appointmentId);
    try {
      const response = await appointmentApi.updateStatus(appointment.appointmentId, status);
      queryClient.setQueryData(["doctor-appointments", page, size], (prev = []) =>
        prev.map((item) =>
          item.appointmentId === appointment.appointmentId ? response.data : item
        )
      );
      toast.success(`Appointment marked ${status}`);
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
    if (value === "CANCELLED") return "dr-badge dr-badge-rejected";
    if (value === "COMPLETED") return "dr-badge dr-badge-completed";
    if (value === "IN_PROGRESS") return "dr-badge dr-badge-progress";
    if (value === "QUEUED") return "dr-badge dr-badge-progress";
    if (value === "VISITED") return "dr-badge dr-badge-pending";
    if (value === "NO_SHOW") return "dr-badge dr-badge-rejected";
    return "dr-badge dr-badge-pending";
  };

  const allowedActions = (status) => {
    if (status === "QUEUED") return [{ label: "Start Visit", status: "IN_PROGRESS" }];
    if (status === "IN_PROGRESS") return [{ label: "Complete Visit", status: "COMPLETED" }];
    return [];
  };

  const canManagePrescription = (status) => status === "IN_PROGRESS" || status === "COMPLETED";

  const renderTimestamp = (label, value) => (
    <div className="dr-line"><strong>{label}:</strong> {value ? new Date(value).toLocaleString("en-IN") : "Not recorded"}</div>
  );

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

        {loading && page === 0 && <PageLoader message="Fetching clinic schedule..." fullPage={false} bg="Transparent" />}
        {!loading && filtered.length === 0 && (
          <p className="dr-msg">No clinical records found.</p>
        )}

        <div className="dr-grid">
          {filtered.map((a) => {
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
                      value={a.appointmentTime}
                      readOnly
                      style={{ backgroundColor: "var(--background)", cursor: "not-allowed", opacity: 0.7 }}
                    />
                  </label>

                  <div className="dr-label">
                    <span>Queue Position</span>
                    <div style={{ background: 'var(--background)', padding: '12px 14px', borderRadius: '12px', fontSize: '14px', border: '1.5px solid var(--border)' }}>
                      {a.queueNumber ? `Queue #${a.queueNumber}` : "Not queued"}
                    </div>
                  </div>
                </div>

                <div className="dr-label" style={{ marginTop: 16 }}>
                  <span>Clinical Reason</span>
                  <div style={{ background: 'var(--background)', padding: '12px 14px', borderRadius: '12px', fontSize: '14px', border: '1.5px solid var(--border)' }}>
                    {a.reason || "N/A"}
                  </div>
                </div>

                <div className="dr-form-grid" style={{ marginTop: 16 }}>
                  <div className="dr-label">
                    <span>Status Timeline</span>
                    <div style={{ display: "grid", gap: 6 }}>
                      {renderTimestamp("Visited", a.visitedAt)}
                      {renderTimestamp("Queued", a.queuedAt)}
                      {renderTimestamp("In Progress", a.inProgressAt)}
                      {renderTimestamp("Completed", a.completedAt)}
                      {renderTimestamp("No Show", a.noShowAt)}
                    </div>
                  </div>
                  <div className="dr-label">
                    <span>Branch and Department</span>
                    <div style={{ display: "grid", gap: 6 }}>
                      <div className="dr-line"><strong>Branch:</strong> {a.branch?.name || "N/A"}</div>
                      <div className="dr-line"><strong>Department:</strong> {a.departmentName || "N/A"}</div>
                      <div className="dr-line"><strong>DOB:</strong> {a.patient?.birthDate || "N/A"}</div>
                    </div>
                  </div>
                </div>

                <div className="dr-actions">
                  {allowedActions(a.status).map((action) => (
                    <button
                      key={action.status}
                      disabled={isSaving}
                      onClick={() => handleStatusUpdate(a, action.status)}
                      className="dr-btn dr-btn-primary"
                    >
                      {isSaving ? "Updating..." : action.label}
                    </button>
                  ))}
                  {canManagePrescription(a.status) && (
                    <button
                      disabled={isSaving}
                      onClick={() =>
                        navigate(`/doctor/appointments/${a.appointmentId}/prescription`, {
                          state: { appointment: a },
                        })
                      }
                      className="dr-btn dr-btn-primary"
                    >
                      {a.hasPrescription ? "Edit Prescription" : "Create Prescription"}
                    </button>
                  )}
                  {a.prescriptionDocumentStatus === "PENDING_GENERATION" || a.prescriptionDocumentStatus === "GENERATING" ? (
                    <div className="dr-btn dr-btn-outline" style={{ cursor: "default" }}>
                      Generating prescription...
                    </div>
                  ) : null}
                  {a.prescriptionDocumentStatus === "READY" && a.prescriptionDocumentUrl && (
                    <a
                      className="dr-btn dr-btn-outline"
                      href={a.prescriptionDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      Open PDF
                    </a>
                  )}
                  <button
                    disabled={isSaving}
                    onClick={() =>
                      queryClient.invalidateQueries({
                        queryKey: ["doctor-appointments", page, size],
                      })
                    }
                    className="dr-btn dr-btn-outline"
                  >
                    Refresh
                  </button>
                  {a.status === "NO_SHOW" && (
                    <div className="dr-btn dr-btn-outline" style={{ cursor: "default" }}>
                      Patient did not check in
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="dr-pagination">
          <button
            disabled={loading || page === 0}
            onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
            className="dr-btn dr-btn-outline"
          >
            ← Previous
          </button>
          <span className="dr-page-num">Page {page + 1}</span>
          <button
            disabled={loading || !hasMore}
            onClick={() => setPage((currentPage) => currentPage + 1)}
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
