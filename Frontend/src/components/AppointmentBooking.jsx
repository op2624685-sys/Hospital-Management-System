import React, { useState, useEffect, useRef } from 'react';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AppointmentBooking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation(); // doctor pre-fill from DoctorCard

  const [doctorName, setDoctorName] = useState(state?.doctorName || '');
  const [doctorId, setDoctorId] = useState(state?.doctorId || null);
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctorSuggestions, setDoctorSuggestions] = useState([]);
  const [reason, setReason] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await API.get('/public/doctors');
        setAllDoctors(response.data);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      }
    };
    fetchDoctors();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDoctorSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDoctorSearch = (e) => {
    const val = e.target.value;
    setDoctorName(val);
    setDoctorId(null);
    if (val.length < 2) { setDoctorSuggestions([]); return; }
    setDoctorSuggestions(
      allDoctors.filter(d => d.name.toLowerCase().includes(val.toLowerCase()))
    );
  };

  const handleSelectDoctor = (doctor) => {
    setDoctorName(doctor.name);
    setDoctorId(doctor.id);
    setDoctorSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorId) { toast.warn('Please select a doctor from the suggestions!'); return; }
    setLoading(true);
    try {
      const response = await API.post('/patients/appointments', {
        doctorId,
        patientId: user.id,
        reason,
        appointmentTime,
      });
      toast.success('Appointment booked successfully!');
      setDoctorName(''); setDoctorId(null); setReason(''); setAppointmentTime('');
      navigate(`/appointment/${response.data.appointmentId}`);
    } catch (error) {
      toast.error('Booking failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.username
    ? user.username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'P';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Outfit:wght@300;400;500;600&display=swap');

        .ab-wrap {
          width: 100%;
          max-width: 460px;
          font-family: 'Outfit', sans-serif;
        }

        /* card */
        .ab-card {
          background: #fff;
          border: 1.5px solid #ebe8e2;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,.08);
          animation: abCardIn .6s ease both;
        }
        @keyframes abCardIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* header banner */
        .ab-banner {
          position: relative;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          padding: 28px 32px;
          overflow: hidden;
        }
        .ab-banner-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,.08);
        }
        .ab-banner-ring-1 { width: 180px; height: 180px; top: -80px; right: -50px; }
        .ab-banner-ring-2 { width: 100px; height: 100px; bottom: -40px; left: 20px; }
        .ab-banner-accent {
          position: absolute;
          width: 120px; height: 120px;
          top: -30px; right: 30px;
          background: radial-gradient(circle, rgba(228,35,32,.4), transparent);
          filter: blur(30px);
        }
        .ab-banner-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .ab-banner-icon {
          width: 52px; height: 52px;
          border-radius: 16px;
          background: rgba(228,35,32,.15);
          border: 1px solid rgba(228,35,32,.3);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ab-banner-icon svg { color: #e42320; }
        .ab-banner-text h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.1;
          margin: 0 0 4px;
        }
        .ab-banner-text p {
          font-size: 13px;
          color: rgba(255,255,255,.45);
          margin: 0;
        }

        /* pre-fill pill */
        .ab-prefill {
          margin: 20px 32px 0;
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff8f4;
          border: 1px solid rgba(228,35,32,.15);
          border-radius: 14px;
          padding: 12px 16px;
          animation: abCardIn .5s .1s ease both;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .ab-prefill-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e42320, #a01a18);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: .9rem; font-weight: 700; color: #fff;
          flex-shrink: 0;
        }
        .ab-prefill-info { flex: 1; }
        .ab-prefill-name {
          font-size: 13px; font-weight: 600; color: #1a1a1a;
        }
        .ab-prefill-meta { font-size: 11px; color: #aaa; }
        .ab-prefill-badge {
          font-size: 10px; font-weight: 600; letter-spacing: .08em;
          text-transform: uppercase; color: #e42320;
          background: rgba(228,35,32,.08);
          border: 1px solid rgba(228,35,32,.15);
          padding: 3px 8px; border-radius: 999px;
        }

        /* form body */
        .ab-form { padding: 24px 32px 32px; display: flex; flex-direction: column; gap: 20px; }

        /* field */
        .ab-field { display: flex; flex-direction: column; gap: 7px; position: relative; }
        .ab-label {
          font-size: 11px; font-weight: 600;
          letter-spacing: .12em; text-transform: uppercase;
          color: #bbb;
          display: flex; align-items: center; gap: 6px;
        }
        .ab-label svg { color: #e42320; }

        .ab-input-wrap { position: relative; }
        .ab-input {
          width: 100%;
          padding: 13px 16px 13px 42px;
          background: #faf8f5;
          border: 1.5px solid #ebe8e2;
          border-radius: 14px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          color: #1a1a1a;
          outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
        }
        .ab-input:focus {
          border-color: #e42320;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(228,35,32,.07);
        }
        .ab-input::placeholder { color: #ccc; }
        .ab-input-icon {
          position: absolute;
          left: 14px; top: 50%;
          transform: translateY(-50%);
          color: #ccc;
          pointer-events: none;
          transition: color .2s;
        }
        .ab-field:focus-within .ab-input-icon { color: #e42320; }

        /* selected doctor checkmark */
        .ab-check {
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          width: 20px; height: 20px;
          border-radius: 50%;
          background: #22c55e;
          display: flex; align-items: center; justify-content: center;
        }

        /* dropdown */
        .ab-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0; right: 0;
          background: #fff;
          border: 1.5px solid #ebe8e2;
          border-radius: 16px;
          box-shadow: 0 16px 40px rgba(0,0,0,.1);
          z-index: 50;
          overflow: hidden;
          animation: dropIn .18s ease both;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ab-drop-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: background .15s;
          border-bottom: 1px solid #f5f0ea;
        }
        .ab-drop-item:last-child { border-bottom: none; }
        .ab-drop-item:hover { background: #fff8f4; }
        .ab-drop-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e42320, #a01a18);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: .85rem; font-weight: 700; color: #fff;
          flex-shrink: 0;
        }
        .ab-drop-name { font-size: 13px; font-weight: 600; color: #1a1a1a; }
        .ab-drop-spec { font-size: 11px; color: #aaa; }

        /* divider */
        .ab-divider { height: 1px; background: #f0ece6; }

        /* patient pill */
        .ab-patient-pill {
          display: flex; align-items: center; gap: 12px;
          background: #f5fdf7;
          border: 1px solid #bbf7d0;
          border-radius: 14px;
          padding: 12px 16px;
        }
        .ab-patient-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: .85rem; font-weight: 700; color: #fff;
          flex-shrink: 0;
        }
        .ab-patient-label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #86efac; }
        .ab-patient-name { font-size: 13px; font-weight: 600; color: #1a1a1a; }

        /* submit btn */
        .ab-submit {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          background: #e42320;
          color: #fff;
          border: none;
          border-radius: 16px;
          padding: 15px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 600;
          cursor: pointer;
          transition: background .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 8px 28px rgba(228,35,32,.28);
          letter-spacing: .02em;
        }
        .ab-submit:hover { background: #c81c1a; transform: translateY(-2px); box-shadow: 0 12px 36px rgba(228,35,32,.35); }
        .ab-submit:active { transform: scale(.97); }
        .ab-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; box-shadow: none; }
        .ab-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="ab-wrap">
        <div className="ab-card">

          {/* Banner */}
          <div className="ab-banner">
            <div className="ab-banner-ring ab-banner-ring-1" />
            <div className="ab-banner-ring ab-banner-ring-2" />
            <div className="ab-banner-accent" />
            <div className="ab-banner-inner">
              <div className="ab-banner-icon">
                <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ab-banner-text">
                <h2>Book Appointment</h2>
                <p>Schedule your visit with our specialists</p>
              </div>
            </div>
          </div>

          {/* Pre-fill pill — shown when navigated from DoctorCard */}
          {state?.doctorName && (
            <div className="ab-prefill">
              <div className="ab-prefill-avatar">
                {state.doctorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="ab-prefill-info">
                <div className="ab-prefill-name">Dr. {state.doctorName}</div>
                <div className="ab-prefill-meta">
                  {[state.speciality, state.department].filter(Boolean).join(' · ')}
                </div>
              </div>
              <span className="ab-prefill-badge">Pre-filled</span>
            </div>
          )}

          {/* Form */}
          <form className="ab-form" onSubmit={handleSubmit}>

            {/* Doctor search */}
            <div className="ab-field" ref={dropdownRef}>
              <label className="ab-label">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Doctor
              </label>
              <div className="ab-input-wrap">
                <svg className="ab-input-icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  className="ab-input"
                  type="text"
                  value={doctorName}
                  onChange={handleDoctorSearch}
                  placeholder="Search doctor by name..."
                />
                {doctorId && (
                  <div className="ab-check">
                    <svg width="10" height="10" fill="none" stroke="#fff" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {doctorSuggestions.length > 0 && (
                  <div className="ab-dropdown">
                    {doctorSuggestions.map(doctor => (
                      <div key={doctor.id} className="ab-drop-item" onClick={() => handleSelectDoctor(doctor)}>
                        <div className="ab-drop-avatar">
                          {doctor.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <div className="ab-drop-name">Dr. {doctor.name}</div>
                          <div className="ab-drop-spec">{doctor.speciality || 'General'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Reason */}
            <div className="ab-field">
              <label className="ab-label">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Reason for Visit
              </label>
              <div className="ab-input-wrap">
                <svg className="ab-input-icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <input
                  className="ab-input"
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Describe your symptoms..."
                  required
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="ab-field">
              <label className="ab-label">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date &amp; Time
              </label>
              <div className="ab-input-wrap">
                <svg className="ab-input-icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  className="ab-input"
                  type="datetime-local"
                  value={appointmentTime}
                  onChange={e => setAppointmentTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="ab-divider" />

            {/* Patient pill */}
            {user && (
              <div className="ab-patient-pill">
                <div className="ab-patient-avatar">{initials}</div>
                <div>
                  <div className="ab-patient-label">Booking as</div>
                  <div className="ab-patient-name">{user.username || `Patient #${user.id}`}</div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button className="ab-submit" type="submit" disabled={loading}>
              {loading ? (
                <><div className="ab-spinner" /> Booking...</>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirm Appointment
                </>
              )}
            </button>
          </form>
        </div>

        <ToastContainer position="top-right" autoClose={3000} theme="light" transition={Bounce} />
      </div>
    </>
  );
};

export default AppointmentBooking;