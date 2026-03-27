import React from 'react';
import { Activity } from 'lucide-react';

const LOADER_CSS = `
  @keyframes pl-spin-cw  { to { transform: rotate(360deg); } }
  @keyframes pl-spin-ccw { to { transform: rotate(-360deg); } }
  @keyframes pl-pulse     {
    0%,100% { opacity: 1; transform: scale(1); }
    50%      { opacity: .5; transform: scale(.88); }
  }
  @keyframes pl-fadein {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .pl-wrap {
    animation: pl-fadein .35s ease both;
  }
  .pl-text {
    animation: pl-pulse 1.8s ease-in-out infinite;
  }
`;

/**
 * PageLoader
 *
 * Props:
 *  - message  {string}  — optional text below spinner (default: "Loading…")
 *  - fullPage {boolean} — fills entire viewport (default: true)
 *  - size     {"sm"|"md"|"lg"} — spinner size (default: "md")
 *  - bg       {string}  — background CSS value (default: gradient)
 */
const PageLoader = ({
    message  = 'Loading…',
    fullPage = true,
    size     = 'md',
    bg       = 'linear-gradient(145deg,#eef2ff 0%,#f0f9ff 40%,#f0fdf4 80%,#faf5ff 100%)',
}) => {
    const dim = { sm: 48, md: 72, lg: 96 }[size] ?? 72;
    const iconSize = { sm: 14, md: 20, lg: 28 }[size] ?? 20;
    const borderW  = { sm: 3,  md: 4,  lg: 5  }[size] ?? 4;
    const innerPad = { sm: 7,  md: 10, lg: 13 }[size] ?? 10;

    return (
        <>
            <style>{LOADER_CSS}</style>

            <div style={{
                display:         'flex',
                flexDirection:   'column',
                alignItems:      'center',
                justifyContent:  'center',
                gap:             20,
                background:      bg,
                ...(fullPage
                    ? { position: 'fixed', inset: 0, zIndex: 9999 }
                    : { width: '100%', minHeight: 240, borderRadius: 24 }),
            }}>
                <div className="pl-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

                    {/* Spinner */}
                    <div style={{ position: 'relative', width: dim, height: dim }}>

                        {/* Track ring */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            borderRadius: '50%',
                            border: `${borderW}px solid #dbeafe`,
                        }} />

                        {/* Outer spinning ring — blue */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            borderRadius: '50%',
                            border: `${borderW}px solid transparent`,
                            borderTopColor: '#2563eb',
                            animation: 'pl-spin-cw .9s linear infinite',
                        }} />

                        {/* Inner spinning ring — indigo, reverse */}
                        <div style={{
                            position: 'absolute',
                            inset: innerPad,
                            borderRadius: '50%',
                            border: `${borderW - 1}px solid transparent`,
                            borderTopColor: '#818cf8',
                            animation: 'pl-spin-ccw 1.3s linear infinite',
                        }} />

                        {/* Center icon */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Activity size={iconSize} style={{ color: '#2563eb' }} />
                        </div>
                    </div>

                    {/* Message */}
                    {message && (
                        <p className="pl-text" style={{
                            margin: 0,
                            fontSize: { sm: 12, md: 14, lg: 16 }[size] ?? 14,
                            fontWeight: 600,
                            color: '#64748b',
                            letterSpacing: '0.04em',
                            fontFamily: 'inherit',
                        }}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

export default PageLoader;