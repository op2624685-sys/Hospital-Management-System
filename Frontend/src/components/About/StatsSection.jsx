import React from "react";

const stats = [
  { value: "10,000+", label: "Patients Treated", icon: "❤️", color: "var(--chart-1)", bg: "color-mix(in srgb, var(--chart-1) 15%, transparent)" },
  { value: "50+", label: "Expert Doctors", icon: "👨‍⚕️", color: "var(--chart-2)", bg: "color-mix(in srgb, var(--chart-2) 15%, transparent)" },
  { value: "150", label: "Hospital Beds", icon: "🛏️", color: "var(--chart-3)", bg: "color-mix(in srgb, var(--chart-3) 15%, transparent)" },
  { value: "24/7", label: "Emergency Service", icon: "🚑", color: "var(--chart-4)", bg: "color-mix(in srgb, var(--chart-4) 15%, transparent)" },
];

const StatsSection = () => {
  return (
    <section className='px-5 lg:px-20 pb-12 lg:pb-20'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
        {stats.map((stat, i) => (
          <div key={i}
            className='border rounded-2xl p-6 flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-[var(--card)] shadow-xs'
            style={{ borderColor: 'var(--border)' }}>
            <div className='w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0' style={{ background: stat.bg }}>
              {stat.icon}
            </div>
            <div>
              <p className='text-3xl font-black' style={{ color: stat.color }}>{stat.value}</p>
              <p className='text-xs text-[var(--muted-foreground)] mt-0.5 font-medium'>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
