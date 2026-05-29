import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import Header from "../components/Header";
import PageLoader from "../components/PageLoader";
import appointmentApi from "../api/appointments";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const emptyMedicine = {
  medicineName: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

const blankForm = {
  diagnosis: "",
  clinicalNotes: "",
  vitals: "",
  medicines: [{ ...emptyMedicine }],
  recommendedTests: "",
  advice: "",
  followUpDate: "",
  followUpNotes: "",
};

const PrescriptionEditor = () => {
  const { appointmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);

  const { data: prescription, isFetching, error } = useQuery({
    queryKey: ["doctor-prescription", appointmentId],
    queryFn: async () => (await appointmentApi.getDoctorPrescription(appointmentId)).data,
    enabled: Boolean(appointmentId),
    retry: false,
    refetchInterval: (query) => {
      const status = query.state.data?.documentStatus;
      return status === "PENDING_GENERATION" || status === "GENERATING" ? 3000 : false;
    },
  });

  const existing = Boolean(prescription?.id);
  const appointment = prescription?.appointment || location.state?.appointment || null;
  const canDownload = prescription?.documentStatus === "READY" && prescription?.documentUrl;

  useEffect(() => {
    if (!prescription) return;
    setForm({
      diagnosis: prescription.diagnosis || "",
      clinicalNotes: prescription.clinicalNotes || "",
      vitals: prescription.vitals || "",
      medicines: prescription.medicines?.length ? prescription.medicines : [{ ...emptyMedicine }],
      recommendedTests: prescription.recommendedTests || "",
      advice: prescription.advice || "",
      followUpDate: prescription.followUpDate || "",
      followUpNotes: prescription.followUpNotes || "",
    });
  }, [prescription]);

  useEffect(() => {
    if (!error || error?.response?.status === 404) return;
    toast.error(error?.response?.data?.message || "Failed to load prescription");
  }, [error]);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const setMedicineField = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      medicines: prev.medicines.map((medicine, i) =>
        i === index ? { ...medicine, [field]: value } : medicine
      ),
    }));
  };

  const addMedicine = () => {
    setForm((prev) => ({ ...prev, medicines: [...prev.medicines, { ...emptyMedicine }] }));
  };

  const removeMedicine = (index) => {
    setForm((prev) => ({
      ...prev,
      medicines: prev.medicines.length === 1
        ? [{ ...emptyMedicine }]
        : prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const savePrescription = async () => {
    if (!form.diagnosis.trim()) {
      toast.error("Diagnosis is required");
      return;
    }
    const payload = {
      ...form,
      medicines: form.medicines.filter((m) => m.medicineName?.trim()),
      followUpDate: form.followUpDate || null,
    };
    setSaving(true);
    try {
      const response = existing
        ? await appointmentApi.updatePrescription(appointmentId, payload)
        : await appointmentApi.createPrescription(appointmentId, payload);
      queryClient.setQueryData(["doctor-prescription", appointmentId], response.data);
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
      toast.success("Prescription saved. PDF generation started.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save prescription");
    } finally {
      setSaving(false);
    }
  };

  const retryGeneration = async () => {
    try {
      const response = await appointmentApi.retryPrescriptionGeneration(appointmentId);
      queryClient.setQueryData(["doctor-prescription", appointmentId], response.data);
      toast.success("Regeneration started");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to retry generation");
    }
  };

  if (isFetching && !prescription && error?.response?.status !== 404) {
    return <PageLoader message="Loading prescription..." />;
  }

  return (
    <div className="rx-page">
      <style>{`
        .rx-page { min-height: 100vh; background: var(--background); color: var(--foreground); font-family: 'Outfit', sans-serif; }
        .rx-wrap { max-width: 1080px; margin: 0 auto; padding: 108px 20px 56px; }
        .rx-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; flex-wrap: wrap; margin-bottom: 22px; }
        .rx-title { margin: 0; font-size: 2rem; font-weight: 900; color: var(--foreground); }
        .rx-sub { color: var(--muted-foreground); margin-top: 6px; font-size: 14px; }
        .rx-status { border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; background: var(--card); font-weight: 800; font-size: 12px; text-transform: uppercase; }
        .rx-panel { border: 1px solid var(--border); background: var(--card); border-radius: 8px; padding: 18px; margin-bottom: 16px; }
        .rx-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .rx-label { display: grid; gap: 7px; font-size: 12px; font-weight: 800; color: var(--muted-foreground); text-transform: uppercase; }
        .rx-input, .rx-textarea { width: 100%; border: 1.5px solid var(--border); background: var(--background); color: var(--foreground); border-radius: 8px; padding: 11px 12px; font: inherit; outline: none; }
        .rx-textarea { min-height: 96px; resize: vertical; }
        .rx-input:focus, .rx-textarea:focus { border-color: var(--primary); }
        .rx-medicine { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1.5fr auto; gap: 10px; align-items: end; margin-top: 10px; }
        .rx-btn { border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; cursor: pointer; font-weight: 800; display: inline-flex; align-items: center; gap: 8px; background: var(--card); color: var(--foreground); }
        .rx-btn-primary { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); }
        .rx-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; }
        .rx-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; color: var(--muted-foreground); font-size: 13px; }
        .rx-summary strong { display: block; color: var(--foreground); font-size: 14px; margin-bottom: 2px; }
        @media (max-width: 820px) { .rx-grid, .rx-summary { grid-template-columns: 1fr; } .rx-medicine { grid-template-columns: 1fr; } }
      `}</style>
      <Header />
      <main className="rx-wrap">
        <div className="rx-head">
          <div>
            <h1 className="rx-title">Prescription</h1>
            <div className="rx-sub">Appointment {appointmentId}</div>
          </div>
          <div className="rx-status">{prescription?.documentStatus || "Draft"}</div>
        </div>

        <section className="rx-panel">
          <div className="rx-summary">
            <div><strong>{appointment?.patient?.name || "Patient"}</strong>{appointment?.patient?.email || "No email"}</div>
            <div><strong>{appointment?.branch?.name || "Branch"}</strong>{appointment?.departmentName || "Department not assigned"}</div>
            <div><strong>{appointment?.status || "IN_PROGRESS"}</strong>{appointment?.appointmentTime ? new Date(appointment.appointmentTime).toLocaleString("en-IN") : "Current visit"}</div>
          </div>
        </section>

        <section className="rx-panel">
          <div className="rx-grid">
            <label className="rx-label">Diagnosis
              <input className="rx-input" value={form.diagnosis} onChange={(e) => setField("diagnosis", e.target.value)} />
            </label>
            <label className="rx-label">Vitals
              <input className="rx-input" value={form.vitals} onChange={(e) => setField("vitals", e.target.value)} placeholder="BP, pulse, temperature..." />
            </label>
            <label className="rx-label">Clinical Notes
              <textarea className="rx-textarea" value={form.clinicalNotes} onChange={(e) => setField("clinicalNotes", e.target.value)} />
            </label>
            <label className="rx-label">Recommended Tests
              <textarea className="rx-textarea" value={form.recommendedTests} onChange={(e) => setField("recommendedTests", e.target.value)} />
            </label>
          </div>
        </section>

        <section className="rx-panel">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Medicines</h2>
            <button className="rx-btn" onClick={addMedicine}><Plus size={16} /> Add</button>
          </div>
          {form.medicines.map((medicine, index) => (
            <div key={index} className="rx-medicine">
              {["medicineName", "dosage", "frequency", "duration", "instructions"].map((field) => (
                <label key={field} className="rx-label">{field.replace(/([A-Z])/g, " $1")}
                  <input className="rx-input" value={medicine[field] || ""} onChange={(e) => setMedicineField(index, field, e.target.value)} />
                </label>
              ))}
              <button className="rx-btn" onClick={() => removeMedicine(index)} title="Remove medicine"><Trash2 size={16} /></button>
            </div>
          ))}
        </section>

        <section className="rx-panel">
          <div className="rx-grid">
            <label className="rx-label">Advice
              <textarea className="rx-textarea" value={form.advice} onChange={(e) => setField("advice", e.target.value)} />
            </label>
            <div className="rx-grid" style={{ gridTemplateColumns: "1fr" }}>
              <label className="rx-label">Follow-up Date
                <input className="rx-input" type="date" value={form.followUpDate} onChange={(e) => setField("followUpDate", e.target.value)} />
              </label>
              <label className="rx-label">Follow-up Notes
                <input className="rx-input" value={form.followUpNotes} onChange={(e) => setField("followUpNotes", e.target.value)} />
              </label>
            </div>
          </div>
          <div className="rx-actions">
            <button className="rx-btn rx-btn-primary" onClick={savePrescription} disabled={saving}>
              <Save size={16} /> {saving ? "Saving..." : "Save Prescription"}
            </button>
            <button className="rx-btn" onClick={() => queryClient.invalidateQueries({ queryKey: ["doctor-prescription", appointmentId] })}>
              <RefreshCw size={16} /> Refresh Status
            </button>
            {prescription?.documentStatus === "FAILED" && (
              <button className="rx-btn" onClick={retryGeneration}><RefreshCw size={16} /> Retry PDF</button>
            )}
            {canDownload && (
              <a className="rx-btn" href={prescription.documentUrl} target="_blank" rel="noreferrer">
                <FileText size={16} /> Open PDF
              </a>
            )}
            <button className="rx-btn" onClick={() => navigate("/doctor/appointments")}>Back</button>
          </div>
          {prescription?.documentStatus === "FAILED" && prescription?.generationError && (
            <p style={{ color: "var(--destructive)", marginTop: 12 }}>{prescription.generationError}</p>
          )}
        </section>
      </main>
      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default PrescriptionEditor;
