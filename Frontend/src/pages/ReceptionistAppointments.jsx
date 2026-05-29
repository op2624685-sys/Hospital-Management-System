import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "../components/Header";
import appointmentApi from "../api/appointments";
import { receptionistAPI } from "../api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const STATUS_FLOW = {
  CONFIRMED: ["VISITED", "NO_SHOW"],
  VISITED: ["QUEUED"],
  QUEUED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
};

const formatDateTime = (value) => {
  if (!value) return "Not recorded";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString("en-IN");
};

const formatStatusLabel = (value) => {
  if (!value) return "Unknown";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const ReceptionistAppointments = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [patientName, setPatientName] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["receptionist-profile"],
    queryFn: async () => (await receptionistAPI.getProfile()).data,
  });

  const appointmentQuery = useQuery({
    queryKey: ["receptionist-appointments", search, status, selectedDoctorId],
    queryFn: async () => {
      const response = await appointmentApi.getReceptionistAppointments({
        search: search || undefined,
        status: status || undefined,
        doctorId: selectedDoctorId || undefined,
      });
      return response.data || [];
    },
  });

  const queueQuery = useQuery({
    queryKey: ["receptionist-queue"],
    queryFn: async () => (await appointmentApi.getDepartmentQueue()).data || [],
    refetchInterval: 20000,
  });

  const searchQuery = useQuery({
    queryKey: ["receptionist-search", selectedAppointmentId, patientName, birthDate],
    queryFn: async () => {
      const response = await appointmentApi.searchReceptionistAppointments({
        appointmentId: selectedAppointmentId || undefined,
        patientName: patientName || undefined,
        birthDate: birthDate || undefined,
      });
      return response.data || [];
    },
    enabled: Boolean(selectedAppointmentId || (patientName && birthDate)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ appointmentId, nextStatus }) =>
      appointmentApi.updateReceptionistStatus(appointmentId, nextStatus),
    onSuccess: () => {
      toast.success("Appointment status updated");
      queryClient.invalidateQueries({ queryKey: ["receptionist-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["receptionist-queue"] });
      queryClient.invalidateQueries({ queryKey: ["receptionist-search"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Status update failed");
    },
  });

  const appointments = appointmentQuery.data || [];
  const searchResults = searchQuery.data || [];
  const departmentQueue = queueQuery.data || [];

  const doctorOptions = useMemo(() => {
    const map = new Map();
    for (const appointment of appointments) {
      if (appointment.doctor?.id && !map.has(appointment.doctor.id)) {
        map.set(appointment.doctor.id, appointment.doctor.name);
      }
    }
    return Array.from(map.entries());
  }, [appointments]);

  const appointmentCards = searchResults.length > 0 ? searchResults : appointments;

  const summaryCards = useMemo(() => {
    const waitingCount = departmentQueue.reduce((total, queue) => total + (queue.waitingCount || 0), 0);
    const confirmedCount = appointments.filter((appointment) => appointment.status?.toUpperCase() === "CONFIRMED").length;
    const activeCount = appointments.filter((appointment) =>
      ["VISITED", "QUEUED", "IN_PROGRESS"].includes(appointment.status?.toUpperCase())
    ).length;
    const completedCount = appointments.filter((appointment) => appointment.status?.toUpperCase() === "COMPLETED").length;

    return [
      { label: "Today's Appointments", value: appointments.length, tone: "neutral" },
      { label: "Awaiting Check-In", value: confirmedCount, tone: "attention" },
      { label: "Active Patient Flow", value: activeCount + waitingCount, tone: "primary" },
      { label: "Completed Visits", value: completedCount, tone: "success" },
    ];
  }, [appointments, departmentQueue]);

  const renderTimeline = (appointment) => {
    const items = [
      ["Confirmed", appointment.confirmedAt],
      ["Visited", appointment.visitedAt],
      ["Queued", appointment.queuedAt],
      ["In Progress", appointment.inProgressAt],
      ["Completed", appointment.completedAt],
      ["No Show", appointment.noShowAt],
    ];

    return (
      <div className="rc-timeline">
        {items.map(([label, value]) => (
          <div key={label} className="rc-time-item">
            <span>{label}</span>
            <strong>{formatDateTime(value)}</strong>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="rc-page">
      <style>{`
        .rc-page {
          min-height: 100vh;
          color: var(--foreground);
          background:
            radial-gradient(circle at top left, color-mix(in srgb, var(--secondary) 65%, transparent), transparent 30%),
            linear-gradient(180deg, color-mix(in srgb, var(--background) 92%, white 8%), var(--background));
        }
        .rc-wrap { max-width: 1360px; margin: 0 auto; padding: 118px 20px 56px; }
        .rc-hero, .rc-panel, .rc-card, .rc-queue-card, .rc-summary-card { border-radius: 28px; }
        .rc-hero, .rc-panel, .rc-card, .rc-queue-card {
          background: color-mix(in srgb, var(--card) 92%, transparent);
          border: 1px solid color-mix(in srgb, var(--border) 85%, transparent);
          box-shadow: 0 24px 60px color-mix(in srgb, var(--foreground) 8%, transparent);
          backdrop-filter: blur(12px);
        }
        .rc-hero {
          padding: 34px;
          margin-bottom: 20px;
          background:
            radial-gradient(circle at top right, color-mix(in srgb, var(--primary) 16%, transparent), transparent 34%),
            radial-gradient(circle at bottom left, color-mix(in srgb, var(--secondary) 70%, transparent), transparent 32%),
            color-mix(in srgb, var(--card) 96%, transparent);
        }
        .rc-hero-top { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; flex-wrap: wrap; }
        .rc-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
          padding: 7px 12px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--primary) 10%, transparent);
          color: var(--primary);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .rc-hero h1 { margin: 0; font-size: clamp(2.1rem, 4vw, 3.3rem); line-height: 1.02; letter-spacing: -0.03em; }
        .rc-hero p { max-width: 760px; color: var(--muted-foreground); margin: 12px 0 0; line-height: 1.65; }
        .rc-meta { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px; }
        .rc-chip {
          padding: 9px 14px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--background) 65%, white 35%);
          color: var(--foreground);
          font-size: 12px;
          font-weight: 800;
          border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
        }
        .rc-summary-grid { display: grid; gap: 16px; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 20px; }
        .rc-summary-card {
          position: relative;
          overflow: hidden;
          padding: 20px;
          background: color-mix(in srgb, var(--card) 94%, transparent);
          border: 1px solid color-mix(in srgb, var(--border) 75%, transparent);
        }
        .rc-summary-card::before {
          content: "";
          position: absolute;
          inset: 0 auto auto 0;
          width: 100%;
          height: 4px;
          background: color-mix(in srgb, var(--primary) 22%, transparent);
        }
        .rc-summary-card.primary::before { background: linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--chart-5) 80%, white 20%)); }
        .rc-summary-card.success::before { background: linear-gradient(90deg, #2f7d57, #5eb88b); }
        .rc-summary-card.attention::before { background: linear-gradient(90deg, #a35f17, #efb562); }
        .rc-summary-label { font-size: 12px; font-weight: 800; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.08em; }
        .rc-summary-value { margin-top: 12px; font-size: clamp(1.9rem, 4vw, 2.7rem); font-weight: 900; letter-spacing: -0.04em; }
        .rc-summary-note { margin-top: 8px; color: var(--muted-foreground); font-size: 13px; }
        .rc-grid { display: grid; gap: 20px; grid-template-columns: minmax(0, 1.55fr) minmax(320px, .92fr); }
        .rc-panel { padding: 24px; }
        .rc-panel-head { display: flex; justify-content: space-between; gap: 12px; align-items: end; flex-wrap: wrap; margin-bottom: 18px; }
        .rc-panel-head p { margin: 6px 0 0; color: var(--muted-foreground); font-size: 14px; }
        .rc-controls, .rc-search-row { display: grid; gap: 12px; margin-bottom: 16px; }
        .rc-controls { grid-template-columns: 1.35fr .85fr .95fr auto; }
        .rc-search-row { grid-template-columns: 1fr 1fr .85fr auto; }
        .rc-input {
          width: 100%;
          min-height: 48px;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
          background: color-mix(in srgb, var(--background) 82%, white 18%);
          color: var(--foreground);
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
        }
        .rc-input:focus {
          border-color: color-mix(in srgb, var(--primary) 50%, var(--border));
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 10%, transparent);
          transform: translateY(-1px);
        }
        .rc-section-title { font-size: 1.12rem; font-weight: 900; margin: 0; letter-spacing: -0.02em; }
        .rc-list, .rc-queue-list { display: grid; gap: 14px; }
        .rc-card { padding: 22px; }
        .rc-card-top { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .rc-patient-name { margin: 0; font-size: 1.18rem; letter-spacing: -0.02em; }
        .rc-subline { color: var(--muted-foreground); margin-top: 7px; line-height: 1.5; }
        .rc-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
          background: color-mix(in srgb, var(--secondary) 70%, white 30%);
          border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
        }
        .rc-badge.queue { background: color-mix(in srgb, var(--primary) 12%, transparent); color: var(--primary); }
        .rc-details, .rc-timeline { display: grid; gap: 12px; margin-top: 18px; }
        .rc-details { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .rc-timeline { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .rc-detail, .rc-time-item {
          border-radius: 18px;
          padding: 14px;
          border: 1px solid color-mix(in srgb, var(--border) 76%, transparent);
        }
        .rc-detail { background: color-mix(in srgb, var(--secondary) 48%, white 52%); }
        .rc-time-item { background: color-mix(in srgb, var(--background) 88%, white 12%); }
        .rc-detail span, .rc-time-item span {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          color: var(--muted-foreground);
          margin-bottom: 5px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }
        .rc-detail strong, .rc-time-item strong { display: block; font-size: 13px; line-height: 1.5; }
        .rc-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 18px; align-items: center; }
        .rc-select-wrap { position: relative; min-width: 210px; }
        .rc-select-wrap select { appearance: none; cursor: pointer; padding-right: 36px; font-weight: 800; }
        .rc-select-arrow { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--muted-foreground); font-size: 10px; }
        .rc-btn {
          border: none;
          border-radius: 14px;
          min-height: 46px;
          padding: 10px 16px;
          font-weight: 900;
          cursor: pointer;
          transition: transform .2s ease, filter .2s ease, box-shadow .2s ease;
        }
        .rc-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.03); }
        .rc-btn:disabled { cursor: not-allowed; opacity: .7; }
        .rc-btn.primary {
          background: linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--chart-5) 86%, white 14%));
          color: var(--primary-foreground);
          box-shadow: 0 14px 28px color-mix(in srgb, var(--primary) 18%, transparent);
        }
        .rc-btn.secondary {
          background: color-mix(in srgb, var(--background) 82%, white 18%);
          color: var(--foreground);
          border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
        }
        .rc-queue-card { padding: 18px; }
        .rc-queue-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .rc-queue-subtitle { color: var(--muted-foreground); font-size: 13px; margin-top: 4px; }
        .rc-queue-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 10px;
          border-top: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
          font-size: 13px;
          transition: all 0.2s ease;
          border-radius: 8px;
        }
        .rc-queue-row:hover:not(.empty) {
          background: color-mix(in srgb, var(--primary) 8%, transparent);
          transform: translateX(4px);
        }
        .rc-empty {
          padding: 18px;
          border-radius: 18px;
          background: color-mix(in srgb, var(--background) 88%, white 12%);
          border: 1px dashed color-mix(in srgb, var(--border) 85%, transparent);
          color: var(--muted-foreground);
        }
        @media (max-width: 980px) {
          .rc-summary-grid, .rc-grid, .rc-controls, .rc-search-row, .rc-details, .rc-timeline { grid-template-columns: 1fr; }
        }
        @media (max-width: 720px) {
          .rc-wrap { padding: 102px 14px 34px; }
          .rc-hero, .rc-panel, .rc-card, .rc-queue-card { border-radius: 22px; }
          .rc-hero, .rc-panel, .rc-card { padding-left: 18px; padding-right: 18px; }
        }
      `}</style>

      <Header />

      <div className="rc-wrap">
        <section className="rc-hero">
          <div className="rc-hero-top">
            <div>
              <div className="rc-kicker">Front Desk Operations</div>
              <h1>Reception Desk</h1>
              <p>Manage check-ins, queue progression, and visit completion from one clean control surface for your assigned department.</p>
            </div>
          </div>
          <div className="rc-meta">
            <span className="rc-chip">Branch: {profile?.branch?.name || "Loading..."}</span>
            <span className="rc-chip">Department: {profile?.departmentName || "Loading..."}</span>
          </div>
        </section>

        <section className="rc-summary-grid">
          {summaryCards.map((card) => (
            <article key={card.label} className={`rc-summary-card ${card.tone}`}>
              <div className="rc-summary-label">{card.label}</div>
              <div className="rc-summary-value">{card.value}</div>
              <div className="rc-summary-note">Live operational snapshot for the current view.</div>
            </article>
          ))}
        </section>

        <div className="rc-grid">
          <section className="rc-panel">
            <div className="rc-panel-head">
              <div>
                <h2 className="rc-section-title">Department Appointments</h2>
                <p>Search, verify, and move each patient through the desk workflow.</p>
              </div>
            </div>

            <div className="rc-controls">
              <input
                className="rc-input"
                placeholder="Search by patient, doctor, reason, or ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select className="rc-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All statuses</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="VISITED">VISITED</option>
                <option value="QUEUED">QUEUED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="NO_SHOW">NO_SHOW</option>
              </select>
              <select className="rc-input" value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)}>
                <option value="">All doctors</option>
                {doctorOptions.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              <button
                className="rc-btn secondary"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setSelectedDoctorId("");
                }}
              >
                Reset filters
              </button>
            </div>

            <div className="rc-search-row">
              <input
                className="rc-input"
                placeholder="Search exact appointment ID"
                value={selectedAppointmentId}
                onChange={(e) => setSelectedAppointmentId(e.target.value)}
              />
              <input
                className="rc-input"
                placeholder="Search patient name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
              <input className="rc-input" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              <button
                className="rc-btn secondary"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["receptionist-search"] })}
              >
                Search verify
              </button>
            </div>

            <div className="rc-list">
              {appointmentCards.map((appointment) => (
                <article key={appointment.appointmentId} className="rc-card">
                  <div className="rc-card-top">
                    <div>
                      <h3 className="rc-patient-name">{appointment.patient?.name}</h3>
                      <div className="rc-subline">
                        {appointment.appointmentId} | Dr. {appointment.doctor?.name} | {appointment.departmentName}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <span className="rc-badge">{formatStatusLabel(appointment.status)}</span>
                      {appointment.queueNumber ? <span className="rc-badge queue">Queue #{appointment.queueNumber}</span> : null}
                    </div>
                  </div>

                  <div className="rc-details">
                    <div className="rc-detail">
                      <span>Booked Time</span>
                      <strong>{formatDateTime(appointment.appointmentTime)}</strong>
                    </div>
                    <div className="rc-detail">
                      <span>Patient DOB</span>
                      <strong>{appointment.patient?.birthDate || "N/A"}</strong>
                    </div>
                    <div className="rc-detail">
                      <span>Reason</span>
                      <strong>{appointment.reason || "N/A"}</strong>
                    </div>
                  </div>

                  {renderTimeline(appointment)}

                  <div className="rc-actions">
                    <div className="rc-select-wrap">
                      <select
                        className="rc-input"
                        value={appointment.status?.toUpperCase() || ""}
                        disabled={updateMutation.isPending || ["COMPLETED", "CANCELLED", "REFUNDED", "NO_SHOW"].includes(appointment.status?.toUpperCase())}
                        onChange={(e) => {
                          const nextStatus = e.target.value;
                          if (nextStatus && nextStatus !== appointment.status?.toUpperCase()) {
                            updateMutation.mutate({ appointmentId: appointment.appointmentId, nextStatus });
                          }
                        }}
                      >
                        <option value={appointment.status?.toUpperCase() || ""} disabled>
                          Current: {formatStatusLabel(appointment.status)}
                        </option>
                        {(STATUS_FLOW[appointment.status?.toUpperCase()] || []).map((nextStatus) => (
                          <option key={nextStatus} value={nextStatus}>
                            Move to: {formatStatusLabel(nextStatus)}
                          </option>
                        ))}
                      </select>
                      <span className="rc-select-arrow">▼</span>
                    </div>

                    {(STATUS_FLOW[appointment.status?.toUpperCase()] || []).map((nextStatus) => (
                      <button
                        key={nextStatus}
                        className="rc-btn primary"
                        disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ appointmentId: appointment.appointmentId, nextStatus })}
                      >
                        Mark {formatStatusLabel(nextStatus)}
                      </button>
                    ))}
                  </div>
                </article>
              ))}

              {!appointmentQuery.isLoading && appointmentCards.length === 0 && (
                <div className="rc-empty">No appointments found for this department.</div>
              )}
            </div>
          </section>

          <aside className="rc-panel">
            <div className="rc-panel-head">
              <div>
                <h2 className="rc-section-title">Doctor Queues</h2>
                <p>Current waiting lines grouped by doctor in your department.</p>
              </div>
            </div>

            <div className="rc-queue-list">
              {departmentQueue.map((queue) => (
                <article key={queue.doctorId} className="rc-queue-card">
                  <div className="rc-queue-header">
                    <div>
                      <strong>Dr. {queue.doctorName || "Doctor"}</strong>
                      <div className="rc-queue-subtitle">{queue.departmentName}</div>
                    </div>
                    <span className="rc-badge queue">{queue.waitingCount} waiting</span>
                  </div>
                  {(queue.queue || []).map((entry) => (
                    <div
                      key={entry.appointmentId}
                      className="rc-queue-row"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedAppointmentId(entry.appointmentId);
                        setPatientName("");
                        setBirthDate("");
                        toast.info(`Selected appointment for ${entry.patientName}`);
                      }}
                      title="Click to select and manage this appointment"
                    >
                      <div>#{entry.queueNumber} {entry.patientName}</div>
                      <div>{formatDateTime(entry.appointmentTime)}</div>
                    </div>
                  ))}
                  {(!queue.queue || queue.queue.length === 0) && (
                    <div className="rc-queue-row empty">
                      <div>No queued patients</div>
                      <div>-</div>
                    </div>
                  )}
                </article>
              ))}

              {!queueQuery.isLoading && departmentQueue.length === 0 && (
                <div className="rc-empty">No active queues for this department today.</div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default ReceptionistAppointments;
