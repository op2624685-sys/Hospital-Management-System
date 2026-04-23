import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { signupAPI } from '../../api/api';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, UserRound } from 'lucide-react';
import { gsap } from 'gsap';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast, Zoom } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const SignupComplete = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shellRef = useRef(null);
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(false);
  const [requiresCredentials, setRequiresCredentials] = useState(false);
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.auth-card', { y: 24, opacity: 0, scale: 0.985 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' });
      gsap.fromTo('.auth-art', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' });
      gsap.fromTo('.auth-fade', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out', delay: 0.14 });
    }, shellRef);

    return () => ctx.revert();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!token) {
      setRequiresCredentials(false);
      setIsCheckingLink(false);
      return;
    }

    let isActive = true;

    const tryTokenOnlyCompletion = async () => {
      setError('');
      setIsCheckingLink(true);
      try {
        const response = await signupAPI.completeMagicLinkSignup({ token });
        if (!isActive) return;

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userId', response.data.userId);
          localStorage.setItem('roles', JSON.stringify(response.data.roles || []));
          localStorage.setItem('username', response.data.username || '');
          localStorage.setItem('email', response.data.email || '');

          login({
            userId: response.data.userId,
            username: response.data.username || '',
            email: response.data.email || '',
            profilePhoto: response.data.profilePhoto || null,
            roles: response.data.roles || [],
          });

          toast.success('Signed in successfully!');
          navigate('/');
          return;
        }

        setRequiresCredentials(true);
      } catch (err) {
        if (!isActive) return;
        const message = err?.response?.data?.message || 'Could not complete signup. The link may be expired.';
        if (message.includes('required for new signup')) {
          setRequiresCredentials(true);
          setError('');
        } else {
          setRequiresCredentials(false);
          setError(message);
        }
      } finally {
        if (isActive) setIsCheckingLink(false);
      }
    };

    tryTokenOnlyCompletion();

    return () => {
      isActive = false;
    };
  }, [token, login, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing signup token. Please request a new magic link.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await signupAPI.completeMagicLinkSignup({
        token,
        ...formData,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('roles', JSON.stringify(response.data.roles));
        localStorage.setItem('username', response.data.username || formData.username);
        localStorage.setItem('email', response.data.email || '');

        login({
          userId: response.data.userId,
          username: response.data.username || formData.username,
          email: response.data.email || '',
          profilePhoto: response.data.profilePhoto || null,
          roles: response.data.roles || [],
        });

        toast.success('Account created successfully!');
        navigate('/');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not complete signup. The link may be expired.');
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
          <span className="auth-chip auth-fade">Complete Signup</span>
          <h1 className="auth-fade">Finish creating your hospital account</h1>
          <p className="auth-fade">The email link verified ownership. Set your account credentials, then complete patient registration.</p>
          <ul>
            <li className="auth-fade">Verified by email</li>
            <li className="auth-fade">Account credentials are created here</li>
            <li className="auth-fade">Patient details are added on the next screen</li>
          </ul>
        </aside>

        <div className="auth-card auth-card-wide">
          <h2 className="auth-fade">Create Account</h2>
          <p className="auth-sub auth-fade">
            {!token
              ? 'No signup token found.'
              : isCheckingLink
              ? 'Verifying your link...'
              : requiresCredentials
              ? 'Choose your username and password.'
              : 'Completing signup...'}
          </p>

          {requiresCredentials && (
            <form onSubmit={handleSubmit} className="auth-form">
              <label className="auth-field auth-fade">
                <UserRound size={16} />
                <input type="text" placeholder="Username" name="username" value={formData.username} onChange={handleInputChange} required disabled={!token} />
              </label>

              <label className="auth-field auth-fade">
                <Lock size={16} />
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" name="password" value={formData.password} onChange={handleInputChange} minLength={6} required disabled={!token} />
                <button type="button" className="auth-icon-btn" onClick={() => setShowPassword((v) => !v)} disabled={!token}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </label>

              {error && <p className="auth-error auth-field-full">{error}</p>}

              <button type="submit" className="auth-btn auth-field-full auth-fade" disabled={!token || isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {!requiresCredentials && error && <p className="auth-error auth-field-full">{error}</p>}

          <div className="auth-links auth-fade">
            <Link to="/signup">Request a new magic link</Link>
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

export default SignupComplete;
