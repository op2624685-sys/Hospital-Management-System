import React from "react";

const GlobalBackground = () => {
  return (
    <>
      {/* ── Full Page Background ── */}
      <div className='fixed inset-0 -z-30'
        style={{
          background: 'linear-gradient(160deg, #0f0c29 0%, #1a1040 20%, #24243e 45%, #1e1b4b 65%, #2d1b69 80%, #11071f 100%)'
        }}>
      </div>

      {/* ── Subtle grid overlay ── */}
      <div className='fixed inset-0 -z-20 opacity-[0.04] pointer-events-none'
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}>
      </div>

      {/* ── Floating Background Blobs ── */}
      <div className='fixed -top-24 -left-24 w-140 h-140 rounded-full blur-3xl opacity-50 -z-20 animate-pulse pointer-events-none'
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, #4c1d95 55%, transparent 100%)' }}></div>
      
      <div className='fixed -bottom-20 -right-20 w-130 h-130 rounded-full blur-3xl opacity-45 -z-20 animate-pulse pointer-events-none'
        style={{ background: 'radial-gradient(circle, #6366f1 0%, #312e81 60%, transparent 100%)', animationDelay: '1.5s' }}></div>
      
      <div className='fixed top-1/3 left-1/3 w-100 h-100 rounded-full blur-3xl opacity-35 -z-20 pointer-events-none'
        style={{ background: 'radial-gradient(circle, #a855f7 0%, #7e22ce 50%, transparent 100%)' }}></div>
      
      <div className='fixed top-0 right-1/4 w-75 h-75 rounded-full blur-2xl opacity-40 -z-20 animate-pulse pointer-events-none'
        style={{ background: 'radial-gradient(circle, #06b6d4 0%, #0e7490 60%, transparent 100%)', animationDelay: '2s' }}></div>
      
      <div className='fixed bottom-1/4 -left-10 w-85 h-85 rounded-full blur-3xl opacity-40 -z-20 animate-pulse pointer-events-none'
        style={{ background: 'radial-gradient(circle, #e879f9 0%, #a21caf 60%, transparent 100%)', animationDelay: '0.8s' }}></div>
      
      <div className='fixed top-1/2 -right-10 w-70 h-70 rounded-full blur-2xl opacity-35 -z-20 pointer-events-none'
        style={{ background: 'radial-gradient(circle, #f472b6 0%, #9d174d 55%, transparent 100%)' }}></div>
    </>
  );
};

export default GlobalBackground;
