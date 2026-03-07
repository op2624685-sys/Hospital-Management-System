import React, { useEffect, useMemo, useState } from "react";
import { Building2, IndianRupee, RefreshCw, Stethoscope, Users } from "lucide-react";
import API from "../api/api";
import Header from "../components/Header";

const emptyBranchForm = {
  branchName: "",
  branchAddress: "",
  branchContactNumber: "",
  branchEmail: "",
};

const emptyAdminForm = {
  username: "",
  name: "",
  email: "",
  branchName: "",
};

const emptyDoctorForm = {
  username: "",
  name: "",
  specialization: "",
  email: "",
  branchName: "",
};

const HeadAdminPanel = () => {
  const [overview, setOverview] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  const [branchForm, setBranchForm] = useState(emptyBranchForm);
  const [adminForm, setAdminForm] = useState(emptyAdminForm);
  const [doctorForm, setDoctorForm] = useState(emptyDoctorForm);
  const [adminUsernameSuggestions, setAdminUsernameSuggestions] = useState([]);
  const [doctorUsernameSuggestions, setDoctorUsernameSuggestions] = useState([]);
  const [branchNameSuggestions, setBranchNameSuggestions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const totalEstimatedRevenue = useMemo(
    () => overview.reduce((sum, b) => sum + (b.estimatedRevenue || 0), 0),
    [overview]
  );

  const loadOverview = async () => {
    const res = await API.get("/head-admin/overview");
    const items = Array.isArray(res.data) ? res.data : [];
    setOverview(items);
    if (!selectedBranchId && items.length) {
      setSelectedBranchId(items[0].branchId);
    }
  };

  const loadBranchDetails = async (branchId) => {
    if (!branchId) return;
    setDetailsLoading(true);
    try {
      const res = await API.get(`/head-admin/branch/${branchId}/details`);
      setDetails(res.data);
      setError("");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load branch details");
      setDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    try {
      await loadOverview();
      setError("");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      loadBranchDetails(selectedBranchId);
    }
  }, [selectedBranchId]);

  useEffect(() => {
    const q = adminForm.username?.trim();
    if (!q) {
      setAdminUsernameSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await API.get("/head-admin/user-suggestions", { params: { query: q } });
        setAdminUsernameSuggestions(Array.isArray(res.data) ? res.data : []);
      } catch {
        setAdminUsernameSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [adminForm.username]);

  useEffect(() => {
    const q = doctorForm.username?.trim();
    if (!q) {
      setDoctorUsernameSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await API.get("/head-admin/user-suggestions", { params: { query: q } });
        setDoctorUsernameSuggestions(Array.isArray(res.data) ? res.data : []);
      } catch {
        setDoctorUsernameSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [doctorForm.username]);

  useEffect(() => {
    const query = (adminForm.branchName || doctorForm.branchName || "").trim();
    if (!query) {
      setBranchNameSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await API.get("/head-admin/branch-suggestions", { params: { query } });
        setBranchNameSuggestions(Array.isArray(res.data) ? res.data : []);
      } catch {
        setBranchNameSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [adminForm.branchName, doctorForm.branchName]);

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/head-admin/createNewBranch", branchForm);
      setBranchForm(emptyBranchForm);
      await refreshAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create branch");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignAdmin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/head-admin/onBoardNewAdmin", {
        ...adminForm,
        username: adminForm.username.trim(),
        branchName: adminForm.branchName.trim(),
        name: adminForm.name.trim(),
        email: adminForm.email.trim(),
      });
      setAdminForm(emptyAdminForm);
      await refreshAll();
      if (selectedBranchId) await loadBranchDetails(selectedBranchId);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to assign branch admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOnboardDoctor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/admin/onBoardNewDoctor", {
        ...doctorForm,
        username: doctorForm.username.trim(),
        branchName: doctorForm.branchName.trim(),
        name: doctorForm.name.trim(),
        specialization: doctorForm.specialization.trim(),
        email: doctorForm.email.trim(),
      });
      setDoctorForm(emptyDoctorForm);
      await refreshAll();
      if (selectedBranchId) await loadBranchDetails(selectedBranchId);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to onboard doctor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <div className="pt-24 pb-12 px-4 md:px-8 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 right-0 w-72 h-72 bg-cyan-200/40 blur-3xl rounded-full" />
          <div className="absolute top-52 -left-20 w-80 h-80 bg-blue-200/30 blur-3xl rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="rounded-3xl p-6 md:p-8 text-white bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-blue-100 font-semibold">Hospital Governance</p>
                <h1 className="text-2xl md:text-4xl font-black mt-1">Head Admin Command Center</h1>
                <p className="text-blue-100 mt-2 max-w-2xl">
                  Branch operations, branch admin assignment, doctor onboarding, and organization-wide visibility.
                </p>
              </div>

              <button
                onClick={refreshAll}
                className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 rounded-xl px-4 py-2 text-sm font-semibold transition"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>
            {error && <p className="mt-3 text-sm text-rose-100 bg-rose-900/30 px-3 py-2 rounded-lg inline-block">{error}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                <Building2 size={18} />
              </div>
              <p className="text-sm text-slate-500">Total Branches</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{overview.length}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <Stethoscope size={18} />
              </div>
              <p className="text-sm text-slate-500">Total Doctors</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{overview.reduce((s, b) => s + (b.doctorCount || 0), 0)}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center mb-3">
                <Users size={18} />
              </div>
              <p className="text-sm text-slate-500">Total Patients</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{overview.reduce((s, b) => s + (b.patientCount || 0), 0)}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <IndianRupee size={18} />
              </div>
              <p className="text-sm text-slate-500">Estimated Revenue</p>
              <p className="text-3xl font-black text-slate-900 mt-1">Rs. {totalEstimatedRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 overflow-x-auto shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Branch Overview</h2>
            {loading ? (
              <p className="text-slate-500">Loading...</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-4">Branch</th>
                    <th className="py-2 pr-4">Admins</th>
                    <th className="py-2 pr-4">Doctors</th>
                    <th className="py-2 pr-4">Patients</th>
                    <th className="py-2 pr-4">Departments</th>
                    <th className="py-2 pr-4">Est. Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.map((branch) => (
                    <tr
                      key={branch.branchId}
                      onClick={() => setSelectedBranchId(branch.branchId)}
                      className={`border-b border-slate-100 cursor-pointer transition ${
                        selectedBranchId === branch.branchId ? "bg-blue-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-slate-800">{branch.branchName}</p>
                        <p className="text-xs text-slate-500">{branch.branchAddress}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-800">{branch.adminName || "Not Assigned"}</p>
                        <p className="text-xs text-slate-500">@{branch.adminUsername || "-"}</p>
                      </td>
                      <td className="py-3 pr-4">{branch.doctorCount}</td>
                      <td className="py-3 pr-4">{branch.patientCount}</td>
                      <td className="py-3 pr-4">{branch.departmentCount}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-700">Rs. {(branch.estimatedRevenue || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <form onSubmit={handleCreateBranch} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
              <h3 className="font-bold text-slate-900">Create New Branch</h3>
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Branch Name" value={branchForm.branchName} onChange={(e) => setBranchForm((p) => ({ ...p, branchName: e.target.value }))} required />
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Address" value={branchForm.branchAddress} onChange={(e) => setBranchForm((p) => ({ ...p, branchAddress: e.target.value }))} required />
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Contact Number" value={branchForm.branchContactNumber} onChange={(e) => setBranchForm((p) => ({ ...p, branchContactNumber: e.target.value }))} required />
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Email" type="email" value={branchForm.branchEmail} onChange={(e) => setBranchForm((p) => ({ ...p, branchEmail: e.target.value }))} required />
              <button disabled={submitting} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-2 font-semibold transition">{submitting ? "Submitting..." : "Create Branch"}</button>
            </form>

            <form onSubmit={handleAssignAdmin} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
              <h3 className="font-bold text-slate-900">Assign Branch Admin</h3>
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Username" type="text" list="admin-username-suggestions" value={adminForm.username} onChange={(e) => setAdminForm((p) => ({ ...p, username: e.target.value }))} required />
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Admin Name" value={adminForm.name} onChange={(e) => setAdminForm((p) => ({ ...p, name: e.target.value }))} required />
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Admin Email" type="email" value={adminForm.email} onChange={(e) => setAdminForm((p) => ({ ...p, email: e.target.value }))} required />
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Branch Name" type="text" list="branch-name-suggestions" value={adminForm.branchName} onChange={(e) => setAdminForm((p) => ({ ...p, branchName: e.target.value }))} required />
              <button disabled={submitting} className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-lg py-2 font-semibold transition">{submitting ? "Submitting..." : "Assign Admin"}</button>
            </form>

            <form onSubmit={handleOnboardDoctor} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
              <h3 className="font-bold text-slate-900">Onboard Doctor</h3>
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Username" type="text" list="doctor-username-suggestions" value={doctorForm.username} onChange={(e) => setDoctorForm((p) => ({ ...p, username: e.target.value }))} required />
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Doctor Name" value={doctorForm.name} onChange={(e) => setDoctorForm((p) => ({ ...p, name: e.target.value }))} required />
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Specialization" value={doctorForm.specialization} onChange={(e) => setDoctorForm((p) => ({ ...p, specialization: e.target.value }))} required />
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Doctor Email" type="email" value={doctorForm.email} onChange={(e) => setDoctorForm((p) => ({ ...p, email: e.target.value }))} required />
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Branch Name" type="text" list="branch-name-suggestions" value={doctorForm.branchName} onChange={(e) => setDoctorForm((p) => ({ ...p, branchName: e.target.value }))} required />
              <button disabled={submitting} className="w-full bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg py-2 font-semibold transition">{submitting ? "Submitting..." : "Onboard Doctor"}</button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Selected Branch Details</h2>
            {detailsLoading ? (
              <p className="text-slate-500">Loading branch details...</p>
            ) : !details ? (
              <p className="text-slate-500">Select a branch to view doctors, patients, admins, and departments.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-semibold text-slate-800">Admins ({details.admins?.length || 0})</h3>
                  <ul className="text-sm text-slate-700 mt-2 space-y-1">
                    {(details.admins || []).map((a) => (
                      <li key={a.id}>#{a.id} - {a.name} ({a.email})</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-semibold text-slate-800">Doctors ({details.doctors?.length || 0})</h3>
                  <ul className="text-sm text-slate-700 mt-2 space-y-1">
                    {(details.doctors || []).map((d) => (
                      <li key={d.id}>#{d.id} - {d.name} ({d.specialization})</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-semibold text-slate-800">Patients ({details.patients?.length || 0})</h3>
                  <ul className="text-sm text-slate-700 mt-2 space-y-1 max-h-56 overflow-auto">
                    {(details.patients || []).map((p) => (
                      <li key={p.id}>#{p.id} - {p.name} ({p.email})</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-semibold text-slate-800">Departments ({details.departments?.length || 0})</h3>
                  <ul className="text-sm text-slate-700 mt-2 space-y-1">
                    {(details.departments || []).map((dep) => (
                      <li key={dep.id}>
                        {dep.name} | Head: {dep.headDoctorName || "N/A"} | Doctors: {dep.doctorCount} | Patients: {dep.patientCount}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <datalist id="admin-username-suggestions">
            {adminUsernameSuggestions.map((username) => (
              <option key={username} value={username} />
            ))}
          </datalist>
          <datalist id="doctor-username-suggestions">
            {doctorUsernameSuggestions.map((username) => (
              <option key={username} value={username} />
            ))}
          </datalist>
          <datalist id="branch-name-suggestions">
            {branchNameSuggestions.map((branchName) => (
              <option key={branchName} value={branchName} />
            ))}
          </datalist>
        </div>
      </div>
    </div>
  );
};

export default HeadAdminPanel;
