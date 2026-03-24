import React, { useState, useEffect, useRef } from 'react';
import API from '../api/api';
import appointmentApi from '../api/appointments';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AppointmentBooking = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation(); // doctor pre-fill from DoctorCard

  const [branchName, setBranchName] = useState(state?.branchName || '');
  const [branchId, setBranchId] = useState(state?.branchId || null);
  const [allBranches, setAllBranches] = useState([]);
  const [branchSuggestions, setBranchSuggestions] = useState([]);
  const [doctorName, setDoctorName] = useState(state?.doctorName || '');
  const [doctorId, setDoctorId] = useState(state?.doctorId || null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctorSuggestions, setDoctorSuggestions] = useState([]);
  const [reason, setReason] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentSlot, setAppointmentSlot] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patientName, setPatientName] = useState('');
  const doctorDropdownRef = useRef(null);
  const branchDropdownRef = useRef(null);
  const SLOT_MINUTES = 20;
  const START_HOUR = 10;
  const END_HOUR = 19; // exclusive
  const MAX_ADVANCE_DAYS = 30;

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [doctorResponse, branchResponse] = await Promise.all([
          API.get('/public/doctors'),
          API.get('/public/branches'),
        ]);
        const doctors = doctorResponse.data || [];
        setAllDoctors(doctors);
        setAllBranches(branchResponse.data || []);
        if (state?.doctorId) {
          const preselectedDoctor = doctors.find(d => d.id === state.doctorId) || null;
          setSelectedDoctor(preselectedDoctor);
        }
      } catch (error) {
        console.error('Failed to fetch doctors/branches:', error);
      }
    };
    fetchMeta();
  }, [state]);

  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        if (user?.roles?.includes('PATIENT')) {
          const response = await API.get('/patients/profile');
          setPatientName(response.data?.name || '');
        }
      } catch (error) {
        console.error('Failed to fetch patient profile:', error);
      }
    };
    fetchPatientProfile();
  }, [user]);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!doctorId || !appointmentDate) { setBookedSlots([]); return; }
      setLoadingSlots(true);
      try {
        const res = await appointmentApi.getBookedSlots(doctorId, appointmentDate);
        const slots = Array.isArray(res.data) ? res.data : [];
        const times = slots.map((s) => {
          const t = String(s).split('T')[1] || '';
          return t.slice(0, 5);
        }).filter(Boolean);
        setBookedSlots(times);
      } catch (error) {
        console.error('Failed to fetch booked slots:', error);
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchBookedSlots();
  }, [doctorId, appointmentDate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (doctorDropdownRef.current && !doctorDropdownRef.current.contains(e.target)) {
        setDoctorSuggestions([]);
      }
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(e.target)) {
        setBranchSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBranchSearch = (e) => {
    const val = e.target.value;
    setBranchName(val);
    setBranchId(null);
    setDoctorName('');
    setDoctorId(null);
    setSelectedDoctor(null);
    if (val.length < 2) { setBranchSuggestions([]); return; }
    setBranchSuggestions(
      allBranches.filter(b => b.name.toLowerCase().includes(val.toLowerCase()))
    );
  };

  const handleSelectBranch = (branch) => {
    setBranchName(branch.name);
    setBranchId(branch.id);
    setBranchSuggestions([]);
  };

  const handleChangeBranch = () => {
    setBranchName('');
    setBranchId(null);
    setBranchSuggestions([]);
    setDoctorName('');
    setDoctorId(null);
    setSelectedDoctor(null);
    setAppointmentSlot('');
    setBookedSlots([]);
  };

  const handleDoctorSearch = (e) => {
    const val = e.target.value;
    setDoctorName(val);
    setDoctorId(null);
    setSelectedDoctor(null);
    if (val.length < 2) { setDoctorSuggestions([]); return; }
    const filteredDoctors = allDoctors.filter(d => {
      const matchesName = d.name.toLowerCase().includes(val.toLowerCase());
      if (!matchesName) return false;
      if (!branchId) return true;
      return d?.branch?.id === branchId;
    });
    setDoctorSuggestions(filteredDoctors);
  };

  const handleSelectDoctor = (doctor) => {
    setDoctorName(doctor.name);
    setDoctorId(doctor.id);
    setSelectedDoctor(doctor);
    setAppointmentSlot('');
    setBookedSlots([]);
    if (!branchId && doctor?.branch?.id && doctor?.branch?.name) {
      setBranchId(doctor.branch.id);
      setBranchName(doctor.branch.name);
    }
    setDoctorSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn || !user?.id) {
      toast.info('Please login first to book an appointment.');
      setTimeout(() => navigate('/login'), 900);
      return;
    }
    if (!branchId) { toast.warn('Please select a branch from the suggestions!'); return; }
    if (!doctorId) { toast.warn('Please select a doctor from the suggestions!'); return; }
    if (!appointmentDate) { toast.warn('Please select a date!'); return; }
    if (!appointmentSlot) { toast.warn('Please select a time slot!'); return; }
    setLoading(true);
    try {
      const appointmentTime = `${appointmentDate}T${appointmentSlot}`;
      const payload = {
        doctorId,
        patientId: user.id,
        reason,
        appointmentTime,
        branchId,
      };
      
      toast.info('Redirecting to secure payment page...');
      
      setTimeout(() => {
        navigate("/payment", { state: { bookingPayload: payload, doctorId } });
      }, 500);
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

  const timeSlots = (() => {
    const slots = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      for (let m = 0; m < 60; m += SLOT_MINUTES) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        slots.push(`${hh}:${mm}`);
      }
    }
    return slots;
  })();

  const today = new Date();
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const minDate = formatDate(today);
  const maxDate = formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + MAX_ADVANCE_DAYS));

  const isSlotInPast = (dateStr, slot) => {
    if (!dateStr || !slot) return false;
    const now = new Date();
    const [hh, mm] = slot.split(':').map(Number);
    const [yyyy, mon, dd] = dateStr.split('-').map(Number);
    if (!yyyy || !mon || !dd) return false;
    const slotDate = new Date(yyyy, mon - 1, dd, hh, mm, 0, 0);
    return slotDate <= now;
  };

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
          background: linear-gradient(135deg, #1e3a8a 0%, #0f766e 100%);
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
          background: radial-gradient(circle, rgba(37,99,235,.4), transparent);
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
          background: rgba(255,255,255,.18);
          border: 1px solid rgba(255,255,255,.35);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ab-banner-icon svg { color: #ffffff; }
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
          background: #eff6ff;
          border: 1px solid rgba(37,99,235,.16);
          border-radius: 14px;
          padding: 12px 16px;
          animation: abCardIn .5s .1s ease both;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .ab-prefill-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #14b8a6);
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
          text-transform: uppercase; color: #1d4ed8;
          background: rgba(37,99,235,.1);
          border: 1px solid rgba(37,99,235,.2);
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
        .ab-label svg { color: #2563eb; }

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
          border-color: #2563eb;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(37,99,235,.12);
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
        .ab-field:focus-within .ab-input-icon { color: #2563eb; }

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
        .ab-change-btn {
          position: absolute;
          right: 42px;
          top: 50%;
          transform: translateY(-50%);
          border: 1px solid #bfdbfe;
          background: #eff6ff;
          color: #1d4ed8;
          border-radius: 999px;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .ab-change-btn:hover { background: #dbeafe; }

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
        .ab-drop-item:hover { background: #eff6ff; }
        .ab-drop-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #14b8a6);
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
          background: linear-gradient(120deg, #2563EB 0%, #14B8A6 100%);
          color: #fff;
          border: none;
          border-radius: 16px;
          padding: 15px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 600;
          cursor: pointer;
          transition: background .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 8px 28px rgba(37,99,235,.28);
          letter-spacing: .02em;
        }
        .ab-submit:hover { filter: brightness(1.04); transform: translateY(-2px); box-shadow: 0 12px 36px rgba(20,184,166,.35); }
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

        .ab-slot-wrap { display: flex; flex-direction: column; gap: 10px; }
        .ab-slots {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(86px, 1fr));
          gap: 8px;
        }
        .ab-slot {
          padding: 8px 10px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-size: 12px;
          font-weight: 600;
          color: #0f172a;
          cursor: pointer;
          transition: all .15s ease;
          text-align: center;
        }
        .ab-slot:hover { border-color: #93c5fd; background: #eff6ff; }
        .ab-slot-selected {
          border-color: #2563eb;
          background: #dbeafe;
          color: #1d4ed8;
        }
        .ab-slot-booked {
          border-color: #fecaca;
          background: #fef2f2;
          color: #b91c1c;
          cursor: not-allowed;
          text-decoration: line-through;
        }
        .ab-slot-disabled {
          opacity: .6;
          cursor: not-allowed;
        }
        .ab-booked-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .ab-booked-pill {
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 999px;
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }
        .ab-msg {
          font-size: 12px;
          color: #64748b;
        }
        .ab-submeta {
          font-size: 12px;
          color: #64748b;
        }
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
                  {[state.speciality || state.specialization, state.department].filter(Boolean).join(' · ')}
                </div>
              </div>
              <span className="ab-prefill-badge">Pre-filled</span>
            </div>
          )}

          {/* Form */}
          <form className="ab-form" onSubmit={handleSubmit}>

            {/* Doctor search */}
            <div className="ab-field" ref={branchDropdownRef}>
              <label className="ab-label">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 21h18M5 21V7l8-4 6 4v14M9 9h.01M9 13h.01M9 17h.01M13 9h.01M13 13h.01M13 17h.01" />
                </svg>
                Branch
              </label>
              <div className="ab-input-wrap">
                <svg className="ab-input-icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 21h18M5 21V7l8-4 6 4v14" />
                </svg>
                <input
                  className="ab-input"
                  type="text"
                  value={branchName}
                  onChange={handleBranchSearch}
                  placeholder={branchId ? "Branch selected" : "Search branch by name..."}
                  readOnly={Boolean(branchId)}
                />
                {branchId && (
                  <button type="button" className="ab-change-btn" onClick={handleChangeBranch}>
                    Change
                  </button>
                )}
                {branchId && (
                  <div className="ab-check">
                    <svg width="10" height="10" fill="none" stroke="#fff" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {branchSuggestions.length > 0 && (
                  <div className="ab-dropdown">
                    {branchSuggestions.map(branch => (
                      <div key={branch.id} className="ab-drop-item" onClick={() => handleSelectBranch(branch)}>
                        <div className="ab-drop-avatar">
                          {branch.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <div className="ab-drop-name">{branch.name}</div>
                          <div className="ab-drop-spec">{branch.address}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Doctor search */}
            <div className="ab-field" ref={doctorDropdownRef}>
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
                          <div className="ab-drop-spec">{doctor.specialization || doctor.speciality || 'General'}</div>
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

            {/* Date */}
            <div className="ab-field">
              <label className="ab-label">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Appointment Date
              </label>
              <div className="ab-input-wrap">
                <svg className="ab-input-icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  className="ab-input"
                  type="date"
                  value={appointmentDate}
                  onChange={e => { setAppointmentDate(e.target.value); setAppointmentSlot(''); }}
                  min={minDate}
                  max={maxDate}
                  required
                />
              </div>
            </div>

            {/* Time slots */}
            <div className="ab-field">
              <label className="ab-label">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Appointment Time
              </label>
              <div className="ab-slot-wrap">
                {!doctorId && (
                  <div className="ab-msg">
                    Select a doctor to view available slots.
                  </div>
                )}
                {doctorId && !appointmentDate && (
                  <div className="ab-msg">
                    Select a date to view available slots.
                  </div>
                )}
                {doctorId && appointmentDate && (
                  <>
                    {loadingSlots ? (
                      <div className="ab-msg">Loading booked slots...</div>
                    ) : (
                      <div className="ab-slots">
                        {timeSlots.map((slot) => {
                          const isBooked = bookedSlots.includes(slot);
                          const isSelected = appointmentSlot === slot;
                          const isPast = isSlotInPast(appointmentDate, slot);
                          return (
                            <button
                              type="button"
                              key={slot}
                              className={`ab-slot ${isBooked ? 'ab-slot-booked' : ''} ${isSelected ? 'ab-slot-selected' : ''} ${isPast ? 'ab-slot-disabled' : ''}`}
                              onClick={() => (!isBooked && !isPast) && setAppointmentSlot(slot)}
                              disabled={isBooked || isPast}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {!loadingSlots && bookedSlots.length > 0 && (
                      <div>
                        <div className="ab-submeta" style={{ marginBottom: 6 }}>Already booked:</div>
                        <div className="ab-booked-list">
                          {bookedSlots.map((t) => (
                            <span key={t} className="ab-booked-pill">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="ab-divider" />

            {/* Patient pill */}
            {user && (
              <div className="ab-patient-pill">
                <div className="ab-patient-avatar">{initials}</div>
                <div>
                  <div className="ab-patient-label">Booking as</div>
                  <div className="ab-patient-name">{patientName || user.username || 'Patient'}</div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button className="ab-submit" type="submit" disabled={loading}>
              {loading ? (
                <><div className="ab-spinner" /> Redirecting to payment...</>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Pay & Confirm Appointment
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AppointmentBooking;
