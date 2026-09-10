import React from "react";
import { Heart, UserCheck, Bed, Siren } from 'lucide-react';

const stats = [
  { value: "10,000+", label: "Patients Treated", icon: Heart, color: "var(--chart-1)", bg: "color-mix(in srgb, var(--chart-1) 15%, transparent)" },
  { value: "50+", label: "Expert Doctors", icon: UserCheck, color: "var(--chart-2)", bg: "color-mix(in srgb, var(--chart-2) 15%, transparent)" },
  { value: "150", label: "Hospital Beds", icon: Bed, color: "var(--chart-3)", bg: "color-mix(in srgb, var(--chart-3) 15%, transparent)" },
  { value: "24/7", label: "Emergency Service", icon: Siren, color: "var(--chart-4)", bg: "color-mix(in srgb, var(--chart-4) 15%, transparent)" },
];

const StatsSection = () => {
  return (
    <section className='px-5 lg:px-20 pb-12 lg:pb-20'>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5'>
        {stats.map((stat, i) => (
          <div key={i}
            className='border rounded-2xl p-4 sm:p-6 flex items-center gap-3 sm:gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-[var(--card)] shadow-xs'
            style={{ borderColor: 'var(--border)' }}>
            <div className='w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0' style={{ background: stat.bg }}>
              <stat.icon size={20} className='sm:w-6 sm:h-6' style={{ color: stat.color }} />
            </div>
            <div className='min-w-0'>
              <p className='text-xl sm:text-3xl font-black truncate' style={{ color: stat.color }}>{stat.value}</p>
              <p className='text-[10px] sm:text-xs text-[var(--muted-foreground)] mt-0.5 font-medium truncate'>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
