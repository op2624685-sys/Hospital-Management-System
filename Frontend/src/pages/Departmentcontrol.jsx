import React, { useState, useEffect } from "react";
import { Building2, Users, UserRound, LayoutDashboard, Plus, Trash2, Save, X, Activity, ArrowRight, Settings, TrendingUp, Clock, Shield } from 'lucide-react';
import { doctorAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";

const STATUS_STYLES = {
  confirmed: { bg: "#D1FAE5", text: "#065F46", label: "Confirmed" },
  pending: { bg: "#FEF9C3", text: "#854D0E", label: "Pending" },
  completed: { bg: "#E0E7FF", text: "#3730A3", label: "Completed" },
  cancelled: { bg: "#FEE2E2", text: "#991B1B", label: "Cancelled" },
  active: { bg: "#D1FAE5", text: "#065F46", label: "Active" },
  "on-leave": { bg: "#FEF9C3", text: "#854D0E", label: "On Leave" },
};

function Avatar({ name, size = 36, color = "#4F46E5" }) {
  const initials = name ? name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() : "??";
  const light = color + "22";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: light, border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color, flexShrink: 0, fontFamily: "'Poppins', sans-serif" }}>
      {initials}
    </div>
  );
}

function Badge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span style={{ background: s.bg, color: s.text, padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "'Poppins', sans-serif", letterSpacing: 0.5, textTransform: 'uppercase' }}>{s.label}</span>
  );
}

