import React, { useState, useEffect } from "react";
import emailjs from '@emailjs/browser';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const ContactForm = () => {
  const { isLoggedIn, user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Auto-fill logged-in user data
  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || (user.firstName ? `${user.firstName} ${user.lastName || ''}` : prev.name),
        email: user.email || prev.email
      }));
    }
  }, [isLoggedIn, user]);

  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      // Background email sending using EmailJS
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,    
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,   
        {
          from_name: formData.name,
          reply_to: formData.email,
          phone_number: formData.phone || "Not provided",
          message: formData.message,
          to_name: user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : "Admin")
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY     
      );

      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
      
      setTimeout(() => {
        setSubmitted(false);
      }, 4000);
    } catch (error) {
      console.error('Email sending failed:', error);
      alert('Failed to send the message. Please make sure your EmailJS keys are inserted in the code.');
    } finally {
      setIsSending(false);
    }
  };

  const inputClass = (field) => `
    w-full pl-11 pr-4 py-3 bg-[var(--background)] border text-[var(--foreground)] rounded-xl text-sm transition-all duration-300
    focus:outline-none focus:ring-1 focus:ring-[var(--primary)] placeholder-[var(--muted-foreground)] opacity-80 focus:opacity-100
    ${focused === field
      ? 'border-[var(--primary)] shadow-sm'
      : 'border-[var(--border)]'
    }
  `;

  return (
    <div className='bg-[var(--card)] backdrop-blur-xl border border-[var(--border)] rounded-3xl overflow-hidden shadow-xl'>

      {/* Form Header */}
      <div className='px-8 py-6'
        style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--chart-5) 100%)' }}>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'>
            <span className='text-white text-lg'>✉️</span>
          </div>
          <div>
            <h3 className='text-white font-black text-lg'>Send a Message</h3>
            <p className='text-white/80 text-xs'>We reply within 24 hours</p>
          </div>
        </div>
      </div>

      <div className='p-8'>
        {!isLoggedIn ? (
          // ── Login Required State ──
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner' style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)' }}>
              <span className='text-3xl'>🔒</span>
            </div>
            <h3 className='text-xl font-black text-[var(--foreground)] mb-2'>Login Required</h3>
            <p className='text-[var(--muted-foreground)] text-sm max-w-xs mb-6'>
              You must be logged in to your account to send us a secure message.
            </p>
            <Link to="/login"
              className='group relative overflow-hidden font-bold py-3 px-8 rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 text-sm flex items-center justify-center gap-2 shadow-md'
              style={{ background: 'var(--primary)', color: 'white' }}>
              <span className='absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300'
                style={{ background: 'linear-gradient(135deg, var(--chart-5), var(--primary))' }}></span>
              <span className='relative z-10'>Sign In Now</span>
            </Link>
          </div>
        ) : submitted ? (
          // ── Success State ──
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <div className='w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner' style={{ background: 'color-mix(in srgb, var(--primary) 20%, transparent)' }}>
              <svg className='w-8 h-8' style={{ color: 'var(--primary)' }} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M5 13l4 4L19 7' />
              </svg>
            </div>
            <h3 className='text-xl font-black text-[var(--foreground)] mb-2'>Message Sent! 🎉</h3>
            <p className='text-[var(--muted-foreground)] text-sm max-w-xs'>
              Thank you for reaching out. We'll get back to you as soon as possible.
            </p>
          </div>
        ) : (
          // ── Form ──
          <form onSubmit={handleSubmit} className='flex flex-col gap-5'>

            {/* Name */}
            <div>
              <label className='block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2'>
                Full Name
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
                  <svg className='w-4 h-4 text-[var(--muted-foreground)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
              <label className='block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2'>
                Email Address
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
                  <svg className='w-4 h-4 text-[var(--muted-foreground)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
              <label className='block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2'>
                Phone <span className='opacity-60 normal-case font-normal'>(optional)</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
                  <svg className='w-4 h-4 text-[var(--muted-foreground)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
              <label className='block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2'>
                Message
              </label>
              <div className='relative'>
                <div className='absolute top-3 left-3 pointer-events-none'>
                  <svg className='w-4 h-4 text-[var(--muted-foreground)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
              disabled={isSending}
              className='group relative overflow-hidden w-full font-bold py-3.5 rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-wait'
              style={{ background: 'var(--foreground)' }}>
              {!isSending && (
                <span className='absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300'
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--chart-5))' }}></span>
              )}
              {isSending ? (
                <svg className='animate-spin w-5 h-5 text-[var(--background)]' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className='relative z-10 w-4 h-4 text-[var(--background)] group-hover:text-white transition-colors duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
                </svg>
              )}
              <span className={`relative z-10 text-[var(--background)] ${!isSending && 'group-hover:text-white'} transition-colors duration-300`}>
                {isSending ? 'Sending...' : 'Send Message'}
              </span>
            </button>

          </form>
        )}
      </div>
    </div>
  );
};

export default ContactForm;
