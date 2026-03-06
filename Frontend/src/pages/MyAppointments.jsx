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

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentApi.getMyAppointments();
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
    const q = search.toLowerCase().trim();
    if (!q) return appointments;
    return appointments.filter((a) => {
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

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#fff" }}>
      <Header />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "110px 20px 30px" }}>
        <h1 style={{ fontSize: 32, marginBottom: 6 }}>My Appointments</h1>
        <p style={{ color: "#94a3b8", marginBottom: 16 }}>
          View all your bookings, open details, or cancel upcoming appointments.
        </p>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by doctor, reason, or appointment ID"
          style={{
            width: "100%",
            borderRadius: 12,
            border: "1px solid #334155",
            background: "#111827",
            color: "#fff",
            padding: "12px 14px",
            marginBottom: 16,
          }}
        />

        {loading && <p style={{ color: "#94a3b8" }}>Loading appointments...</p>}
        {!loading && filtered.length === 0 && (
          <p style={{ color: "#94a3b8" }}>No appointments found.</p>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map((a) => (
            <div
              key={a.appointmentId}
              style={{
                border: "1px solid #334155",
                borderRadius: 12,
                background: "#111827",
                padding: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Dr. {a.doctor?.name || "Unknown"}</div>
                  <div style={{ color: "#93c5fd", fontSize: 13 }}>{a.doctor?.specialization || "General"}</div>
                  <div style={{ color: "#cbd5e1", fontSize: 12 }}>ID: {a.appointmentId}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#f8fafc", fontWeight: 600 }}>{a.status}</div>
                  <div style={{ color: "#94a3b8", fontSize: 12 }}>
                    {new Date(a.appointmentTime).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 8, color: "#cbd5e1", fontSize: 13 }}>
                {a.reason || "No reason provided"}
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link
                  to={`/appointment/${a.appointmentId}`}
                  style={{
                    textDecoration: "none",
                    padding: "9px 12px",
                    borderRadius: 10,
                    border: "1px solid #475569",
                    color: "#e2e8f0",
                  }}
                >
                  View Details
                </Link>
                {a.status !== "CANCELLED" && (
                  <button
                    disabled={busyId === a.appointmentId}
                    onClick={() => handleCancel(a)}
                    style={{
                      padding: "9px 12px",
                      borderRadius: 10,
                      border: "none",
                      background: "#dc2626",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {busyId === a.appointmentId ? "Cancelling..." : "Cancel"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default MyAppointments;
