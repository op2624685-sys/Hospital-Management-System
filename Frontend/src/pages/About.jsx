import React from "react";
import Header from "../components/Header";
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

const stats = [
  { value: "10,000+", label: "Patients Treated", icon: "❤️", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { value: "50+", label: "Expert Doctors", icon: "👨‍⚕️", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  { value: "150", label: "Hospital Beds", icon: "🛏️", color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20" },
  { value: "24/7", label: "Emergency Service", icon: "🚑", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
];

const values = [
  { icon: "🎯", title: "Patient First", desc: "Every decision we make puts the patient's wellbeing at the center." },
  { icon: "🔬", title: "Innovation", desc: "We invest in the latest medical technologies for better outcomes." },
  { icon: "🤝", title: "Compassion", desc: "We treat every patient with dignity, empathy and respect." },
  { icon: "⭐", title: "Excellence", desc: "We hold ourselves to the highest standards of medical practice." },
];

const About = () => {
  return (
    <div className='min-h-screen overflow-x-hidden relative'
      style={{ background: 'linear-gradient(160deg, #0f0c29 0%, #1a1040 20%, #24243e 45%, #1e1b4b 65%, #2d1b69 80%, #11071f 100%)' }}>

      {/* ── Grid overlay ── */}
      <div className='fixed inset-0 -z-10 opacity-[0.035]'
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}></div>

      {/* ── Global blobs ── */}
      <div className='fixed -top-24 -left-24 w-140 h-140 rounded-full blur-3xl opacity-45 -z-10 animate-pulse'
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, #4c1d95 55%, transparent 100%)' }}></div>
      <div className='fixed -bottom-20 -right-20 w-125 h-125 rounded-full blur-3xl opacity-40 -z-10 animate-pulse'
        style={{ background: 'radial-gradient(circle, #a855f7 0%, #6b21a8 60%, transparent 100%)', animationDelay: '1.5s' }}></div>
      <div className='fixed top-1/3 right-0 w-90 h-90 rounded-full blur-3xl opacity-30 -z-10'
        style={{ background: 'radial-gradient(circle, #e879f9 0%, #a21caf 55%, transparent 100%)' }}></div>
      <div className='fixed bottom-1/3 left-0 w-[320px] h-80 rounded-full blur-3xl opacity-30 -z-10 animate-pulse'
        style={{ background: 'radial-gradient(circle, #f472b6 0%, #9d174d 60%, transparent 100%)', animationDelay: '2s' }}></div>
      <div className='fixed top-2/3 left-1/3 w-70 h-70 rounded-full blur-2xl opacity-25 -z-10'
        style={{ background: 'radial-gradient(circle, #c084fc 0%, #7e22ce 55%, transparent 100%)' }}></div>

      <Header />

      {/* ══════════════════════
          HERO
      ══════════════════════ */}
      <section className='relative pt-40 pb-24 px-20 overflow-hidden'>
        <div className='absolute top-10 right-0 w-96 h-96 rounded-full blur-3xl opacity-20'
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }}></div>
        <div className='absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl opacity-15'
          style={{ background: 'radial-gradient(circle, #f472b6, transparent)' }}></div>

        <div className='relative z-10 max-w-5xl'>
          <span className='inline-flex items-center gap-2 bg-white/10 border border-violet-400/30 text-violet-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6'>
            <span className='w-2 h-2 bg-violet-400 rounded-full animate-pulse'></span>
            Est. 2005 · DELTACARE Hospital
          </span>

          <h1 className='text-8xl font-black leading-none mb-6' style={{ color: '#fff' }}>
            About <br />
            <span className='text-transparent bg-clip-text'
              style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #e879f9)' }}>
              Our Hospital
            </span>
          </h1>

          <p className='text-gray-400 text-xl leading-relaxed max-w-2xl'>
            Established in 2005, DELTACARE is committed to providing world-class
            healthcare services with
            <span className='text-gray-200 font-semibold'> compassion, innovation, and excellence.</span>
          </p>
        </div>
      </section>

      {/* ══════════════════════
          STATS BAR
      ══════════════════════ */}
      <section className='px-20 pb-20'>
        <div className='grid grid-cols-4 gap-5'>
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

      {/* ══════════════════════
          MISSION & VISION
      ══════════════════════ */}
      <section className='px-20 pb-20'>
        <div className='grid grid-cols-2 gap-6'>

          {/* Mission */}
          <div className='relative rounded-3xl p-10 overflow-hidden border border-white/10'
            style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
            <div className='absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-15'
              style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }}></div>
            <div className='absolute bottom-0 left-0 w-36 h-36 rounded-full blur-3xl opacity-10'
              style={{ background: 'radial-gradient(circle, #e879f9, transparent)' }}></div>
            <div className='relative z-10'>
              <div className='w-14 h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center text-2xl mb-6'>
                🎯
              </div>
              <span className='text-violet-400 text-xs font-black uppercase tracking-widest'>Our Mission</span>
              <h3 className='text-3xl font-black text-white mt-2 mb-4'>
                Healthcare For Everyone
              </h3>
              <p className='text-gray-400 leading-relaxed'>
                To provide high-quality, affordable healthcare services with a
                patient-centered approach and advanced medical technology that
                makes a real difference in people's lives.
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className='relative rounded-3xl p-10 overflow-hidden'
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #e879f9 100%)' }}>
            <div className='absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl opacity-10'></div>
            <div className='absolute bottom-0 left-0 w-36 h-36 bg-fuchsia-300 rounded-full blur-3xl opacity-10'></div>
            <div className='relative z-10'>
              <div className='w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl mb-6'>
                🔭
              </div>
              <span className='text-violet-200 text-xs font-black uppercase tracking-widest'>Our Vision</span>
              <h3 className='text-3xl font-black text-white mt-2 mb-4'>
                Leading The Future
              </h3>
              <p className='text-violet-100 leading-relaxed'>
                To become a leading multi-specialty hospital known for excellence,
                innovation and compassionate care that sets the standard for
                healthcare in the region.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════
          OUR VALUES
      ══════════════════════ */}
      <section className='px-20 pb-20'>
        <div className='text-center mb-12'>
          <span className='inline-flex items-center gap-2 bg-white/10 border border-fuchsia-400/30 text-fuchsia-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4'>
            What We Stand For
          </span>
          <h2 className='text-5xl font-black text-white'>
            Our Core{' '}
            <span className='text-transparent bg-clip-text'
              style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #e879f9)' }}>
              Values
            </span>
          </h2>
        </div>

        <div className='grid grid-cols-4 gap-5'>
          {values.map((value, i) => (
            <div key={i}
              className='group border border-white/10 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-default backdrop-blur-sm'
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className='w-14 h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300'>
                {value.icon}
              </div>
              <h3 className='font-black text-white text-lg mb-2'>{value.title}</h3>
              <p className='text-gray-400 text-sm leading-relaxed'>{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════
          DOCTORS SECTION
      ══════════════════════ */}
      <section className='px-20 pb-20'>
        <div className='flex justify-between items-end mb-12'>
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

        <div className='grid grid-cols-3 gap-6'>
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

      {/* ══════════════════════
          STORY SECTION
      ══════════════════════ */}
      <section className='mx-20 mb-20 border border-white/10 rounded-3xl p-16 backdrop-blur-sm'
        style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className='flex gap-16 items-center'>
          <div className='flex-1'>
            <span className='inline-flex items-center gap-2 bg-amber-500/10 border border-amber-400/25 text-amber-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-5'>
              Our Story
            </span>
            <h2 className='text-5xl font-black text-white leading-tight mb-6'>
              20 Years of <br />
              <span className='text-transparent bg-clip-text'
                style={{ backgroundImage: 'linear-gradient(135deg, #fbbf24, #f97316)' }}>
                Trusted Care
              </span>
            </h2>
            <p className='text-gray-400 leading-relaxed mb-4'>
              Founded in 2005, DELTACARE began as a small clinic with a big vision —
              to make quality healthcare accessible to everyone. Over two decades,
              we've grown into a multi-specialty hospital serving thousands of patients.
            </p>
            <p className='text-gray-400 leading-relaxed mb-8'>
              Today, with 50+ specialist doctors, state-of-the-art equipment and a
              dedicated staff, we continue to uphold our founding principle:
              <span className='text-gray-200 font-semibold'> people before profit.</span>
            </p>
            <Link to='/contact'
              className='inline-flex items-center gap-2 text-white font-bold py-4 px-8 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg text-sm group'
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              Get In Touch
              <span className='group-hover:translate-x-1 transition-transform duration-300'>→</span>
            </Link>
          </div>

          {/* Timeline */}
          <div className='w-72 flex flex-col gap-6 shrink-0'>
            {[
              { year: '2005', label: 'Hospital Founded', color: 'bg-violet-500' },
              { year: '2010', label: 'Expanded to 150 beds', color: 'bg-fuchsia-500' },
              { year: '2015', label: 'ICU & Emergency Wing', color: 'bg-amber-500' },
              { year: '2020', label: '10,000+ Patients Milestone', color: 'bg-rose-500' },
              { year: '2025', label: '20 Years of Excellence', color: 'bg-purple-500' },
            ].map((item, i) => (
              <div key={i} className='flex items-center gap-4'>
                <div className={`w-3 h-3 ${item.color} rounded-full shrink-0`}></div>
                <div className='flex-1 h-px bg-white/10'></div>
                <div className='text-right shrink-0'>
                  <p className='text-xs font-black text-gray-200'>{item.year}</p>
                  <p className='text-xs text-gray-500'>{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className='text-center pb-10'>
        <p className='text-xs text-gray-600'>© 2026 DELTACARE Hospital · All rights reserved</p>
      </div>
    </div>
  );
};

export default About;