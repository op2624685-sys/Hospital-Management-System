import React, { useLayoutEffect, useRef, useState } from 'react';
import API from '../../api/api';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { Eye, EyeOff, Lock, UserRound, Github } from 'lucide-react';
import { gsap } from 'gsap';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const shellRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.auth-card', { y: 26, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' });
      gsap.fromTo('.auth-art', { x: 28, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' });
      gsap.fromTo('.auth-fade', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: 'power2.out', delay: 0.12 });
    }, shellRef);

    return () => ctx.revert();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await API.post('/auth/login', { username, password });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('roles', JSON.stringify(response.data.roles));
        
        // Store additional user data if provided by backend, with fallback
        const loginData = {
          userId: response.data.userId,
          username: response.data.username || username,
          email: response.data.email || '',
          profilePhoto: response.data.profilePhoto || null,
          roles: response.data.roles || [],
        };
        
        login(loginData);

        toast.success('Login successful');
        const userRoles = response.data.roles || [];

        if (userRoles.includes('HEADADMIN')) {
          navigate('/head-admin');
        } else if (userRoles.includes('ADMIN')) {
          navigate('/admin');
        } else if (userRoles.includes('DOCTOR')) {
          navigate('/doctor/booked-details');
        } else if (userRoles.includes('PATIENT')) {
          navigate('/my-appointments');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={shellRef} className="auth-shell">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-bg-orb auth-bg-orb-3" />

      <section className="auth-layout">
        <aside className="auth-art">
          <span className="auth-chip auth-fade">Secure Access</span>
          <h1 className="auth-fade">Welcome to MediCore HMS</h1>
          <p className="auth-fade">Access patient records, appointments, departments, and admin operations in one secure platform.</p>
          <ul>
            <li className="auth-fade">Role-based access control</li>
            <li className="auth-fade">Enterprise-grade security</li>
            <li className="auth-fade">Real-time care operations</li>
          </ul>
        </aside>

        <div className="auth-card">
          <h2 className="auth-fade">Login</h2>
          <p className="auth-sub auth-fade">Use your hospital account to continue.</p>

          <form onSubmit={handleLogin} className="auth-form">
            <label className="auth-field auth-fade">
              <UserRound size={16} />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>

            <label className="auth-field auth-fade">
              <Lock size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="auth-icon-btn" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </label>

            <button type="submit" className="auth-btn auth-fade" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-divider auth-fade">
            <span>OR</span>
          </div>

          <div className="auth-social-grid">
            <button 
              className="auth-social-btn auth-fade" 
              onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'}/oauth2/authorization/google`}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button 
              className="auth-social-btn auth-fade" 
              onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'}/oauth2/authorization/github`}
            >
              <Github size={18} />
              GitHub
            </button>
          </div>

          <div className="auth-links auth-fade">
            <Link to="/login/forgotpassword">Forgot password?</Link>
            <Link to="/signup">Create account</Link>
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
        transition={Bounce}
      />
    </div>
  );
};

export default Login;
