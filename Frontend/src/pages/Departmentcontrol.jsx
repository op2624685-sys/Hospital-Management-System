import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Building2, Users, UserRound, LayoutDashboard, Plus, Trash2, Save, X, Activity, ArrowRight, Settings, TrendingUp, Clock, Shield } from 'lucide-react';
import { doctorAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import PageLoader from "../components/PageLoader";

const STATUS_STYLES = {
  confirmed: { bg: "#D1FAE5", text: "#065F46", label: "Confirmed" },
  pending: { bg: "#FEF9C3", text: "#854D0E", label: "Pending" },
  completed: { bg: "#E0E7FF", text: "#3730A3", label: "Completed" },
  cancelled: { bg: "#FEE2E2", text: "#991B1B", label: "Cancelled" },
  active: { bg: "#D1FAE5", text: "#065F46", label: "Active" },
  "on-leave": { bg: "#FEF9C3", text: "#854D0E", label: "On Leave" },
};

function Avatar({ name, size = 36, color = "var(--primary)" }) {
  const initials = name ? name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() : "??";
  return (
    <div style={{ 
      width: size, height: size, borderRadius: "50%", 
      background: `color-mix(in srgb, ${color} 15%, transparent)`, 
      border: `2px solid ${color}`, 
      display: "flex", alignItems: "center", justifyContent: "center", 
      fontSize: size * 0.35, fontWeight: 900, color, 
      flexShrink: 0 
    }}>
      {initials}
    </div>
  );
}

function Badge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span className="dark:bg-opacity-20" style={{ 
      background: s.bg, color: s.text, 
      padding: "5px 12px", borderRadius: 8, 
      fontSize: 10, fontWeight: 800, 
      letterSpacing: 0.5, textTransform: 'uppercase' 
    }}>{s.label}</span>
  );
}

