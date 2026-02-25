import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AppointmentBooking = () => {
  const { user } = useAuth(); // get logged in patient

  const [doctorName, setDoctorName] = useState('');
  const [doctorId, setDoctorId] = useState(null);
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctorSuggestions, setDoctorSuggestions] = useState([]);
  const [reason, setReason] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  // Fetch all doctors once on page load
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

  // Filter doctors locally as user types
  const handleDoctorSearch = (e) => {
    const name = e.target.value;
    setDoctorName(name);
    setDoctorId(null); // reset doctor id when typing

    if (name.length < 2) {
      setDoctorSuggestions([]);
      return;
    }

    // filter from already fetched doctors
    const filtered = allDoctors.filter(doctor =>
      doctor.name.toLowerCase().includes(name.toLowerCase())
    );
    setDoctorSuggestions(filtered);
  };

  // When patient clicks a doctor from suggestions
  const handleSelectDoctor = (doctor) => {
    setDoctorName(doctor.name);
    setDoctorId(doctor.id);
    setDoctorSuggestions([]); // hide suggestions
  };

  // Submit appointment
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!doctorId) {
      toast.warn("Please select a doctor from the suggestions!");
      return;
    }

    try {
      await API.post('/patients/appointments', {
        doctorId: doctorId,
        patientId: user.id,           // from logged in user
        reason: reason,
        appointmentTime: appointmentTime
      });

      toast.success("Appointment booked successfully!");

      // reset form
      setDoctorName('');
      setDoctorId(null);
      setReason('');
      setAppointmentTime('');

    } catch (error) {
      toast.error("Booking failed!");
      console.error(error);
    }
  };

  return (
    <div className='w-1/3 h-150 m-10 p-12 border-2 border-gray-300 rounded-2xl'>
      <div className='logo flex justify-center items-center mb-15'>
        <img className='h-30 w-30 rounded-full'
          src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=847&auto=format&fit=crop" />
      </div>

      <div className='form relative'>
        <form className='flex flex-col' onSubmit={handleSubmit}>

          {/* Doctor Search */}
          <label className='relative text-sm duration-300'>Doctor name</label>
          <input
            className='block w-full py-2.5 px-0 text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer'
            type="text"
            value={doctorName}
            onChange={handleDoctorSearch}
            placeholder="Type doctor name..."
          />

          {/* Doctor suggestions dropdown */}
          {doctorSuggestions.length > 0 && (
            <div className='border border-gray-300 rounded mt-1 bg-white shadow-md z-10 absolute w-80'>
              {doctorSuggestions.map((doctor) => (
                <div
                  key={doctor.id}
                  className='p-2 hover:bg-blue-100 cursor-pointer text-sm text-black'
                  onClick={() => handleSelectDoctor(doctor)}
                >
                  {doctor.name}
                </div>
              ))}
            </div>
          )}

          {/* Reason */}
          <label className='relative text-sm duration-300 mt-4'>Reason</label>
          <input
            className='block w-full py-2.5 px-0 text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer'
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {/* Date */}
          <label className='relative text-sm duration-300 mt-4'>Date</label>
          <input
            className='block w-full py-2.5 px-0 text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer'
            type="datetime-local"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
          />

          <button
            className='w-full mb-4 mt-6 text-[18px] rounded bg-blue-500 py-2 hover:bg-blue-600 transition-colors duration-300 active:scale-90'
            type="submit">
            Book Now
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="light" transition={Bounce} />
    </div>
  );
};

export default AppointmentBooking;