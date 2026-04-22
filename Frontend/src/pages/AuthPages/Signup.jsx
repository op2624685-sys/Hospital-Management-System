import React, { useLayoutEffect, useRef, useState } from 'react';
import { signupAPI } from '../../api/api';
import { Link } from 'react-router-dom';
import { Mail, Sparkles, ShieldCheck, Clock3, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast, Zoom } from 'react-toastify';

const Signup = () => {
  const shellRef = useRef(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState('');

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.auth-card', { y: 24, opacity: 0, scale: 0.985 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' });
      gsap.fromTo('.auth-art', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' });
      gsap.fromTo('.auth-fade', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out', delay: 0.14 });
    }, shellRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await signupAPI.requestMagicLink(email);
      setSentTo(response.data.email || email);
      toast.success(response.data.message || 'Magic link sent');
      setEmail('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not send magic link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={shellRef} className="auth-shell">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-bg-orb auth-bg-orb-4" />

      <section className="auth-layout auth-layout-signup">
        <aside className="auth-art">
          <span className="auth-chip auth-fade">Magic Link Signup</span>
          <h1 className="auth-fade">Start with your email, finish with one secure link</h1>
          <p className="auth-fade">
            We will send a short-lived link to your inbox. Open it to complete your HMS account setup.
          </p>
          <ul>
            <li className="auth-fade">Email-first onboarding</li>
            <li className="auth-fade">Single-use signup link</li>
            <li className="auth-fade">No password form on this screen</li>
          </ul>
        </aside>

        <div className="auth-card auth-card-wide">
          <h2 className="auth-fade">Request Magic Link</h2>
          <p className="auth-sub auth-fade">Enter the email address you want to use for your HMS account.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-field auth-fade auth-field-full">
              <Mail size={16} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <div className="auth-fade" style={{ display: 'grid', gap: '0.85rem', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <ShieldCheck size={16} style={{ marginTop: '2px', color: 'var(--primary)' }} />
                <p className="auth-sub" style={{ margin: 0 }}>
                  The link expires after 15 minutes and can only be used once.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Clock3 size={16} style={{ marginTop: '2px', color: 'var(--primary)' }} />
                <p className="auth-sub" style={{ margin: 0 }}>
                  After verification, you will complete your profile and set your login password.
                </p>
              </div>
            </div>

            {error && <p className="auth-error auth-field-full">{error}</p>}
            {sentTo && (
              <p className="auth-success auth-field-full">
                Magic link sent to <strong>{sentTo}</strong>. Check your inbox to continue.
              </p>
            )}

            <button type="submit" className="auth-btn auth-field-full auth-fade" disabled={isSubmitting}>
              {isSubmitting ? 'Sending link...' : 'Send Magic Link'}
            </button>
          </form>

          <div className="auth-links auth-fade">
            <Link to="/login">Already have an account? Sign In</Link>
          </div>
        </div>
      </section>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Zoom}
      />
    </div>
  );
};

export default Signup;
