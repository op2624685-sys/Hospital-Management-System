import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Building2, CalendarDays, Mail, MapPin, Phone, User2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import API from "../api/api";
import { getBranchImage } from "../utils/branchImages";

const BranchDetails = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [branch, setBranch] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [departmentError, setDepartmentError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const [branchRes, deptRes] = await Promise.allSettled([
          API.get("/public/branches"),
          API.get("/departments"),
        ]);

        if (branchRes.status !== "fulfilled") {
          throw branchRes.reason;
        }

        const allBranches = Array.isArray(branchRes.value.data) ? branchRes.value.data : [];
        const selected = allBranches.find((b) => String(b.id) === String(branchId));
        if (!selected) {
          setBranch(null);
          setDepartments([]);
          setError("Branch not found");
          return;
        }
        setBranch(selected);

        if (deptRes.status === "fulfilled") {
          const allDepartments = Array.isArray(deptRes.value.data) ? deptRes.value.data : [];
          const branchDepartments = allDepartments.filter((d) => String(d.branchId) === String(selected.id));
          setDepartments(branchDepartments);
          setDepartmentError("");
        } else {
          console.error("Failed to load department data:", deptRes.reason);
          setDepartments([]);
          setDepartmentError("Department data is temporarily unavailable.");
        }
      } catch (err) {
        console.error("Failed to load branch details:", err);
        setError("Failed to load branch details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [branchId]);

  const heroImage = useMemo(() => getBranchImage(branch, 0), [branch]);
  const location = useMemo(
    () => branch?.address?.split(",").slice(-1)[0]?.trim() || "N/A",
    [branch]
  );

  const summary = useMemo(() => {
    const deptCount = departments.length;
    const doctorCount = departments.reduce((sum, d) => sum + (d.memberCount || 0), 0);
    const maxMembers = Math.max(1, ...departments.map((d) => d.memberCount || 0));
    return { deptCount, doctorCount, maxMembers };
  }, [departments]);

  const handleBookAppointment = () => {
    if (!branch) return;
    navigate("/appointment", {
      state: {
        branchName: branch.name,
        branchId: branch.id,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Header />
        <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-10">
            Loading branch details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Header />
        <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-10">
            <p className="text-lg font-semibold">{error || "Branch not found"}</p>
            <Link to="/branches" className="inline-flex items-center gap-2 mt-4 text-violet-300">
              <ArrowLeft size={16} /> Back to branches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />
      <style>{`
        .branch-hero-photo {
          position: absolute;
          top: 24px;
          right: 24px;
          height: 144px;
          width: 208px;
          border-radius: 18px;
          border: 1px solid rgba(148, 163, 184, 0.4);
          background: rgba(15, 23, 42, 0.6);
          box-shadow: 0 18px 40px rgba(0,0,0,0.35);
          overflow: hidden;
        }
        .branch-hero-photo-img {
          height: 100%;
          width: 100%;
          background-size: cover;
          background-position: center;
        }
        @media (max-width: 640px) {
          .branch-hero-photo {
            position: static;
            margin: 16px auto 0;
            height: 120px;
            width: 120px;
            border-radius: 999px;
          }
          .branch-hero-photo-img {
            border-radius: 999px;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        <Link to="/branches" className="inline-flex items-center gap-2 text-sm text-slate-300">
          <ArrowLeft size={16} />
          Back to branches
        </Link>

        <div className="mt-6 relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-8 lg:p-10">
          <div className="branch-hero-photo">
            <div
              className="branch-hero-photo-img"
              style={{ backgroundImage: `url(${heroImage})` }}
            />
          </div>

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-300">
              <Building2 size={12} />
              Branch Profile
            </div>
            <h1 className="mt-4 text-3xl md:text-5xl font-semibold">{branch.name}</h1>
            <p className="mt-2 text-slate-300">{branch.address}</p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="text-xs uppercase tracking-widest text-slate-400">Branch Head</div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <User2 size={16} className="text-violet-300" />
                  {branch.admin?.name || "Not Assigned"}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="text-xs uppercase tracking-widest text-slate-400">City</div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-violet-300" />
                  {location}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Department Snapshot</h2>
                  <p className="text-sm text-slate-400">
                    Doctors per department and leadership overview.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-center">
                  <div className="text-xs uppercase tracking-widest text-slate-400">Departments</div>
                  <div className="mt-1 text-2xl font-semibold">{summary.deptCount}</div>
                </div>
              </div>

              {departmentError && (
                <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
                  {departmentError}
                </div>
              )}
              {departments.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-6 text-slate-400">
                  No departments are assigned to this branch yet.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {departments.map((dept) => {
                    const members = dept.memberCount || 0;
                    const width = `${Math.round((members / summary.maxMembers) * 100)}%`;
                    const accent = dept.accentColor || "#a78bfa";
                    return (
                      <div key={dept.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold">{dept.name}</p>
                            <p className="text-xs text-slate-400">
                              Head: {dept.headDoctorName || "TBD"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs uppercase tracking-widest text-slate-400">Doctors</p>
                            <p className="text-lg font-semibold">{members}</p>
                          </div>
                        </div>
                        <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full"
                            style={{ width, background: `linear-gradient(90deg, ${accent}, #f472b6)` }}
                          />
                        </div>
                        {dept.description && (
                          <p className="mt-3 text-sm text-slate-400">{dept.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="text-xl font-semibold">Branch Contacts</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-200">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="text-xs uppercase tracking-widest text-slate-400">Phone</div>
                  <div className="mt-2 flex items-center gap-2">
                    <Phone size={16} className="text-violet-300" />
                    {branch.contactNumber || "N/A"}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="text-xs uppercase tracking-widest text-slate-400">Email</div>
                  <div className="mt-2 flex items-center gap-2">
                    <Mail size={16} className="text-violet-300" />
                    {branch.email || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <button
                className="mt-4 w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-500"
                onClick={handleBookAppointment}
              >
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={16} /> Book Appointment
                </span>
              </button>
              <a
                className="mt-3 block w-full rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800/60"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address || branch.name)}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="inline-flex items-center gap-2">
                  <MapPin size={16} /> View Directions
                </span>
              </a>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <h3 className="text-lg font-semibold">Branch Summary</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Departments</span>
                  <span>{summary.deptCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Doctors (total)</span>
                  <span>{summary.doctorCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Branch Head</span>
                  <span>{branch.admin?.name || "Not Assigned"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchDetails;
