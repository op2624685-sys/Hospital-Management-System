import React from "react";

const GlobalBackground = () => {
  return (
    <>
      {/* ── Full Page Background ── */}
      <div className='fixed inset-0 -z-30'
        style={{
          background: 'radial-gradient(circle at 10% 20%, color-mix(in srgb, var(--secondary) 15%, transparent), transparent 40%), radial-gradient(circle at 90% 80%, color-mix(in srgb, var(--chart-4) 15%, transparent), transparent 40%), var(--background)'
        }}>
      </div>

      {/* ── Subtle grid overlay ── */}
      <div className='fixed inset-0 -z-20 opacity-[0.035] pointer-events-none'
        style={{
          backgroundImage: 'linear-gradient(color-mix(in srgb, var(--primary) 40%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--primary) 40%, transparent) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}>
      </div>

      {/* ── Floating Background Blobs ── */}
      <div className='fixed -top-24 -left-24 w-140 h-140 rounded-full blur-3xl opacity-40 -z-20 animate-pulse pointer-events-none'
        style={{ background: 'radial-gradient(circle, var(--secondary) 0%, var(--chart-4) 55%, transparent 100%)' }}></div>
      
      <div className='fixed -bottom-20 -right-20 w-130 h-130 rounded-full blur-3xl opacity-35 -z-20 animate-pulse pointer-events-none'
        style={{ background: 'radial-gradient(circle, var(--chart-4) 0%, var(--chart-2) 60%, transparent 100%)', animationDelay: '1.5s' }}></div>
      
      <div className='fixed top-1/3 left-1/3 w-100 h-100 rounded-full blur-3xl opacity-25 -z-20 pointer-events-none'
        style={{ background: 'radial-gradient(circle, var(--secondary) 0%, var(--chart-4) 50%, transparent 100%)' }}></div>
      
      <div className='fixed top-0 right-1/4 w-75 h-75 rounded-full blur-2xl opacity-30 -z-20 animate-pulse pointer-events-none'
        style={{ background: 'radial-gradient(circle, var(--chart-4) 0%, var(--chart-2) 60%, transparent 100%)', animationDelay: '2s' }}></div>
      
      <div className='fixed bottom-1/4 -left-10 w-85 h-85 rounded-full blur-3xl opacity-30 -z-20 animate-pulse pointer-events-none'
        style={{ background: 'radial-gradient(circle, var(--background) 0%, var(--secondary) 60%, transparent 100%)', animationDelay: '0.8s' }}></div>
      
      <div className='fixed top-1/2 -right-10 w-70 h-70 rounded-full blur-2xl opacity-25 -z-20 pointer-events-none'
        style={{ background: 'radial-gradient(circle, var(--chart-4) 0%, var(--chart-1) 55%, transparent 100%)' }}></div>
    </>
  );
};

export default GlobalBackground;
