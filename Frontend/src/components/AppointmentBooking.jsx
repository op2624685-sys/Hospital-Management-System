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
  const [doctorSuggestions, setDoctorSuggestions] = useState([]);
  const [reason, setReason] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentSlot, setAppointmentSlot] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [loading, setLoading] = useState(false);
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
        setAllBranches(branchResponse.data || []);
        if (state?.doctorId) {
          const preselectedDoctor = doctors.find(d => d.id === state.doctorId) || null;
          if (preselectedDoctor?.departments) {
            setAvailableDepartments(preselectedDoctor.departments);
            if (preselectedDoctor.departments.length === 1) {
              setSelectedDepartmentId(preselectedDoctor.departments[0].id);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch doctors/branches:', error);
      }
    };
    fetchMeta();
  }, [state]);

  // Patient profile fetch removed as patientName is not displayed

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
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const handleBranchSearch = (e) => {
    const val = e.target.value;
    setBranchName(val);
    setBranchId(null);
    setDoctorName('');
    setDoctorId(null);
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
    setAvailableDepartments([]);
    setSelectedDepartmentId(null);
    setAppointmentSlot('');
    setBookedSlots([]);
  };

  const handleDoctorSearch = async (e) => {
    const val = e.target.value;
    setDoctorName(val);
    setDoctorId(null);
    setAvailableDepartments([]);
    setSelectedDepartmentId(null);

    if (val.length < 2) { setDoctorSuggestions([]); return; }
    
    try {
      // Search from backend instead of just clientside filtering to respect pagination
      const response = await API.get('/public/doctors', { 
        params: { search: val, size: 15 } 
      });
      const filtered = response.data || [];
      
      // Still apply clientside branch filter if needed
      const result = filtered.filter(d => {
        if (!branchId) return true;
        return d?.branch?.id === branchId;
      });
      
      setDoctorSuggestions(result);
    } catch (err) {
      console.error("Doctor search failed:", err);
    }
  };

  const handleSelectDoctor = (doctor) => {
    setDoctorName(doctor.name);
    setDoctorId(doctor.id);
    
    const depts = doctor.departments || [];
    setAvailableDepartments(depts);
    if (depts.length === 1) {
      setSelectedDepartmentId(depts[0].id);
    } else {
      setSelectedDepartmentId(null);
    }

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
    if (!selectedDepartmentId) { toast.warn('Please select a department!'); return; }
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
        departmentId: selectedDepartmentId,
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
        .ab-wrap {
          width: 100%;
          max-width: 480px;
          font-family: 'Outfit', sans-serif;
        }

        .ab-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 32px;
          overflow: visible;
          box-shadow: 0 30px 60px -12px rgba(0,0,0,0.1);
          animation: abSlideUp .6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        @keyframes abSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ab-banner {
          position: relative;
          background: linear-gradient(135deg, var(--primary) 0%, var(--chart-5) 100%);
          padding: 32px;
          overflow: hidden;
        }
        .ab-banner-ring {
          position: absolute; border-radius: 50%; border: 1.5px solid rgba(255,255,255,.06);
        }
        .ab-banner-ring-1 { width: 220px; height: 220px; top: -110px; right: -60px; }
        .ab-banner-ring-2 { width: 140px; height: 140px; bottom: -60px; left: 10px; }
        
        .ab-banner-inner { position: relative; z-index: 1; display: flex; align-items: center; gap: 20px; }
        .ab-banner-icon {
          width: 56px; height: 56px; border-radius: 18px;
          background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.3);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ab-banner-text h2 { font-size: 1.8rem; font-weight: 800; color: #fff; line-height: 1.1; margin: 0 0 4px; }
        .ab-banner-text p { font-size: 13px; color: rgba(255,255,255,.7); margin: 0; }

        .ab-form { padding: 32px; display: flex; flex-direction: column; gap: 24px; }
        .ab-field { display: flex; flex-direction: column; gap: 10px; position: relative; }
        .ab-label { font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--muted-foreground); display: flex; align-items: center; gap: 8px; }
        
        .ab-input-wrap { position: relative; }
        .ab-input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          background: var(--background);
          border: 1.5px solid var(--border);
          border-radius: 16px;
          font-family: inherit;
          font-size: 14px;
          color: var(--foreground);
          outline: none;
          transition: all 0.2s;
        }
        .ab-input:focus { border-color: var(--primary); background: var(--card); box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 12%, transparent); }
        .ab-input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--muted-foreground); transition: color .2s; }
        .ab-field:focus-within .ab-input-icon { color: var(--primary); }

        .ab-check { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; border-radius: 50%; background: #22c55e; display: flex; align-items: center; justify-content: center; color: #fff; }
        .ab-change-btn { position: absolute; right: 48px; top: 50%; transform: translateY(-50%); border: 1px solid var(--border); background: var(--secondary); color: var(--primary); border-radius: 999px; padding: 4px 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; cursor: pointer; }

        .ab-dropdown {
          position: absolute; top: calc(100% + 8px); left: 0; right: 0;
          background: var(--card); border: 1px solid var(--border); border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15); z-index: 80;
          max-height: min(40vh, 280px);
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }
        .ab-drop-item { display: flex; align-items: center; gap: 12px; padding: 14px 18px; cursor: pointer; transition: background .15s; border-bottom: 1px solid var(--border); }
        .ab-drop-item:hover { background: var(--secondary); }
        .ab-drop-avatar { width: 36px; height: 36px; border-radius: 12px; background: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; flex-shrink: 0; font-size: 13px; }
        .ab-drop-name { font-size: 14px; font-weight: 700; color: var(--foreground); }
        .ab-drop-spec { font-size: 11px; color: var(--muted-foreground); }

        .ab-slots { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px; }
        .ab-slot { padding: 12px 10px; border-radius: 12px; border: 1.5px solid var(--border); background: var(--card); font-size: 13px; font-weight: 700; color: var(--foreground); cursor: pointer; transition: all .15s; text-align: center; }
        .ab-slot:hover:not(:disabled) { border-color: var(--primary); background: var(--secondary); color: var(--primary); }
        .ab-slot-selected { border-color: var(--primary) !important; background: var(--primary) !important; color: #fff !important; }
        .ab-slot-booked { opacity: 0.35; cursor: not-allowed; text-decoration: line-through; }
        .ab-slot-disabled { opacity: 0.3; cursor: not-allowed; }

        .ab-submit {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 12px;
          background: var(--primary); color: #fff; border: none; border-radius: 18px;
          padding: 18px; font-size: 15px; font-weight: 800; cursor: pointer;
          transition: all .2s; box-shadow: 0 10px 30px -10px color-mix(in srgb, var(--primary) 40%, transparent);
        }
        .ab-submit:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 15px 35px -10px color-mix(in srgb, var(--primary) 50%, transparent); }
        .ab-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .ab-msg { font-size: 13px; color: var(--muted-foreground); font-style: italic; }
      `}</style>

      <div className="ab-wrap">
        <div className="ab-card">
          <div className="ab-banner">
            <div className="ab-banner-ring ab-banner-ring-1" />
            <div className="ab-banner-ring ab-banner-ring-2" />
            <div className="ab-banner-inner">
              <div className="ab-banner-icon">
                <svg width="24" height="24" fill="none" stroke="#fff" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ab-banner-text">
                <h2>Quick Booking</h2>
                <p>Reserve your clinical evaluation</p>
              </div>
            </div>
          </div>

          <form className="ab-form" onSubmit={handleSubmit}>
            <div className="ab-field" ref={branchDropdownRef}>
              <label className="ab-label">Branch</label>
              <div className="ab-input-wrap">
                <svg className="ab-input-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <input
                  className="ab-input"
                  type="text"
                  value={branchName}
                  onChange={handleBranchSearch}
                  placeholder={branchId ? "Branch confirmed" : "Search medical facility..."}
                  readOnly={Boolean(branchId)}
                />
                {branchId && (
                  <button type="button" className="ab-change-btn" onClick={handleChangeBranch}>Change</button>
                )}
                {branchId && (
                  <div className="ab-check">
                    <svg width="12" height="12" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
                {branchSuggestions.length > 0 && (
                  <div className="ab-dropdown">
                    {branchSuggestions.map(branch => (
                      <div
                        key={branch.id}
                        className="ab-drop-item"
                        onMouseDown={(e) => { e.preventDefault(); handleSelectBranch(branch); }}
                        onTouchStart={(e) => { e.preventDefault(); handleSelectBranch(branch); }}
                      >
                        <div className="ab-drop-avatar">{branch.name[0]}</div>
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

            <div className="ab-field" ref={doctorDropdownRef}>
              <label className="ab-label">Specialist</label>
              <div className="ab-input-wrap">
                <svg className="ab-input-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  className="ab-input"
                  type="text"
                  value={doctorName}
                  onChange={handleDoctorSearch}
                  placeholder="Find specialist by name..."
                />
                {doctorId && (
                  <div className="ab-check">
                    <svg width="12" height="12" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
                {doctorSuggestions.length > 0 && (
                  <div className="ab-dropdown">
                    {doctorSuggestions.map(doctor => (
                      <div
                        key={doctor.id}
                        className="ab-drop-item"
                        onMouseDown={(e) => { e.preventDefault(); handleSelectDoctor(doctor); }}
                        onTouchStart={(e) => { e.preventDefault(); handleSelectDoctor(doctor); }}
                      >
                        <div className="ab-drop-avatar">{doctor.name[0]}</div>
                        <div>
                          <div className="ab-drop-name">Dr. {doctor.name}</div>
                          <div className="ab-drop-spec">{doctor.specialization || 'Clinical Specialist'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {doctorId && (
              <div className="ab-field">
                <label className="ab-label">Department</label>
                <div className="ab-input-wrap">
                  <svg className="ab-input-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <select
                    className="ab-input"
                    value={selectedDepartmentId || ''}
                    onChange={(e) => setSelectedDepartmentId(Number(e.target.value))}
                    required
                  >
                    <option value="" disabled>Choose Department...</option>
                    {availableDepartments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="ab-field">
              <label className="ab-label">Symptom/Reason</label>
              <div className="ab-input-wrap">
                <svg className="ab-input-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <input
                  className="ab-input"
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Primary reason for visit..."
                  required
                />
              </div>
            </div>

            <div className="ab-field">
              <label className="ab-label">Slot & Date</label>
              <div className="ab-input-wrap mb-3">
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
              
              {doctorId && appointmentDate ? (
                <div className="ab-slot-wrap">
                  {loadingSlots ? (
                    <div className="ab-msg">Evaluating availability...</div>
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
                </div>
              ) : (
                <div className="ab-msg">Select specialist and date to see slots.</div>
              )}
            </div>

            <button
              className="ab-submit"
              type="submit"
              disabled={loading || !branchId || !doctorId || !selectedDepartmentId || !appointmentDate || !appointmentSlot}
            >
              {loading ? "Initializing..." : "Secure Appointment →"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AppointmentBooking;
