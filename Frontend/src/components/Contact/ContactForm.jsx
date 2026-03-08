import React, { useState } from "react";

const ContactForm = () => {
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
  );
};

export default ContactForm;
