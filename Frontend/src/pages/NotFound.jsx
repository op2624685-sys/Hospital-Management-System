import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen w-full bg-[#fdfdfe] flex items-center justify-center p-4 font-sans selection:bg-blue-100">

      {/* --- SOFT AMBIENT BACKGROUND --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute -bottom-[10%] -left-[5%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] opacity-60"></div>

        <div className="absolute inset-0 opacity-[0.03]"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10v40M10 30h40' stroke='%233b82f6' stroke-width='2'/%3E%3C/svg%3E")`,
               backgroundSize: '60px 60px'
             }}>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full">

        {/* Navbar Logo - Now Perfectly Circular */}
        <div className="relative mb-12">
          <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
            {/* Pulsing Rings for Premium Effect */}
            <div className="absolute inset-0 rounded-full border-2 border-blue-100 animate-ping opacity-20"></div>
            <div className="absolute inset-4 rounded-full border border-blue-200 animate-pulse opacity-40"></div>

            {/* Logo exactly as in Header.jsx but Circular */}
            <div className="relative z-10 flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
                 style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              <Activity size={40} className="text-white" />
            </div>
          </div>
        </div>

        {/* Text Section */}
        <div className="space-y-4 mb-12">
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-800">
            Page Not Found in Registry
          </h2>
          <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
            The record you're looking for seems to be missing from our digital archives.
            It might have been archived or moved to another department.
          </p>
        </div>

        {/* Premium Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg">
          <Link
            to="/"
            className="group relative px-8 py-4 bg-slate-900 text-white font-medium rounded-2xl transition-all duration-300 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-1 w-full sm:w-auto text-center"
          >
            Back to Main Hall
          </Link>
          <Link
            to="/contact"
            className="px-8 py-4 bg-white text-slate-600 font-medium rounded-2xl border border-slate-200 transition-all duration-300 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 w-full sm:w-auto text-center"
          >
            Request Assistance
          </Link>
        </div>

        <div className="mt-20 flex items-center gap-3 text-slate-400 text-sm font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>HMS Secure Cloud Infrastructure</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
