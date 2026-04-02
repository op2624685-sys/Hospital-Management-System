import React from "react";
import { Link } from "react-router-dom";

const doctors = [
  {
    id: 1,
    name: "Dr. Rajesh Sharma",
    specialization: "Cardiologist",
    experience: "15 Years",
    initials: "RS",
    color: "linear-gradient(135deg, var(--chart-1), var(--chart-5))",
    soft: "color-mix(in srgb, var(--chart-1) 15%, transparent)",
    text: "var(--chart-1)",
  },
  {
    id: 2,
    name: "Dr. Priya Mehta",
    specialization: "Neurologist",
    experience: "12 Years",
    initials: "PM",
    color: "linear-gradient(135deg, var(--chart-2), var(--primary))",
    soft: "color-mix(in srgb, var(--chart-2) 15%, transparent)",
    text: "var(--chart-2)",
  },
  {
    id: 3,
    name: "Dr. Amit Verma",
    specialization: "Orthopedic Surgeon",
    experience: "10 Years",
    initials: "AV",
    color: "linear-gradient(135deg, var(--chart-4), var(--chart-3))",
    soft: "color-mix(in srgb, var(--chart-4) 15%, transparent)",
    text: "var(--chart-4)",
  },
];

const DoctorsSection = () => {
  return (
    <section className='px-5 lg:px-20 pb-12 lg:pb-20'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6 sm:gap-0'>
        <div>
          <span className='inline-flex items-center gap-2 border text-[var(--chart-3)] text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4'
             style={{ background: 'color-mix(in srgb, var(--chart-3) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--chart-3) 30%, transparent)' }}>
            Meet The Team
          </span>
          <h2 className='text-5xl font-black text-[var(--foreground)]'>
            Our Expert{' '}
            <span className='text-transparent bg-clip-text'
              style={{ backgroundImage: 'linear-gradient(135deg, var(--chart-5), var(--chart-4))' }}>
              Doctors
            </span>
          </h2>
        </div>
        <Link to='/doctors'
          className='flex items-center gap-2 border text-[var(--foreground)] font-semibold py-3 px-6 rounded-xl hover:text-[var(--primary)] transition-all duration-300 text-sm backdrop-blur-sm bg-[var(--card)] shadow-xs hover:shadow-md'
          style={{ borderColor: 'var(--border)' }}>
          View All Doctors →
        </Link>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {doctors.map((doctor) => (
          <div key={doctor.id}
            className='group border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm bg-[var(--card)] shadow-xs'
            style={{ borderColor: 'var(--border)' }}>

            {/* Card top */}
            <div className='relative p-8 flex flex-col items-center' style={{ background: doctor.color }}>
              <div className='absolute top-3 right-3 flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10'>
                <div className='w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse'></div>
                <span className='text-xs font-semibold text-white/90'>Available</span>
              </div>
              <div className='w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/40 mb-3 group-hover:scale-110 transition-transform duration-300'>
                <span className='text-white font-black text-2xl'>{doctor.initials}</span>
              </div>
              <h3 className='text-white font-black text-xl'>{doctor.name}</h3>
            </div>

            {/* Card body */}
            <div className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <span className='text-sm font-bold px-3 py-1 rounded-xl' style={{ background: doctor.soft, color: doctor.text }}>
                  {doctor.specialization}
                </span>
                <span className='text-xs text-[var(--muted-foreground)] font-medium'>⭐ 4.9</span>
              </div>

              <div className='flex items-center gap-2 text-[var(--muted-foreground)] text-sm mb-5'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                {doctor.experience} Experience
              </div>

              <Link to='/appointment'
                className='w-full flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-md text-sm'
                style={{ background: doctor.color }}>
                Book Appointment →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DoctorsSection;
