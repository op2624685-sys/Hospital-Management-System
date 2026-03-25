import React, { useState, useEffect } from 'react';
import { Building2, Users, UserRound, ArrowRight, LayoutDashboard, Search, Sparkles, Settings } from 'lucide-react';
import { doctorAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DoctorDepartment = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchDept = async () => {
            try {
                const { data } = await doctorAPI.getMyDepartments();
                setDepartments(data);
            } catch (error) {
                console.error("Error fetching departments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDept();
    }, []);

    const filteredDepts = departments.filter(dept => 
        dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50 backdrop-blur-sm">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-opacity-30"></div>
                    <div className="absolute top-0 animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-24 pb-20 px-4 md:px-8 lg:px-12 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-100 rounded-full blur-[100px] opacity-40 -z-10 animate-pulse"></div>
            <div className="absolute bottom-[5%] left-[-5%] w-[500px] h-[500px] bg-teal-50 rounded-full blur-[120px] opacity-50 -z-10"></div>

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-blue-600 font-bold tracking-wider uppercase text-[10px] bg-blue-50 w-fit px-3 py-1 rounded-full border border-blue-100 mb-2">
                            <Sparkles size={12} />
                            <span>Doctor Dashboard</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Departments</span>
                        </h1>
                        <p className="text-slate-500 max-w-xl text-lg font-medium leading-relaxed">
                            Oversee your clinical assignments across hospital branches and manage specialized care units.
                        </p>
                    </div>

                    <div className="relative group w-full md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search departments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all text-slate-700 shadow-sm font-medium"
                        />
                    </div>
                </div>

                {filteredDepts.length === 0 ? (
                    <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-16 text-center border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-3xl mx-auto">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-1 ring-blue-100">
                            <Building2 className="text-blue-600" size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">No Department Found</h2>
                        <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                            {searchTerm 
                                ? `We couldn't find any department matching "${searchTerm}". Try another keyboard word.` 
                                : "You haven't been assigned to any department yet. Contact the clinical administrator to get started."}
                        </p>
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm("")}
                                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl transition-all hover:bg-slate-800 shadow-lg"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredDepts.map((dept) => {
                            const isHead = dept.headDoctorId === Number(user?.id);
                            
                            return (
                                <div 
                                    key={dept.id} 
                                    className="group relative bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_15px_35px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_60px_rgba(37,99,235,0.12)] transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col"
                                >
                                    {/* Indicator for Head Status */}
                                    {isHead && (
                                        <div className="absolute top-0 right-0 p-1">
                                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.1em] px-5 py-2 rounded-bl-3xl rounded-tr-[2.3rem] shadow-lg flex items-center gap-2">
                                                <Sparkles size={10} />
                                                Head of Unit
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-8 pt-10 flex-grow">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl shadow-blue-200 group-hover:rotate-6 transition-transform duration-500">
                                                {dept.icon || "🏥"}
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                                            {dept.name}
                                        </h3>
                                        <p className="text-slate-500 text-sm font-medium mb-8 line-clamp-2 leading-relaxed h-10">
                                            {dept.description || "Providing specialized medical care with state-of-the-art facilities and experienced doctors."}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="bg-[#f1f5f9]/60 rounded-3xl p-5 border border-white/50 group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-all duration-300">
                                                <div className="flex items-center gap-2 text-slate-400 mb-2 group-hover:text-blue-400">
                                                    <UserRound size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Doctors</span>
                                                </div>
                                                <div className="text-3xl font-black text-slate-900 group-hover:scale-105 transition-transform origin-left">
                                                    {dept.memberCount || 0}
                                                </div>
                                            </div>
                                            <div className="bg-[#f1f5f9]/60 rounded-3xl p-5 border border-white/50 group-hover:bg-teal-50/50 group-hover:border-teal-100 transition-all duration-300">
                                                <div className="flex items-center gap-2 text-slate-400 mb-2 group-hover:text-teal-400">
                                                    <Users size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Patients</span>
                                                </div>
                                                <div className="text-3xl font-black text-slate-900 group-hover:scale-105 transition-transform origin-left">
                                                    {dept.patientCount || 0}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-slate-500 text-xs font-bold shadow-inner mb-4">
                                            <Building2 size={14} className="text-blue-500" />
                                            <span>Branch #{dept.branchId}</span>
                                        </div>
                                    </div>

                                    <div className="px-8 pb-8">
                                        {isHead ? (
                                            <button 
                                                onClick={() => navigate('/doctor/department-head')}
                                                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 group/btn active:scale-95"
                                            >
                                                <Settings size={18} className="group-hover/btn:rotate-90 transition-transform duration-500" />
                                                Manage Department
                                                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-between text-slate-400 font-bold text-xs uppercase tracking-tighter px-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    <span>Active Member</span>
                                                </div>
                                                <div className="flex -space-x-3">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-bold">
                                                            {i === 3 ? '+' : <UserRound size={12} />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorDepartment;
