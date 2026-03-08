import React from "react";

const values = [
  { icon: "🎯", title: "Patient First", desc: "Every decision we make puts the patient's wellbeing at the center." },
  { icon: "🔬", title: "Innovation", desc: "We invest in the latest medical technologies for better outcomes." },
  { icon: "🤝", title: "Compassion", desc: "We treat every patient with dignity, empathy and respect." },
  { icon: "⭐", title: "Excellence", desc: "We hold ourselves to the highest standards of medical practice." },
];

const ValuesSection = () => {
  return (
    <section className='px-5 lg:px-20 pb-12 lg:pb-20'>
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

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
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
  );
};

export default ValuesSection;
