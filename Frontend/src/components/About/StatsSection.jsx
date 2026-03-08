import React from "react";

const stats = [
  { value: "10,000+", label: "Patients Treated", icon: "❤️", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { value: "50+", label: "Expert Doctors", icon: "👨‍⚕️", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  { value: "150", label: "Hospital Beds", icon: "🛏️", color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20" },
  { value: "24/7", label: "Emergency Service", icon: "🚑", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
];

const StatsSection = () => {
  return (
    <section className='px-5 lg:px-20 pb-12 lg:pb-20'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
        {stats.map((stat, i) => (
          <div key={i}
            className={`${stat.bg} border ${stat.border} rounded-2xl p-6 flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 backdrop-blur-sm`}
            style={{ boxShadow: 'none' }}>
            <div className='w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl shrink-0'>
              {stat.icon}
            </div>
            <div>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              <p className='text-xs text-gray-500 mt-0.5 font-medium'>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
