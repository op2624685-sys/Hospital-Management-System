import React, { useState, useEffect } from "react";
import { Building2, Users, UserRound, LayoutDashboard, Plus, Trash2, Save, X, Activity } from 'lucide-react';
import { doctorAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";

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
    <div style={{ width: size, height: size, borderRadius: "50%", background: light, border: `1.5px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 600, color, flexShrink: 0, fontFamily: "'Inter', sans-serif" }}>
      {initials}
    </div>
  );
}

function Badge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span style={{ background: s.bg, color: s.text, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif", letterSpacing: 0.2 }}>{s.label}</span>
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

  useEffect(() => {
    const fetchHeadDepts = async () => {
      try {
        const { data } = await doctorAPI.getMyDepartments();
        // Filter departments where current doctor is head
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
      // Show success toast or similar
    } catch (error) {
      console.error("Error updating department:", error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
  </div>;

  if (departments.length === 0) return (
    <div className="min-h-screen pt-24 px-8 bg-slate-50 flex flex-col items-center justify-center">
      <div className="bg-white p-12 rounded-3xl shadow-sm text-center max-w-lg border border-slate-200">
        <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Activity size={40} className="text-amber-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-4">Access Restricted</h2>
        <p className="text-slate-500 mb-0">This panel is only accessible to Department Heads. You are currently not assigned as a head of any department.</p>
      </div>
    </div>
  );

  const color = "#3B82F6"; // Blue-500

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 mb-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Dept Head Panel</span>
              <span className="text-slate-400 text-sm font-bold">Branch ID: {selectedDept?.branchId}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">{selectedDept?.name}</h1>
            <p className="text-slate-500 mt-1">Manage your department staff, patients and configurations.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center min-w-[100px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Patients</span>
              <span className="text-2xl font-black text-blue-600">{selectedDept?.patientCount || 0}</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center min-w-[100px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Doctors</span>
              <span className="text-2xl font-black text-blue-600">{selectedDept?.memberCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex gap-4 mb-8">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setActiveTab('doctors')}
                className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'doctors' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
                Staff Management
            </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {activeTab === 'overview' && (
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-slate-900">Department Description</h2>
                        {!isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-xl transition-all"
                            >
                                <LayoutDashboard size={18} /> Edit Details
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleUpdate}
                                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm"
                                >
                                    <Save size={16} /> Save Changes
                                </button>
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm"
                                >
                                    <X size={16} /> Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {!isEditing ? (
                        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 text-slate-600 leading-relaxed">
                            {selectedDept.description || "No description set for this department. Use the edit feature to add details about services, equipment, and specialization."}
                        </div>
                    ) : (
                        <textarea 
                            className="w-full bg-slate-50 rounded-2xl p-8 border border-blue-200 text-slate-900 leading-relaxed min-h-[200px] outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                            value={editData.description}
                            onChange={(e) => setEditData({...editData, description: e.target.value})}
                            placeholder="Describe your department..."
                        />
                    )}
                </div>
            )}

            {activeTab === 'doctors' && (
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-black text-slate-900">Doctor Management</h2>
                        <p className="text-slate-400 text-sm font-medium">Add or remove doctors from this branch department.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Current Doctors List */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">Current Staff</h3>
                            {/* In a real app, we'd map over selectedDept.doctors which would be doctor IDs or objects */}
                            <div className="bg-slate-50/50 rounded-2xl p-6 border border-dashed border-slate-200 text-center py-12">
                                <Users size={32} className="text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-400 text-sm font-medium">Detailed staff list implementation pending backend link for members.</p>
                                <button className="mt-4 text-blue-600 text-sm font-black hover:underline">View All Active Doctors</button>
                            </div>
                        </div>

                        {/* Add Doctor Quick Action */}
                        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                             <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6">
                                <Plus size={24} />
                             </div>
                             <h3 className="text-lg font-black text-slate-900 mb-2">Assign New Doctor</h3>
                             <p className="text-slate-500 text-sm mb-6">Search and assign available doctors to your department.</p>
                             <div className="flex gap-2">
                                <input 
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
                                    placeholder="Doctor Name or ID"
                                />
                                <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-black transition-colors">
                                    Assign
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}