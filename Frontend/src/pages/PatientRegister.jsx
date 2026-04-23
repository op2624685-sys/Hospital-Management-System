import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { patientAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Droplets, Mail, UserRound } from 'lucide-react';
import { gsap } from 'gsap';
import { ToastContainer, toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';

const PatientRegister = () => {
  const { user, login, updateProfileCompletionStatus } = useAuth();
  const navigate = useNavigate();
  const shellRef = useRef(null);

  const initialEmail = useMemo(() => user?.email || '', [user?.email]);

  const [formData, setFormData] = useState({
    name: '',
    email: initialEmail,
    birthDate: '',
    gender: '',
    bloodGroup: '',
  });
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await patientAPI.register(formData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('roles', JSON.stringify(response.data.roles || []));
        localStorage.setItem('username', response.data.username || user?.username || '');
        localStorage.setItem('email', response.data.email || formData.email || '');

        login({
          userId: response.data.userId,
          username: response.data.username || user?.username || '',
          email: response.data.email || formData.email || '',
          profilePhoto: response.data.profilePhoto || null,
          roles: response.data.roles || [],
        });
        updateProfileCompletionStatus(true);

        toast.success('Patient profile created successfully');
        navigate('/my-appointments');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create patient profile.');
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
          <span className="auth-chip auth-fade">Patient Registration</span>
          <h1 className="auth-fade">Finish your patient profile</h1>
          <p className="auth-fade">
            Your account is ready. Add the medical profile details needed for appointments and records.
          </p>
          <ul>
            <li className="auth-fade">Required for appointments</li>
            <li className="auth-fade">Creates your patient record</li>
            <li className="auth-fade">Upgrades your account to PATIENT</li>
          </ul>
        </aside>

        <div className="auth-card auth-card-wide">
          <h2 className="auth-fade">Patient Details</h2>
          <p className="auth-sub auth-fade">Provide the details that will be stored in the patient table.</p>

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

            <label className="auth-field auth-fade auth-field-full">
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

            {error && <p className="auth-error auth-field-full">{error}</p>}

            <button type="submit" className="auth-btn auth-field-full auth-fade" disabled={isSubmitting}>
              {isSubmitting ? 'Creating patient profile...' : 'Complete Registration'}
            </button>
          </form>
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

export default PatientRegister;
