import React from "react";
import { Link } from "react-router-dom";

const StorySection = () => {
  return (
    <section className='mx-5 lg:mx-20 mb-12 lg:mb-20 border rounded-3xl p-8 lg:p-16 backdrop-blur-sm bg-[var(--card)] shadow-xs'
      style={{ borderColor: 'var(--border)' }}>
      <div className='flex flex-col lg:flex-row gap-12 lg:gap-16 items-start lg:items-center'>
        <div className='flex-1'>
          <span className='inline-flex items-center gap-2 border text-[var(--chart-4)] text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-5'
             style={{ background: 'color-mix(in srgb, var(--chart-4) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--chart-4) 30%, transparent)' }}>
            Our Story
          </span>
          <h2 className='text-5xl font-black text-[var(--foreground)] leading-tight mb-6'>
            20 Years of <br />
            <span className='text-transparent bg-clip-text'
              style={{ backgroundImage: 'linear-gradient(135deg, var(--chart-4), var(--chart-5))' }}>
              Trusted Care
            </span>
          </h2>
          <p className='text-[var(--muted-foreground)] leading-relaxed mb-4'>
            Founded in 2005, DELTACARE began as a small clinic with a big vision —
            to make quality healthcare accessible to everyone. Over two decades,
            we've grown into a multi-specialty hospital serving thousands of patients.
          </p>
          <p className='text-[var(--muted-foreground)] leading-relaxed mb-8'>
            Today, with 50+ specialist doctors, state-of-the-art equipment and a
            dedicated staff, we continue to uphold our founding principle:
            <span className='text-[var(--foreground)] font-semibold'> people before profit.</span>
          </p>
          <Link to='/contact'
            className='inline-flex items-center gap-2 text-white font-bold py-4 px-8 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg text-sm group'
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--chart-5))' }}>
            Get In Touch
            <span className='group-hover:translate-x-1 transition-transform duration-300'>→</span>
          </Link>
        </div>

        {/* Timeline */}
        <div className='w-full lg:w-72 flex flex-col gap-6 shrink-0'>
          {[
            { year: '2005', label: 'Hospital Founded', color: 'var(--chart-1)' },
            { year: '2010', label: 'Expanded to 150 beds', color: 'var(--chart-2)' },
            { year: '2015', label: 'ICU & Emergency Wing', color: 'var(--chart-3)' },
            { year: '2020', label: '10,000+ Patients Milestone', color: 'var(--chart-4)' },
            { year: '2025', label: '20 Years of Excellence', color: 'var(--chart-5)' },
          ].map((item, i) => (
            <div key={i} className='flex items-center gap-4'>
              <div className='w-3 h-3 rounded-full shrink-0' style={{ background: item.color }}></div>
              <div className='flex-1 h-px bg-[var(--border)]'></div>
              <div className='text-right shrink-0'>
                <p className='text-xs font-black text-[var(--foreground)]'>{item.year}</p>
                <p className='text-xs text-[var(--muted-foreground)]'>{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StorySection;
