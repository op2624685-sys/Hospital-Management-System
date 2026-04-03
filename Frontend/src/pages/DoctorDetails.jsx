import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Building2, CalendarDays, Mail, Stethoscope, Wallet } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import API from "../api/api";
import PageLoader from "../components/PageLoader";

const DoctorDetails = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get(`/public/doctors/${doctorId}`);
        setDoctor(res.data || null);
      } catch (err) {
        console.error("Failed to load doctor details:", err);
        setDoctor(null);
        setError("Doctor not found");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  const departments = useMemo(() => {
    if (!doctor?.departments) return [];
    return Array.isArray(doctor.departments) ? doctor.departments : Array.from(doctor.departments);
  }, [doctor]);

  const initials = useMemo(() => {
    const name = doctor?.name || "NA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [doctor]);

  const handleBookAppointment = () => {
    if (!doctor) return;
    navigate("/appointment", {
      state: {
        doctorId: doctor.id,
        doctorName: doctor.name,
        speciality: doctor.specialization || "",
        department: departments[0]?.name || "",
        branchId: doctor?.branch?.id || null,
        branchName: doctor?.branch?.name || "",
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Header />
        <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
          <PageLoader
            fullPage={false}
            size="md"
            message="Loading doctor profile..."
            bg="var(--card)"
          />
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Header />
        <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8">
            <p className="text-lg font-semibold">{error || "Doctor not found"}</p>
            <Link to="/doctors" className="inline-flex items-center gap-2 mt-4 text-[var(--primary)]">
              <ArrowLeft size={16} /> Back to doctors
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <Link to="/doctors" className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <ArrowLeft size={16} />
          Back to doctors
        </Link>

        <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white bg-[var(--primary)]">
              {initials}
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--secondary)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                <Stethoscope size={12} />
                Doctor Profile
              </div>
              <h1 className="mt-3 text-3xl md:text-4xl font-semibold">Dr. {doctor.name}</h1>
              <p className="mt-1 text-[var(--muted-foreground)]">{doctor.specialization || "General Physician"}</p>
            </div>
            <button
              onClick={handleBookAppointment}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90"
            >
              <CalendarDays size={16} />
              Book Appointment
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold">Contact & Branch</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 text-[var(--primary)]" />
                <span>{doctor.email || "N/A"}</span>
              </div>
              <div className="flex items-start gap-3">
                <Building2 size={16} className="mt-0.5 text-[var(--primary)]" />
                <span>{doctor?.branch?.name || "Branch N/A"}</span>
              </div>
              <div className="flex items-start gap-3">
                <Wallet size={16} className="mt-0.5 text-[var(--primary)]" />
                <span>
                  Consultation Fee:{" "}
                  {doctor.consultationFee != null ? `INR ${doctor.consultationFee}` : "Not specified"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold">Departments</h2>
            {departments.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">No departments listed.</p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {departments.map((dept) => (
                  <span
                    key={dept.id || dept.name}
                    className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--secondary)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]"
                  >
                    {dept.name}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-4 text-xs text-[var(--muted-foreground)]">
              {doctor.isHead ? "Department Head" : "Consultant"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
