import React, { useState, } from "react";
import Header from "../components/Header";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", phone: "", message: "" });
    }, 3000);
  };

  const inputClass = (field) => `
    w-full pl-11 pr-4 py-3 bg-white/10 border rounded-xl text-sm text-gray-200
    focus:outline-none focus:bg-white/15 transition-all duration-300 placeholder-gray-500
    ${focused === field
      ? 'border-violet-400 shadow-sm shadow-violet-500/20'
      : 'border-white/20'
    }
  `;

  return (
    <div className='min-h-screen relative overflow-hidden'>

      {/* ── Full Page Background ── */}
      <div className='fixed inset-0 -z-10'
        style={{
          background: 'linear-gradient(160deg, #0f0c29 0%, #1a1040 20%, #24243e 45%, #1e1b4b 65%, #2d1b69 80%, #11071f 100%)'
        }}>
      </div>

      {/* ── Subtle grid overlay ── */}
      <div className='fixed inset-0 -z-10 opacity-[0.04]'
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}>
      </div>

      {/* ── Floating Background Blobs ── */}
      {/* Top-left vivid violet */}
      <div className='fixed -top-24 -left-24 w-140 h-140 rounded-full blur-3xl opacity-50 -z-10 animate-pulse'
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, #4c1d95 55%, transparent 100%)' }}></div>

      {/* Bottom-right electric indigo */}
      <div className='fixed -bottom-20 -right-20 w-130 h-130 rounded-full blur-3xl opacity-45 -z-10 animate-pulse'
        style={{ background: 'radial-gradient(circle, #6366f1 0%, #312e81 60%, transparent 100%)', animationDelay: '1.5s' }}></div>

      {/* Center magenta burst */}
      <div className='fixed top-1/3 left-1/3 w-100 h-100 rounded-full blur-3xl opacity-35 -z-10'
        style={{ background: 'radial-gradient(circle, #a855f7 0%, #7e22ce 50%, transparent 100%)' }}></div>

      {/* Top-right cyan-teal accent */}
      <div className='fixed top-0 right-1/4 w-75 h-75 rounded-full blur-2xl opacity-40 -z-10 animate-pulse'
        style={{ background: 'radial-gradient(circle, #06b6d4 0%, #0e7490 60%, transparent 100%)', animationDelay: '2s' }}></div>

      {/* Bottom-left pink-fuchsia */}
      <div className='fixed bottom-1/4 -left-10 w-85 h-85 rounded-full blur-3xl opacity-40 -z-10 animate-pulse'
        style={{ background: 'radial-gradient(circle, #e879f9 0%, #a21caf 60%, transparent 100%)', animationDelay: '0.8s' }}></div>

      {/* Mid-right deep rose */}
      <div className='fixed top-1/2 -right-10 w-70 h-70 rounded-full blur-2xl opacity-35 -z-10'
        style={{ background: 'radial-gradient(circle, #f472b6 0%, #9d174d 55%, transparent 100%)' }}></div>

      {/* ── Floating Decorative Cards ── */}
      {/* Top left mini card */}
      <div className='fixed top-32 left-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg -z-5 hidden xl:block'
        style={{ boxShadow: '0 4px 24px rgba(124,58,237,0.25)' }}>
        <p className='text-xs font-bold text-violet-300'>🟢 Online Support</p>
        <p className='text-xs text-gray-400 mt-0.5'>Available 24/7</p>
      </div>

      {/* Bottom left mini card */}
      <div className='fixed bottom-32 left-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg -z-5 hidden xl:block'
        style={{ boxShadow: '0 4px 24px rgba(99,102,241,0.25)' }}>
        <p className='text-xs font-bold text-indigo-300'>⚡ Fast Response</p>
        <p className='text-xs text-gray-400 mt-0.5'>Within 24 hours</p>
      </div>

      {/* Top right mini card */}
      <div className='fixed top-32 right-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg -z-5 hidden xl:block'
        style={{ boxShadow: '0 4px 24px rgba(168,85,247,0.20)' }}>
        <p className='text-xs font-bold text-purple-300'>🏥 DELTACARE</p>
        <p className='text-xs text-gray-400 mt-0.5'>Trusted by 10k+</p>
      </div>

      {/* Bottom right mini card */}
      <div className='fixed bottom-32 right-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg -z-5 hidden xl:block'
        style={{ boxShadow: '0 4px 24px rgba(6,182,212,0.20)' }}>
        <p className='text-xs font-bold text-cyan-300'>⭐ 4.9 Rating</p>
        <p className='text-xs text-gray-400 mt-0.5'>10k+ reviews</p>
      </div>

      <Header />

      {/* ── Main Content ── */}
      <div className='min-h-screen flex flex-col items-center justify-center px-6 py-32'>

        {/* ── Page Title ── */}
        <div className='text-center mb-14'>
          <span className='inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-violet-400/30 text-violet-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-5'>
            <span className='w-2 h-2 bg-violet-400 rounded-full animate-pulse'></span>
            We're Here For You
          </span>
          <h1 className='text-7xl font-black text-white leading-none mb-4'>
            Let{' '}
            <span className='text-transparent bg-clip-text'
              style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #06b6d4)' }}>
              Us Help
            </span>
          </h1>
          <p className='text-gray-400 text-lg max-w-lg mx-auto leading-relaxed'>
            Our dedicated team is ready to assist you with
            appointments, queries, or any medical emergency.
          </p>
        </div>

        {/* ── Emergency Banner ── */}
        <div className='w-full max-w-4xl mb-10'>
          <div className='bg-white/10 backdrop-blur-md border border-red-400/20 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-lg'>
                🚨
              </div>
              <div>
                <p className='font-bold text-white text-sm'>Medical Emergency?</p>
                <p className='text-xs text-gray-400'>Don't wait — our emergency team is on standby</p>
              </div>
            </div>
            <a href="tel:+919876543210"
              className='flex items-center gap-2 bg-red-500 text-white font-bold py-2.5 px-5 rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 text-sm shadow-md shadow-red-200'>
              📞 Call Now
            </a>
          </div>
        </div>

        {/* ── Cards Row ── */}
        <div className='w-full max-w-4xl grid grid-cols-2 gap-8'>

          {/* ── Left — Contact Info Glassmorphism Card ── */}
          <div className='bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 flex flex-col gap-6'
            style={{ boxShadow: '0 20px 60px rgba(124,58,237,0.20), 0 4px 16px rgba(99,102,241,0.15)' }}>

            <div>
              <h2 className='text-2xl font-black text-white mb-1'>
                Contact <span style={{ color: '#a78bfa' }}>Info</span>
              </h2>
              <p className='text-gray-400 text-sm'>Multiple ways to reach us</p>
            </div>

            {/* Info Items */}
            <div className='flex flex-col gap-4'>
              {[
                { icon: '📍', label: 'Address', value: '123 Health Street, Delhi, India', color: 'text-violet-400', bg: 'bg-violet-500/10' },
                { icon: '📞', label: 'Phone', value: '+91 98765 43210', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { icon: '📧', label: 'Email', value: 'info@deltacare.com', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { icon: '🕒', label: 'Hours', value: 'Open 24/7', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
              ].map((item, i) => (
                <div key={i}
                  className={`flex items-center gap-4 ${item.bg} backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300`}>
                  <div className='w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-lg shadow-sm shrink-0'>
                    {item.icon}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${item.color} uppercase tracking-wider`}>{item.label}</p>
                    <p className='text-sm font-semibold text-gray-200 mt-0.5'>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className='h-px'
              style={{ background: 'linear-gradient(to right, transparent, #7c3aed55, transparent)' }}></div>

            {/* Social */}
            <div>
              <p className='text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3'>Connect With Us</p>
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
            <div className='backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center'
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(99,102,241,0.15) 100%)' }}>
              <span className='text-4xl mb-2'>🗺️</span>
              <p className='font-bold text-gray-200 text-sm'>123 Health Street</p>
              <p className='text-gray-500 text-xs mt-0.5'>Delhi, India</p>
              <button className='mt-3 text-xs font-semibold text-violet-400 hover:text-violet-300 hover:underline transition-colors'>
                View on Google Maps →
              </button>
            </div>
          </div>

          {/* ── Right — Form Glassmorphism Card ── */}
          <div className='bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden'
            style={{ boxShadow: '0 20px 60px rgba(99,102,241,0.20), 0 4px 16px rgba(6,182,212,0.12)' }}>

            {/* Form Header */}
            <div className='px-8 py-6'
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)' }}>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'>
                  <span className='text-white text-lg'>✉️</span>
                </div>
                <div>
                  <h3 className='text-white font-black text-lg'>Send a Message</h3>
                  <p className='text-violet-100 text-xs'>We reply within 24 hours</p>
                </div>
              </div>
            </div>

            <div className='p-8'>
              {submitted ? (
                // ── Success State ──
                <div className='flex flex-col items-center justify-center py-16 text-center'>
                  <div className='w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mb-4 shadow-inner'>
                    <svg className='w-8 h-8 text-violet-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M5 13l4 4L19 7' />
                    </svg>
                  </div>
                  <h3 className='text-xl font-black text-white mb-2'>Message Sent! 🎉</h3>
                  <p className='text-gray-400 text-sm max-w-xs'>
                    Thank you for reaching out. We'll get back to you as soon as possible.
                  </p>
                </div>
              ) : (
                // ── Form ──
                <form onSubmit={handleSubmit} className='flex flex-col gap-5'>

                  {/* Name */}
                  <div>
                    <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>
                      Full Name
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                        </svg>
                      </div>
                      <input type="text" name="name" placeholder="John Doe"
                        value={formData.name} onChange={handleChange}
                        onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                        className={inputClass('name')} required />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>
                      Email Address
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                            d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                        </svg>
                      </div>
                      <input type="email" name="email" placeholder="john@example.com"
                        value={formData.email} onChange={handleChange}
                        onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                        className={inputClass('email')} required />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>
                      Phone <span className='text-gray-300 normal-case font-normal'>(optional)</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                            d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                        </svg>
                      </div>
                      <input type="text" name="phone" placeholder="+91 98765 43210"
                        value={formData.phone} onChange={handleChange}
                        onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                        className={inputClass('phone')} />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>
                      Message
                    </label>
                    <div className='relative'>
                      <div className='absolute top-3 left-3 pointer-events-none'>
                        <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                            d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' />
                        </svg>
                      </div>
                      <textarea name="message" placeholder="How can we help you today?"
                        value={formData.message} onChange={handleChange}
                        onFocus={() => setFocused('message')} onBlur={() => setFocused(null)}
                        rows={4} className={`${inputClass('message')} pl-11 resize-none`} required />
                    </div>
                  </div>

                  {/* Submit */}
                  <button type="submit"
                    className='group relative overflow-hidden w-full text-white font-bold py-3.5 rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 text-sm flex items-center justify-center gap-2'
                    style={{ background: '#1f2937', boxShadow: '0 8px 24px rgba(124,58,237,0.30)' }}>
                    <span className='absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300'
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}></span>
                    <svg className='relative z-10 w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                        d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
                    </svg>
                    <span className='relative z-10'>Send Message</span>
                  </button>

                </form>
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className='text-center text-xs text-gray-600 mt-12'>
          © 2026 DELTACARE Hospital · All rights reserved
        </p>
      </div>
    </div>
  );
};

export default Contact;