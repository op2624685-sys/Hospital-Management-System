import React from "react";
import { Link } from "react-router-dom";

const doctors = [
  {
    id: 1,
    name: "Dr. Rajesh Sharma",
    specialization: "Cardiologist",
    experience: "15 Years",
    initials: "RS",
    color: "from-rose-400 to-rose-600",
    soft: "bg-rose-500/15",
    text: "text-rose-300",
  },
  {
    id: 2,
    name: "Dr. Priya Mehta",
    specialization: "Neurologist",
    experience: "12 Years",
    initials: "PM",
    color: "from-violet-400 to-violet-600",
    soft: "bg-violet-500/15",
    text: "text-violet-300",
  },
  {
    id: 3,
    name: "Dr. Amit Verma",
    specialization: "Orthopedic Surgeon",
    experience: "10 Years",
    initials: "AV",
    color: "from-fuchsia-400 to-fuchsia-600",
    soft: "bg-fuchsia-500/15",
    text: "text-fuchsia-300",
  },
];

const DoctorsSection = () => {
  return (
    <section className='px-5 lg:px-20 pb-12 lg:pb-20'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6 sm:gap-0'>
        <div>
          <span className='inline-flex items-center gap-2 bg-rose-500/10 border border-rose-400/25 text-rose-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4'>
            Meet The Team
          </span>
          <h2 className='text-5xl font-black text-white'>
            Our Expert{' '}
            <span className='text-transparent bg-clip-text'
              style={{ backgroundImage: 'linear-gradient(135deg, #f472b6, #fb923c)' }}>
              Doctors
            </span>
          </h2>
        </div>
        <Link to='/doctors'
          className='flex items-center gap-2 border border-white/20 text-gray-300 font-semibold py-3 px-6 rounded-xl hover:border-violet-400/50 hover:text-violet-300 transition-all duration-300 text-sm backdrop-blur-sm'
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          View All Doctors →
        </Link>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {doctors.map((doctor) => (
          <div key={doctor.id}
            className='group border border-white/10 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm'
            style={{ background: 'rgba(255,255,255,0.06)' }}>

            {/* Card top */}
            <div className={`relative bg-linear-to-br ${doctor.color} p-8 flex flex-col items-center`}>
              <div className='absolute top-3 right-3 flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full'>
                <div className='w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse'></div>
                <span className='text-xs font-semibold text-white/80'>Available</span>
              </div>
              <div className='w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/40 mb-3 group-hover:scale-110 transition-transform duration-300'>
                <span className='text-white font-black text-2xl'>{doctor.initials}</span>
              </div>
              <h3 className='text-white font-black text-xl'>{doctor.name}</h3>
            </div>

            {/* Card body */}
            <div className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <span className={`text-sm font-bold px-3 py-1 rounded-xl ${doctor.soft} ${doctor.text}`}>
                  {doctor.specialization}
                </span>
                <span className='text-xs text-gray-500 font-medium'>⭐ 4.9</span>
              </div>

              <div className='flex items-center gap-2 text-gray-500 text-sm mb-5'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                {doctor.experience} Experience
              </div>

              <Link to='/appointment'
                className={`w-full flex items-center justify-center gap-2 bg-linear-to-r ${doctor.color} text-white font-bold py-3 rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-md text-sm`}>
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
