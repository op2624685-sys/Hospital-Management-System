import React from "react";

const GlobalBackground = () => {
  return (
    <>
      {/* ── Full Page Background ── */}
      <div className='fixed inset-0 -z-30'
        style={{
          background: 'linear-gradient(160deg, #fdf8f5 0%, #fff4ea 20%, #ffeedd 45%, #fff8f2 65%, #fdf5ec 80%, #f9f5f1 100%)'
        }}>
      </div>

      {/* ── Subtle grid overlay ── */}
      <div className='fixed inset-0 -z-20 opacity-[0.035] pointer-events-none'
        style={{
          backgroundImage: 'linear-gradient(rgba(100,74,64,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(100,74,64,0.4) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}>
      </div>

      {/* ── Floating Background Blobs ── */}
      <div className='fixed -top-24 -left-24 w-140 h-140 rounded-full blur-3xl opacity-40 -z-20 animate-pulse pointer-events-none'
        style={{ background: 'radial-gradient(circle, #ffdfb5 0%, #ffe0c2 55%, transparent 100%)' }}></div>
      
      <div className='fixed -bottom-20 -right-20 w-130 h-130 rounded-full blur-3xl opacity-35 -z-20 animate-pulse pointer-events-none'
        style={{ background: 'radial-gradient(circle, #ffe6c4 0%, #ffdab0 60%, transparent 100%)', animationDelay: '1.5s' }}></div>
      
      <div className='fixed top-1/3 left-1/3 w-100 h-100 rounded-full blur-3xl opacity-25 -z-20 pointer-events-none'
        style={{ background: 'radial-gradient(circle, #ffdfb5 0%, #ffe6c4 50%, transparent 100%)' }}></div>
      
      <div className='fixed top-0 right-1/4 w-75 h-75 rounded-full blur-2xl opacity-30 -z-20 animate-pulse pointer-events-none'
        style={{ background: 'radial-gradient(circle, #ffe0c2 0%, #ffd4a8 60%, transparent 100%)', animationDelay: '2s' }}></div>
      
      <div className='fixed bottom-1/4 -left-10 w-85 h-85 rounded-full blur-3xl opacity-30 -z-20 animate-pulse pointer-events-none'
        style={{ background: 'radial-gradient(circle, #ffecd8 0%, #ffdfb5 60%, transparent 100%)', animationDelay: '0.8s' }}></div>
      
      <div className='fixed top-1/2 -right-10 w-70 h-70 rounded-full blur-2xl opacity-25 -z-20 pointer-events-none'
        style={{ background: 'radial-gradient(circle, #ffe6c4 0%, #ffd4a8 55%, transparent 100%)' }}></div>
    </>
  );
};

export default GlobalBackground;
