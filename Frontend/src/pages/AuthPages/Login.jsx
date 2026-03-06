import React, { useLayoutEffect, useRef, useState } from 'react';
import API from '../../api/api';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { Eye, EyeOff, Lock, UserRound } from 'lucide-react';
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
        login(response.data);

        toast.success('Login successful');
        const userRoles = response.data.roles || [];

        if (userRoles.includes('HEADADMIN') || userRoles.includes('ADMIN')) {
          navigate('/admin');
        } else if (userRoles.includes('DOCTOR')) {
          navigate('/doctor/appointments');
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