export default function DepartmentControl() {
  const { departmentId } = useParams();
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
        setDepartments(headDepts);
        if (headDepts.length > 0) {
          const initial = departmentId 
            ? (headDepts.find(d => String(d.id) === String(departmentId)) || headDepts[0])
            : headDepts[0];
          setSelectedDept(initial);
          setEditData({ description: initial.description || "", services: "" });
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
    <PageLoader />
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
    <div className="dc-root min-h-screen bg-[var(--background)] pt-20 pb-16">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        .dc-root, .dc-root * { font-family: 'Poppins', sans-serif; box-sizing: border-box; }

        @keyframes slideInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        @keyframes blob { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } }
        
        .animate-slide-in-down { animation: slideInDown 0.6s ease-out forwards; }
        .animate-slide-in-up { animation: slideInUp 0.6s ease-out forwards; }
        .animate-fade-scale { animation: fadeInScale 0.6s ease-out forwards; }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        
        .glow-gradient { background: linear-gradient(135deg, var(--primary) 0%, var(--chart-5) 50%, var(--primary) 100%); }
        .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1.5px solid var(--border); }
        .card-hover:hover { transform: translateY(-8px); border-color: var(--primary); box-shadow: 0 20px 40px color-mix(in srgb, var(--primary) 15%, transparent); }
        
        .dc-input { 
          width: 100%; 
          background: var(--background); 
          border: 1.5px solid var(--border); 
          border-radius: 12px; 
          padding: 12px 16px; 
          font-size: 14px; 
          color: var(--foreground); 
          outline: none; 
          transition: all 0.2s; 
        }
        .dc-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 12%, transparent); }
        
        .dc-btn-primary { 
          background: var(--primary); 
          color: #fff; 
          border: none; 
          padding: 12px 24px; 
          border-radius: 14px; 
          font-weight: 700; 
          cursor: pointer; 
          transition: all 0.2s; 
          box-shadow: 0 10px 25px -5px color-mix(in srgb, var(--primary) 40%, transparent); 
        }
        .dc-btn-primary:hover { transform: translateY(-2px); filter: brightness(1.1); }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <Header />
        
        {/* Main Hero Section */}
        <div className="mb-12">
          <div className="relative rounded-[2.5rem] overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-xl">
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.03] animate-blob"></div>
              <div className="absolute -bottom-8 left-20 w-96 h-96 bg-[var(--chart-5)] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.03] animate-blob animation-delay-2000"></div>
            </div>
            
            <div className="relative p-8 md:p-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex-1 animate-slide-in-down">
                  <div className="inline-block mb-4">
                    <span className="glow-gradient bg-clip-text text-transparent text-[10px] font-black uppercase tracking-[0.2em]">
                      Department Head Dashboard
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-3">
                    {selectedDept?.name}
                  </h1>
                  <p className="text-[var(--muted-foreground)] text-sm md:text-base leading-relaxed max-w-xl">
                    Oversee your department's operations, manage staff, and monitor patient care metrics.
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto animate-slide-in-up">
                  <div className="card-hover group bg-[var(--sidebar)] rounded-3xl p-6 border border-[var(--border)] text-center">
                    <div className="text-[var(--muted-foreground)] text-[10px] font-bold uppercase tracking-widest mb-2">
                      Total Patients
                    </div>
                    <div className="text-4xl font-black text-[var(--primary)] mb-2">
                      {selectedDept?.patientCount || 0}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[var(--primary)] text-[10px] font-bold">
                      <TrendingUp size={14} /> +12% this month
                    </div>
                  </div>

                  <div className="card-hover group bg-[var(--sidebar)] rounded-3xl p-6 border border-[var(--border)] text-center">
                    <div className="text-[var(--muted-foreground)] text-[10px] font-bold uppercase tracking-widest mb-2">
                      Staff Members
                    </div>
                    <div className="text-4xl font-black text-[var(--chart-5)] mb-2">
                      {selectedDept?.memberCount || 0}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[var(--muted-foreground)] text-[10px] font-bold">
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
            className={`px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 border ${
              activeTab === 'overview' 
                ? 'glow-gradient text-white shadow-lg border-transparent' 
                : 'bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--sidebar)]'
            }`}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('doctors')}
            className={`px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 border ${
              activeTab === 'doctors' 
                ? 'glow-gradient text-white shadow-lg border-transparent' 
                : 'bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--sidebar)]'
            }`}
          >
            <Users size={18} />
            Staff Management
          </button>
        </div>

        {/* Content Area */}
        <div className="rounded-[2.5rem] border border-[var(--border)] bg-[var(--card)] shadow-xl overflow-hidden">
          {activeTab === 'overview' && (
            <div className="p-8 md:p-12 animate-fade-scale">
              {/* Description Section */}
              <div className="mb-12">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-[var(--foreground)] mb-2">Department Protocol</h2>
                    <p className="text-[var(--muted-foreground)] text-[10px] font-bold uppercase tracking-widest">Keep your team and patients informed</p>
                  </div>
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="dc-btn-primary flex items-center gap-2"
                    >
                      <Settings size={18} /> Edit Protocol
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button 
                        onClick={handleUpdate}
                        className="dc-btn-primary !bg-emerald-600 flex items-center gap-2"
                      >
                        <Save size={16} /> Save Status
                      </button>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-[var(--muted-foreground)] bg-[var(--sidebar)] border border-[var(--border)] hover:bg-[var(--background)] transition-all"
                      >
                        <X size={16} /> Cancel
                      </button>
                    </div>
                  )}
                </div>

                {!isEditing ? (
                  <div className="bg-[var(--background)] rounded-2xl p-8 border border-[var(--border)] text-[var(--foreground)] leading-relaxed shadow-inner">
                    {selectedDept.description || (
                      <span className="text-[var(--muted-foreground)] italic">No specific protocol set. Define services and clinical guidelines here.</span>
                    )}
                  </div>
                ) : (
                  <textarea 
                    className="dc-input min-h-[250px] !p-8 font-medium"
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    placeholder="Describe your department, services offered, specialties..."
                  />
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-hover bg-[var(--sidebar)] rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--secondary)] flex items-center justify-center border border-[var(--border)]">
                      <Building2 size={24} className="text-[var(--primary)]" />
                    </div>
                    <div>
                      <div className="text-[var(--muted-foreground)] text-[10px] font-black uppercase tracking-widest">Branch ID</div>
                      <div className="text-xl font-black text-[var(--foreground)]">#{selectedDept?.branchId}</div>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-[var(--sidebar)] rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--secondary)] flex items-center justify-center border border-[var(--border)]">
                      <Clock size={24} className="text-[var(--chart-5)]" />
                    </div>
                    <div>
                      <div className="text-[var(--muted-foreground)] text-[10px] font-black uppercase tracking-widest">Duty Status</div>
                      <div className="text-xl font-black text-[var(--foreground)]">Active</div>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-[var(--sidebar)] rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--secondary)] flex items-center justify-center border border-[var(--border)]">
                      <Shield size={24} className="text-[var(--primary)]" />
                    </div>
                    <div>
                      <div className="text-[var(--muted-foreground)] text-[10px] font-black uppercase tracking-widest">Security</div>
                      <div className="text-xl font-black text-[var(--foreground)]">Verified</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'doctors' && (
            <div className="p-8 md:p-12 animate-fade-scale">
              <div className="mb-10">
                <h2 className="text-2xl font-black text-[var(--foreground)] mb-2">Manage Your Team</h2>
                <p className="text-[var(--muted-foreground)] text-sm font-medium">Add or remove clinical staff to build your department's roster.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Staff */}
                <div>
                  <h3 className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-6">👥 Current Personnel</h3>
                  <div className="bg-[var(--background)] rounded-3xl p-12 border-2 border-dashed border-[var(--border)] text-center">
                    <div className="w-16 h-16 bg-[var(--secondary)] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[var(--border)]">
                      <Users size={32} className="text-[var(--primary)] opacity-40" />
                    </div>
                    <p className="text-[var(--muted-foreground)] text-xs font-bold mb-6">Staff synchronization pending clinical review.</p>
                    <button className="text-[var(--primary)] text-xs font-black uppercase tracking-widest hover:opacity-80 transition-opacity flex items-center gap-2 mx-auto">
                      View All Doctors <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Add Doctor Card */}
                <div className="card-hover bg-[var(--sidebar)] rounded-3xl p-8">
                  <div className="flex flex-col h-full">
                    <div>
                      <div className="w-14 h-14 bg-gradient-to-br from-[var(--primary)] to-[var(--chart-5)] text-white rounded-xl flex items-center justify-center mb-6 shadow-lg">
                        <Plus size={28} />
                      </div>
                      <h3 className="text-xl font-black text-[var(--foreground)] mb-3">Assign New Personnel</h3>
                      <p className="text-[var(--muted-foreground)] text-sm mb-8 leading-relaxed font-medium">Assign available specialists to your department's unit.</p>
                    </div>
                    
                    <div className="flex gap-2 mt-auto">
                      <input className="dc-input" placeholder="Staff Name or ID" />
                      <button className="dc-btn-primary whitespace-nowrap">Assign Unit</button>
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