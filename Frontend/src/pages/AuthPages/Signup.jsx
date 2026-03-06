import React, { useLayoutEffect, useRef, useState } from 'react';
import API from '../../api/api';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Droplets, Eye, EyeOff, Mail, UserRound } from 'lucide-react';
import { gsap } from 'gsap';

const Signup = () => {
  const navigate = useNavigate();
  const shellRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    birthDate: '',
    gender: '',
    bloodGroup: '',
    username: '',
    password: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await API.post('/auth/signup', formData);
      navigate('/login');
    } catch (err) {
      setError(err?.response?.data?.message || 'Signup failed. Please verify the details and retry.');
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
          <span className="auth-chip auth-fade">New Patient Enrollment</span>
          <h1 className="auth-fade">Create Your HMS Account</h1>
          <p className="auth-fade">Register once to book appointments, access records, and manage your healthcare journey online.</p>
          <ul>
            <li className="auth-fade">Book appointments faster</li>
            <li className="auth-fade">Track prescriptions and reports</li>
            <li className="auth-fade">Secure patient profile management</li>
          </ul>
        </aside>

        <div className="auth-card auth-card-wide">
          <h2 className="auth-fade">Sign Up</h2>
          <p className="auth-sub auth-fade">Fill your profile details to continue.</p>

          <form onSubmit={handleSubmit} className="auth-form auth-form-grid">
            <label className="auth-field auth-fade">
              <UserRound size={16} />
              <input type="text" placeholder="Full name" name="name" value={formData.name} onChange={handleInputChange} required />
            </label>

            <label className="auth-field auth-fade">
              <Mail size={16} />
              <input type="email" placeholder="Email" name="email" value={formData.email} onChange={handleInputChange} required />
            </label>

            <label className="auth-field auth-fade">
              <CalendarDays size={16} />
              <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} max={new Date().toISOString().split('T')[0]} required />
            </label>

            <label className="auth-field auth-fade">
              <span className="auth-field-prefix">G</span>
              <select name="gender" value={formData.gender} onChange={handleInputChange} required>
                <option value="">Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </label>

            <label className="auth-field auth-fade">
              <Droplets size={16} />
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} required>
                <option value="">Blood Group</option>
                <option value="A_POSITIVE">A+</option>
                <option value="A_NEGATIVE">A-</option>
                <option value="B_POSITIVE">B+</option>
                <option value="B_NEGATIVE">B-</option>
                <option value="O_POSITIVE">O+</option>
                <option value="O_NEGATIVE">O-</option>
                <option value="AB_POSITIVE">AB+</option>
                <option value="AB_NEGATIVE">AB-</option>
              </select>
            </label>

            <label className="auth-field auth-fade">
              <UserRound size={16} />
              <input type="text" placeholder="Username" name="username" value={formData.username} onChange={handleInputChange} required />
            </label>

            <label className="auth-field auth-fade auth-field-full">
              <span className="auth-field-prefix">*</span>
              <input type={showPassword ? 'text' : 'password'} placeholder="Password" name="password" value={formData.password} onChange={handleInputChange} required />
              <button type="button" className="auth-icon-btn" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </label>

            <label className="auth-check auth-field-full auth-fade">
              <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange} required />
              I agree to the terms and privacy policy.
            </label>

            {error && <p className="auth-error auth-field-full">{error}</p>}

            <button type="submit" className="auth-btn auth-field-full auth-fade" disabled={!formData.agreeToTerms || isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-links auth-fade">
            <Link to="/login">Already have an account? Sign In</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Signup;