export default function DepartmentControl() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ description: "", services: "" });
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const fetchHeadDepts = async () => {
      try {
        const { data } = await doctorAPI.getMyDepartments();
        const headDepts = data.filter(d => String(d.headDoctorId) === String(user?.id));
        setDepartments(headDepts);
        if (headDepts.length > 0) {
          setSelectedDept(headDepts[0]);
          setEditData({ description: headDepts[0].description || "", services: "" });
        }
      } catch (error) {
        console.error("Error fetching head departments:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchHeadDepts();
  }, [user]);

  const handleUpdate = async () => {
    try {
      await doctorAPI.updateDepartment(selectedDept.id, { description: editData.description });
      setSelectedDept({ ...selectedDept, description: editData.description });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating department:", error);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-blue-50">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .float-spinner {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      <div className="flex flex-col items-center gap-6">
        <div className="float-spinner">
          <div className="w-16 h-16 rounded-full border-3 border-slate-300 border-t-blue-500 animate-spin"></div>
        </div>
        <p className="text-slate-600 font-semibold tracking-wide">Loading your department...</p>
      </div>
    </div>
  );

  if (departments.length === 0) return (
    <div className="min-h-screen pt-24 px-8 bg-linear-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full">
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-cyan-400 rounded-3xl blur-3xl opacity-10 animate-pulse"></div>
          <div className="relative bg-white p-12 rounded-3xl border border-slate-200 shadow-lg text-center">
            <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Shield size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Access Restricted</h2>
            <p className="text-slate-600 leading-relaxed">This panel is exclusively for Department Heads. You haven't been assigned to manage any department yet.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 pt-20 pb-16">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .animate-slide-in-down {
          animation: slideInDown 0.6s ease-out forwards;
        }
        
        .animate-slide-in-up {
          animation: slideInUp 0.6s ease-out forwards;
        }
        
        .animate-fade-scale {
          animation: fadeInScale 0.6s ease-out forwards;
        }
        
        .glow-gradient {
          background: linear-gradient(135deg, #0891B2 0%, #0284C7 50%, #2563EB 100%);
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15);
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <Header />
        
        {/* Main Hero Section */}
        <div className="mb-12">
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-lg">
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
              <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
            </div>
            
            <div className="relative p-8 md:p-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex-1 animate-slide-in-down">
                  <div className="inline-block mb-4">
                    <span className="glow-gradient bg-clip-text text-transparent text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Department Head Dashboard
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {selectedDept?.name}
                  </h1>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    Oversee your department's operations, manage staff, and monitor patient care metrics.
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto animate-slide-in-up">
                  <div className="card-hover group bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200 text-center">
                    <div className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Total Patients
                    </div>
                    <div className="text-4xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                      {selectedDept?.patientCount || 0}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-green-600 text-xs font-semibold">
                      <TrendingUp size={14} /> +12% this month
                    </div>
                  </div>

                  <div className="card-hover group bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 text-center">
                    <div className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Staff Members
                    </div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                      {selectedDept?.memberCount || 0}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-slate-600 text-xs font-semibold">
                      <Users size={14} /> Active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex gap-3 mb-8 animate-fade-scale" style={{ animationDelay: '0.2s' }}>
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 border ${
              activeTab === 'overview' 
                ? 'glow-gradient text-white shadow-lg shadow-blue-500/30 border-transparent bg-gradient-to-r from-blue-600 to-cyan-600' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
            }`}
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <LayoutDashboard size={20} />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('doctors')}
            className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 border ${
              activeTab === 'doctors' 
                ? 'glow-gradient text-white shadow-lg shadow-blue-500/30 border-transparent bg-gradient-to-r from-blue-600 to-cyan-600' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
            }`}
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <Users size={20} />
            Staff Management
          </button>
        </div>

        {/* Content Area */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          {activeTab === 'overview' && (
            <div className="p-8 md:p-12 animate-fade-scale">
              {/* Description Section */}
              <div className="mb-12">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Department Description</h2>
                    <p className="text-slate-600 text-sm">Keep your team and patients informed about your department</p>
                  </div>
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 px-6 py-3 rounded-xl transition-all bg-blue-50 hover:bg-blue-100 border border-blue-200"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      <Settings size={18} /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button 
                        onClick={handleUpdate}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all border border-green-600"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        <Save size={16} /> Save
                      </button>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-semibold text-sm border border-slate-300 hover:bg-slate-200 transition-all"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        <X size={16} /> Cancel
                      </button>
                    </div>
                  )}
                </div>

                {!isEditing ? (
                  <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 text-slate-700 leading-relaxed">
                    {selectedDept.description || (
                      <span className="text-slate-500 italic">No description set for this department. Click edit to add details about services, specialties, and capabilities.</span>
                    )}
                  </div>
                ) : (
                  <textarea 
                    className="w-full bg-slate-50 rounded-2xl p-8 border-2 border-blue-300 text-slate-900 leading-relaxed min-h-[250px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all font-medium placeholder-slate-400"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    placeholder="Describe your department, services offered, specialties..."
                  />
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-hover bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-300">
                      <Building2 size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="text-slate-600 text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Branch
                      </div>
                      <div className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        #{selectedDept?.branchId}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center border border-purple-300">
                      <Clock size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="text-slate-600 text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Status
                      </div>
                      <div className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Active
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center border border-green-300">
                      <Shield size={24} className="text-green-600" />
                    </div>
                    <div>
                      <div className="text-slate-600 text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Verification
                      </div>
                      <div className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Verified
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'doctors' && (
            <div className="p-8 md:p-12 animate-fade-scale">
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Manage Your Team
                </h2>
                <p className="text-slate-600">Add or remove doctors to build and maintain your department's staff roster</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Staff */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    👥 Current Staff
                  </h3>
                  <div className="bg-slate-50 rounded-2xl p-12 border-2 border-dashed border-slate-300 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-300">
                      <Users size={32} className="text-slate-400" />
                    </div>
                    <p className="text-slate-600 text-sm font-medium mb-6">Staff list implementation pending backend integration</p>
                    <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors flex items-center gap-2 mx-auto">
                      View All Doctors <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Add Doctor Card */}
                <div className="card-hover bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200">
                  <div className="flex flex-col h-full">
                    <div>
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg">
                        <Plus size={28} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Assign New Doctor
                      </h3>
                      <p className="text-slate-700 text-sm mb-8 leading-relaxed">
                        Search and assign available doctors to strengthen your department's team.
                      </p>
                    </div>
                    
                    <div className="flex gap-2 mt-auto">
                      <input 
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-slate-500"
                        placeholder="Doctor name or ID"
                      />
                      <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all border border-blue-600">
                        Assign
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Department Guidelines */}
              <div className="mt-12 bg-slate-50 rounded-2xl p-8 border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-900 mb-6 flex items-center gap-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <Shield size={18} /> Team Management Guidelines
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex gap-4">
                    <div className="text-blue-600 font-bold text-lg">1</div>
                    <div>
                      <div className="text-slate-900 font-semibold text-sm mb-1">Verify Credentials</div>
                      <div className="text-slate-600 text-xs">Ensure all doctors have valid credentials before assignment</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-blue-600 font-bold text-lg">2</div>
                    <div>
                      <div className="text-slate-900 font-semibold text-sm mb-1">Manage Workload</div>
                      <div className="text-slate-600 text-xs">Balance patient load across your team fairly</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-blue-600 font-bold text-lg">3</div>
                    <div>
                      <div className="text-slate-900 font-semibold text-sm mb-1">Regular Review</div>
                      <div className="text-slate-600 text-xs">Review staff performance and satisfaction monthly</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}