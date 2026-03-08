import React from "react";
import Header from "../components/Header";
import ContactHero from "../components/Contact/ContactHero";
import ContactInfo from "../components/Contact/ContactInfo";
import ContactForm from "../components/Contact/ContactForm";

const Contact = () => {
  return (
    <div className='min-h-screen relative overflow-hidden'>

      {/* ── Floating Decorative Cards ── */}
      <div className='fixed top-32 left-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg -z-5 hidden xl:block'
        style={{ boxShadow: '0 4px 24px rgba(124,58,237,0.25)' }}>
        <p className='text-xs font-bold text-violet-300'>🟢 Online Support</p>
        <p className='text-xs text-gray-400 mt-0.5'>Available 24/7</p>
      </div>
      <div className='fixed bottom-32 left-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg -z-5 hidden xl:block'
        style={{ boxShadow: '0 4px 24px rgba(99,102,241,0.25)' }}>
        <p className='text-xs font-bold text-indigo-300'>⚡ Fast Response</p>
        <p className='text-xs text-gray-400 mt-0.5'>Within 24 hours</p>
      </div>
      <div className='fixed top-32 right-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg -z-5 hidden xl:block'
        style={{ boxShadow: '0 4px 24px rgba(168,85,247,0.20)' }}>
        <p className='text-xs font-bold text-purple-300'>🏥 DELTACARE</p>
        <p className='text-xs text-gray-400 mt-0.5'>Trusted by 10k+</p>
      </div>
      <div className='fixed bottom-32 right-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg -z-5 hidden xl:block'
        style={{ boxShadow: '0 4px 24px rgba(6,182,212,0.20)' }}>
        <p className='text-xs font-bold text-cyan-300'>⭐ 4.9 Rating</p>
        <p className='text-xs text-gray-400 mt-0.5'>10k+ reviews</p>
      </div>

      <Header />

      {/* ── Main Content ── */}
      <div className='min-h-screen flex flex-col items-center justify-center px-6 py-24 lg:py-32'>
        
        <ContactHero />

        {/* ── Cards Row ── */}
        <div className='w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <ContactInfo />
          <ContactForm />
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