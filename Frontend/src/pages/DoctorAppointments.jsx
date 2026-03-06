import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import appointmentApi from "../api/appointments";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DoctorAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [query, setQuery] = useState("");
  const [formById, setFormById] = useState({});

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentApi.getDoctorAppointments();
      setAppointments(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
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

  const handleStatusSave = async (appointment) => {
    const form = getForm(appointment);
    setSavingId(appointment.appointmentId);
    try {
      const response = await appointmentApi.updateStatus(
        appointment.appointmentId,
        form.status
      );
      setAppointments((prev) =>
        prev.map((item) =>
          item.appointmentId === appointment.appointmentId ? response.data : item
        )
      );
      toast.success("Status updated and email sent");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setSavingId(null);
    }
  };

  const handleDetailsSave = async (appointment) => {
    const form = getForm(appointment);
    setSavingId(appointment.appointmentId);
    try {
      const response = await appointmentApi.updateDetails(appointment.appointmentId, {
        appointmentTime: form.appointmentTime || null,
        reason: form.reason || null,
      });
      setAppointments((prev) =>
        prev.map((item) =>
          item.appointmentId === appointment.appointmentId ? response.data : item
        )
      );
      toast.success("Appointment updated and email sent");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update appointment");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b1020", color: "#fff" }}>
      <Header />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "110px 20px 30px" }}>
        <h1 style={{ fontSize: 32, marginBottom: 6 }}>Doctor Appointments</h1>
        <p style={{ color: "#9ca3af", marginBottom: 18 }}>
          Logged in as doctor #{user?.id}. Update status, time, or reason. Patients get email on every change.
        </p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by patient name, appointment ID, reason"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #334155",
            background: "#111827",
            color: "#fff",
            marginBottom: 20,
          }}
        />

        {loading && <p style={{ color: "#94a3b8" }}>Loading appointments...</p>}
        {!loading && filtered.length === 0 && (
          <p style={{ color: "#94a3b8" }}>No appointments found.</p>
        )}

        <div style={{ display: "grid", gap: 14 }}>
          {filtered.map((a) => {
            const form = getForm(a);
            const isSaving = savingId === a.appointmentId;
            return (
              <div
                key={a.appointmentId}
                style={{
                  border: "1px solid #334155",
                  borderRadius: 14,
                  padding: 16,
                  background: "#111827",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{a.patient?.name || "Unknown patient"}</div>
                    <div style={{ color: "#93c5fd", fontSize: 13 }}>{a.patient?.email}</div>
                    <div style={{ color: "#94a3b8", fontSize: 12 }}>ID: {a.appointmentId}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#cbd5e1" }}>
                    Current status: <strong>{a.status}</strong>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 12, color: "#cbd5e1" }}>Appointment time</span>
                    <input
                      type="datetime-local"
                      value={form.appointmentTime}
                      onChange={(e) => setForm(a.appointmentId, { appointmentTime: e.target.value })}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #475569",
                        background: "#0f172a",
                        color: "#fff",
                      }}
                    />
                  </label>

                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 12, color: "#cbd5e1" }}>Status</span>
                    <select
                      value={form.status}
                      onChange={(e) => setForm(a.appointmentId, { status: e.target.value })}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #475569",
                        background: "#0f172a",
                        color: "#fff",
                      }}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </label>
                </div>

                <label style={{ display: "grid", gap: 6, marginTop: 10 }}>
                  <span style={{ fontSize: 12, color: "#cbd5e1" }}>Reason</span>
                  <input
                    value={form.reason}
                    onChange={(e) => setForm(a.appointmentId, { reason: e.target.value })}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #475569",
                      background: "#0f172a",
                      color: "#fff",
                    }}
                  />
                </label>

                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <button
                    disabled={isSaving}
                    onClick={() => handleStatusSave(a)}
                    style={{
                      padding: "10px 14px",
                      border: "none",
                      borderRadius: 10,
                      background: "#2563eb",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Save Status
                  </button>
                  <button
                    disabled={isSaving}
                    onClick={() => handleDetailsSave(a)}
                    style={{
                      padding: "10px 14px",
                      border: "none",
                      borderRadius: 10,
                      background: "#059669",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Save Time/Reason
                  </button>
                  <button
                    disabled={isSaving}
                    onClick={loadAppointments}
                    style={{
                      padding: "10px 14px",
                      border: "1px solid #475569",
                      borderRadius: 10,
                      background: "transparent",
                      color: "#e2e8f0",
                      cursor: "pointer",
                    }}
                  >
                    Refresh
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default DoctorAppointments;
