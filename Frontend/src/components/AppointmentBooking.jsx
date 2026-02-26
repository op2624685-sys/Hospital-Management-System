import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AppointmentBooking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctorName, setDoctorName] = useState('');
  const [doctorId, setDoctorId] = useState(null);
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctorSuggestions, setDoctorSuggestions] = useState([]);
  const [reason, setReason] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleDoctorSearch = (e) => {
    const name = e.target.value;
    setDoctorName(name);
    setDoctorId(null);
    if (name.length < 2) {
      setDoctorSuggestions([]);
      return;
    }
    const filtered = allDoctors.filter(doctor =>
      doctor.name.toLowerCase().includes(name.toLowerCase())
    );
    setDoctorSuggestions(filtered);
  };

  const handleSelectDoctor = (doctor) => {
    setDoctorName(doctor.name);
    setDoctorId(doctor.id);
    setDoctorSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorId) {
      toast.warn("Please select a doctor from the suggestions!");
      return;
    }
    setLoading(true);
    try {
      const response = await API.post('/patients/appointments', {
        doctorId: doctorId,
        patientId: user.id,
        reason: reason,
        appointmentTime: appointmentTime
      });
      toast.success("Appointment booked successfully!");
      setDoctorName('');
      setDoctorId(null);
      setReason('');
      setAppointmentTime('');
      navigate(`/appointment/${response.data.appointmentId}`);
    } catch (error) {
      toast.error("Booking failed!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md'>

      {/* ── Card ── */}
      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>

        {/* Card Header */}
        <div className='bg-linear-to-r from-blue-500 to-blue-600 px-8 py-6'>
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center'>
              <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
              </svg>
            </div>
            <div>
              <h2 className='text-white font-bold text-xl'>Book Appointment</h2>
              <p className='text-blue-100 text-sm mt-0.5'>Schedule your visit with our doctors</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-8 flex flex-col gap-6'>

          {/* Doctor Search */}
          <div className='relative'>
            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
              Doctor
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
                <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                </svg>
              </div>
              <input
                className='w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all'
                type="text"
                value={doctorName}
                onChange={handleDoctorSearch}
                placeholder="Search doctor by name..."
              />
              {/* ✅ Selected doctor indicator */}
              {doctorId && (
                <div className='absolute inset-y-0 right-3 flex items-center'>
                  <div className='w-2 h-2 bg-green-400 rounded-full'></div>
                </div>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {doctorSuggestions.length > 0 && (
              <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden'>
                {doctorSuggestions.map((doctor) => (
                  <div
                    key={doctor.id}
                    className='flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0'
                    onClick={() => handleSelectDoctor(doctor)}>
                    <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0'>
                      <svg className='w-4 h-4 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                          d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                      </svg>
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-gray-800'>Dr. {doctor.name}</p>
                      <p className='text-xs text-gray-400'>{doctor.speciality}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
              Reason for Visit
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
                <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
              </div>
              <input
                className='w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all'
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your symptoms..."
                required
              />
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
              Date & Time
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
                <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                    d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                </svg>
              </div>
              <input
                className='w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all'
                type="datetime-local"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Patient info pill */}
          {user && (
            <div className='flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3'>
              <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0'>
                <svg className='w-4 h-4 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                </svg>
              </div>
              <div>
                <p className='text-xs text-green-400 uppercase tracking-wide'>Booking as</p>
                <p className='text-sm font-semibold text-gray-700'>{user.username || `Patient #${user.id}`}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className='w-full bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors duration-300 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2'>
            {loading ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                Booking...
              </>
            ) : (
              <>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
                Book Appointment
              </>
            )}
          </button>

        </form>
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="light" transition={Bounce} />
    </div>
  );
};

export default AppointmentBooking;