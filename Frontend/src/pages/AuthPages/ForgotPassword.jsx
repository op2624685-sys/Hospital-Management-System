import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck } from 'lucide-react';
import { gsap } from 'gsap';

const ForgotPassword = () => {
  const shellRef = useRef(null);
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.auth-card', { y: 24, opacity: 0, scale: 0.985 }, { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: 'power3.out' });
      gsap.fromTo('.auth-art', { x: 26, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' });
      gsap.fromTo('.auth-fade', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.52, stagger: 0.08, ease: 'power2.out', delay: 0.12 });
    }, shellRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSent(true);
    setIsSending(false);
  };

  return (
    <div ref={shellRef} className="auth-shell">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-3" />
      <div className="auth-bg-orb auth-bg-orb-4" />

      <section className="auth-layout">
        <aside className="auth-art">
          <span className="auth-chip auth-fade">Account Recovery</span>
          <h1 className="auth-fade">Reset Your Password Safely</h1>
          <p className="auth-fade">Enter your registered email and we will send instructions to reset your password securely.</p>
          <ul>
            <li className="auth-fade">Secure verification flow</li>
            <li className="auth-fade">One-time reset guidance</li>
            <li className="auth-fade">Fast recovery support</li>
          </ul>
        </aside>

        <div className="auth-card">
          <h2 className="auth-fade">Forgot Password</h2>
          <p className="auth-sub auth-fade">Use your registered email address.</p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="auth-form">
              <label className="auth-field auth-fade">
                <Mail size={16} />
                <input
                  type="email"
                  placeholder="you@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <button type="submit" className="auth-btn auth-fade" disabled={isSending}>
                {isSending ? 'Sending reset link...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="auth-success auth-fade">
              <ShieldCheck size={18} />
              Reset instructions were sent to <strong>{email}</strong>
            </div>
          )}

          <div className="auth-links auth-fade">
            <Link to="/login">Back to Sign In</Link>
            <Link to="/signup">Create account</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;
