import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { gsap } from 'gsap';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { forgotPasswordAPI } from '../../api/api';

const ForgotPassword = () => {
  const shellRef = useRef(null);
  const navigate = useNavigate();

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // Email returned from backend
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI states
  const [stage, setStage] = useState(1); // Stage 1: Username, Stage 2: OTP, Stage 3: Password
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes
  const [resendCooldown, setResendCooldown] = useState(0); // Cooldown timer for resend

  // Timer for OTP expiry
  React.useEffect(() => {
    if (stage === 2 && otpTimer > 0) {
      const timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stage, otpTimer]);

  // Timer for resend cooldown
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.auth-card', { y: 24, opacity: 0, scale: 0.985 }, { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: 'power3.out' });
      gsap.fromTo('.auth-art', { x: 26, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' });
      gsap.fromTo('.auth-fade', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.52, stagger: 0.08, ease: 'power2.out', delay: 0.12 });
    }, shellRef);

    return () => ctx.revert();
  }, [stage]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await forgotPasswordAPI.sendOtp(username);
      // Store the email from the backend response (Axios wraps body in response.data)
      if (response.data && response.data.email) {
        setEmail(response.data.email);
      }
      toast.success('OTP sent to your registered email!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Bounce,
      });
      setStage(2);
      setOtpTimer(600);
    } catch (error) {
      toast.error(error.response?.data?.message || 'User not found or error sending OTP. Please check your username.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Bounce,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Bounce,
      });
      setIsLoading(false);
      return;
    }

    try {
      await forgotPasswordAPI.verifyOtp(email, otp);
      toast.success('OTP verified successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Bounce,
      });
      setStage(3);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Bounce,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await forgotPasswordAPI.resendOtp(username);
      toast.success('OTP resent to your registered email!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Bounce,
      });
      setOtpTimer(600); // Reset timer to 10 minutes
      setResendCooldown(600); // 10 minutes cooldown
      setOtp(''); // Clear OTP input
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error resending OTP', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Bounce,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Bounce,
      });
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Bounce,
      });
      setIsLoading(false);
      return;
    }

    try {
      await forgotPasswordAPI.resetPassword(email, newPassword, confirmPassword);
      toast.success('Password reset successfully! Redirecting to login...', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Bounce,
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error resetting password', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Bounce,
      });
    } finally {
      setIsLoading(false);
    }
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
          <p className="auth-fade">
            {stage === 1 && 'Enter your registered username and we will send you a One-Time Password (OTP).'}
            {stage === 2 && 'Enter the OTP sent to your registered email address to verify your account.'}
            {stage === 3 && 'Create a new secure password for your account.'}
          </p>
          <ul>
            <li className="auth-fade">✓ Secure verification flow</li>
            <li className="auth-fade">✓ OTP-based authentication</li>
            <li className="auth-fade">✓ Fast recovery support</li>
          </ul>
        </aside>

        <div className="auth-card">
          {/* Stage 1: Username Input */}
          {stage === 1 && (
            <>
              <h2 className="auth-fade">Forgot Password</h2>
              <p className="auth-sub auth-fade">Enter your registered username</p>

              <form onSubmit={handleSendOtp} className="auth-form">
                <label className="auth-field auth-fade">
                  <Mail size={16} />
                  <input
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </label>

                <button type="submit" className="auth-btn auth-fade" disabled={isLoading}>
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {/* Stage 2: OTP Verification */}
          {stage === 2 && (
            <>
              <h2 className="auth-fade">Verify OTP</h2>
              <p className="auth-sub auth-fade">
                Enter the 6-digit code sent to <strong>{email}</strong>
              </p>

              <form onSubmit={handleVerifyOtp} className="auth-form">
                <label className="auth-field auth-fade">
                  <KeyRound size={16} />
                  <input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    maxLength="6"
                    required
                  />
                </label>

                <div className="auth-fade" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  {otpTimer > 0 ? (
                    <p style={{ color: otpTimer < 120 ? '#ff6b6b' : '#666' }}>
                      OTP expires in: <strong>{formatTimer(otpTimer)}</strong>
                    </p>
                  ) : (
                    <p style={{ color: '#ff6b6b' }}>OTP has expired</p>
                  )}
                </div>

                <button type="submit" className="auth-btn auth-fade" disabled={isLoading || otpTimer <= 0}>
                  {isLoading ? 'Verifying OTP...' : 'Verify OTP'}
                </button>
              </form>

              <div className="auth-fade" style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendCooldown > 0 ? '#ccc' : '#0066cc',
                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                    fontSize: '0.95rem',
                  }}
                >
                  {resendCooldown > 0 
                    ? `Resend OTP in ${resendCooldown}s` 
                    : "Didn't receive OTP? Resend"}
                </button>
              </div>
            </>
          )}

          {/* Stage 3: Password Reset */}
          {stage === 3 && (
            <>
              <h2 className="auth-fade">Create New Password</h2>
              <p className="auth-sub auth-fade">Enter your new password below</p>

              <form onSubmit={handleResetPassword} className="auth-form">
                <label className="auth-field auth-fade">
                  <Lock size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      padding: '0 8px',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </label>

                <label className="auth-field auth-fade">
                  <Lock size={16} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      padding: '0 8px',
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </label>

                <button type="submit" className="auth-btn auth-fade" disabled={isLoading}>
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          <div className="auth-links auth-fade">
            <Link to="/login">Back to Sign In</Link>
            <Link to="/signup">Create account</Link>
          </div>
        </div>
      </section>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default ForgotPassword;
