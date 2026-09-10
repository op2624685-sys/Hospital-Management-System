import React from "react";
import { MapPin, Phone, Mail, Clock, Map } from 'lucide-react';

const ContactInfo = () => {
  return (
    <div className='bg-[var(--card)]/50 backdrop-blur-xl border border-[var(--border)] rounded-3xl p-8 flex flex-col gap-6'
      style={{ boxShadow: '0 20px 60px rgba(124,58,237,0.20), 0 4px 16px rgba(99,102,241,0.15)' }}>

      <div>
        <h2 className='text-2xl font-black text-[var(--foreground)] mb-1'>
          Contact <span style={{ color: '#a78bfa' }}>Info</span>
        </h2>
        <p className='text-[var(--muted-foreground)] text-sm'>Multiple ways to reach us</p>
      </div>

      {/* Info Items */}
      <div className='flex flex-col gap-4'>
        {[
          { icon: MapPin, label: 'Address', value: '123 Health Street, Delhi, India', color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { icon: Phone, label: 'Phone', value: '+91 98765 43210', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { icon: Mail, label: 'Email', value: 'info@deltacare.com', color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { icon: Clock, label: 'Hours', value: 'Open 24/7', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        ].map((item, i) => (
          <div key={i}
            className={`flex items-center gap-4 ${item.bg} backdrop-blur-sm border border-[var(--border)] rounded-2xl p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300`}>
            <div className='w-10 h-10 bg-[var(--card)]/50 rounded-xl flex items-center justify-center shadow-sm shrink-0'>
              <item.icon size={20} style={{ color: item.color.replace('text-', '') }} />
            </div>
            <div>
              <p className={`text-xs font-bold ${item.color} uppercase tracking-wider`}>{item.label}</p>
              <p className='text-sm font-semibold text-[var(--foreground)] mt-0.5'>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className='h-px'
        style={{ background: 'linear-gradient(to right, transparent, #7c3aed55, transparent)' }}></div>

      {/* Social */}
      <div>
        <p className='text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-semibold mb-3'>Connect With Us</p>
        <div className='flex gap-2 flex-wrap'>
          {[
            { label: 'Facebook', cls: 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border-violet-500/20' },
            { label: 'Instagram', cls: 'bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/20' },
            { label: 'Twitter', cls: 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/20' },
            { label: 'LinkedIn', cls: 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/20' },
          ].map((s, i) => (
            <button key={i}
              className={`text-xs font-bold px-4 py-2 rounded-xl border backdrop-blur-sm ${s.cls} transition-all duration-300 active:scale-95`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map placeholder */}
      <div className='backdrop-blur-sm border border-[var(--border)] rounded-2xl p-6 flex flex-col items-center justify-center text-center'
        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(99,102,241,0.15) 100%)' }}>
        <Map size={40} className='mb-2 text-violet-400' />
        <p className='font-bold text-[var(--foreground)] text-sm'>123 Health Street</p>
        <p className='text-[var(--muted-foreground)] text-xs mt-0.5'>Delhi, India</p>
        <button className='mt-3 text-xs font-semibold text-violet-400 hover:text-violet-300 hover:underline transition-colors'>
          View on Google Maps →
        </button>
      </div>
    </div>
  );
};

export default ContactInfo;
