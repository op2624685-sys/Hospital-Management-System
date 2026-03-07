import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import appointmentApi from "../api/appointments";
import { useAuth } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DoctorBookedDetails = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentApi.getDoctorAppointments();
      setAppointments(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load booked appointments");
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

  const statusClass = (status) => {
    const value = (status || "").toUpperCase();
    if (value === "CONFIRMED") return "doc-status doc-status-confirmed";
    if (value === "CANCELLED") return "doc-status doc-status-cancelled";
    return "doc-status doc-status-pending";
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
        }
        .doc-wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 108px 20px 30px;
          color: #0f172a;
        }
        .doc-hero {
          padding: 20px;
          border-radius: 18px;
          background: linear-gradient(120deg, #2563eb 0%, #0ea5e9 100%);
          color: #fff;
          box-shadow: 0 14px 36px rgba(37,99,235,.24);
          margin-bottom: 16px;
        }
        .doc-hero h1 { margin: 0; font-size: clamp(1.4rem, 2.6vw, 2rem); }
        .doc-hero p { margin: 8px 0 0; color: rgba(255,255,255,.88); font-size: 14px; }
        .doc-search {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #dbe6ff;
          background: #fff;
          color: #0f172a;
          margin-bottom: 14px;
          box-shadow: 0 8px 26px rgba(37,99,235,0.06);
          outline: none;
        }
        .doc-search:focus {
          border-color: #93c5fd;
          box-shadow: 0 0 0 4px rgba(37,99,235,.12);
        }
        .doc-msg { color: #64748b; }
        .doc-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
        }
        .doc-card {
          border: 1px solid #dbe6ff;
          border-radius: 14px;
          padding: 14px;
          background: rgba(255,255,255,.95);
          box-shadow: 0 10px 28px rgba(15,23,42,.06);
        }
        .doc-line { font-size: 13px; color: #334155; margin-top: 6px; }
        .doc-title { font-weight: 700; color: #0f172a; font-size: 15px; }
        .doc-id { font-size: 12px; color: #64748b; }
        .doc-status {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 700;
          margin-top: 8px;
        }
        .doc-status-confirmed { color: #0f766e; background: #ccfbf1; border: 1px solid #99f6e4; }
        .doc-status-cancelled { color: #991b1b; background: #fee2e2; border: 1px solid #fecaca; }
        .doc-status-pending { color: #a16207; background: #fef3c7; border: 1px solid #fde68a; }
      `}</style>

      <Header />

      <div className="doc-wrap">
        <div className="doc-hero">
          <h1>Booked Appointment Details</h1>
          <p>Doctor #{user?.id} · View all bookings assigned to you.</p>
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
          {filtered.map((a) => (
            <div key={a.appointmentId} className="doc-card">
              <div className="doc-title">{a.patient?.name || "Unknown patient"}</div>
              <div className="doc-id">Appointment: {a.appointmentId}</div>
              <div className="doc-line">Patient Email: {a.patient?.email || "-"}</div>
              <div className="doc-line">Time: {a.appointmentTime || "-"}</div>
              <div className="doc-line">Reason: {a.reason || "-"}</div>
              <div className="doc-line">Branch: {a.branch?.name || "-"}</div>
              <span className={statusClass(a.status)}>{a.status || "PENDING"}</span>
            </div>
          ))}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default DoctorBookedDetails;
