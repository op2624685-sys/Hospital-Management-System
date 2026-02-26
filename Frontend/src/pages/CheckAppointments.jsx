import React, { useState } from 'react'
import API from '../api/api'
import Header from '../components/Header'

const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    CONFIRMED: 'bg-green-100 text-green-700 border-green-300',
    CANCELLED: 'bg-red-100 text-red-700 border-red-300',
}

const CheckAppointment = () => {
    const [appointmentId, setAppointmentId] = useState('');
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCheck = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setAppointment(null);

        try {
            const response = await API.get(`/patients/appointments/check/${appointmentId}`);
            setAppointment(response.data);
        } catch (error) {
            setError('Appointment not found! Please check your ID.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formattedDate = appointment
        ? new Date(appointment.appointmentTime).toLocaleString('en-IN', {
            dateStyle: 'long',
            timeStyle: 'short'
        })
        : null;

    return (
        <div className='min-h-screen bg-gray-50'>
            <Header />

            <div className='flex flex-col items-center mt-16 px-4'>

                {/* Title */}
                <h1 className='text-4xl font-bold text-gray-800 mb-2'>Check Appointment</h1>
                <p className='text-gray-500 mb-10'>Enter your appointment ID to view details</p>

                {/* Search Form */}
                <form onSubmit={handleCheck} className='flex gap-3 w-full max-w-2xl'>
                    <input
                        type="text"
                        value={appointmentId}
                        onChange={(e) => setAppointmentId(e.target.value)}
                        placeholder="Enter your appointment ID..."
                        className='flex-1 border-2 border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:border-blue-500 bg-white text-sm'
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className='bg-blue-500 text-white px-8 py-3 rounded-xl hover:bg-blue-600 transition-colors duration-300 active:scale-90 font-semibold disabled:opacity-50'>
                        {loading ? 'Searching...' : 'Check'}
                    </button>
                </form>

                {/* Error */}
                {error && (
                    <div className='mt-8 bg-red-50 border border-red-300 text-red-600 px-6 py-4 rounded-xl'>
                        ❌ {error}
                    </div>
                )}

                {/* Result Card */}
                {appointment && (
                    <div className='mt-10 w-full max-w-2xl bg-white border-2 border-gray-200 rounded-2xl shadow-md p-8'>

                        {/* Success message */}
                        <p className='text-green-600 font-semibold mb-6 text-center'>
                            ✅ Appointment found!
                        </p>

                        {/* Appointment ID + Status */}
                        <div className='flex justify-between items-center mb-6'>
                            <div>
                                <p className='text-xs text-gray-400'>Appointment ID</p>
                                <p className='font-mono text-sm text-blue-500'>{appointment.appointmentId}</p>
                            </div>
                            <span className={`text-sm font-semibold px-4 py-1 rounded-full border ${statusColors[appointment.status] || 'bg-gray-100 text-gray-600'}`}>
                                {appointment.status}
                            </span>
                        </div>

                        <hr className='mb-6' />

                        {/* Details Grid */}
                        <div className='grid grid-cols-2 gap-6'>

                            {/* Doctor */}
                            <div className='bg-blue-50 rounded-xl p-4'>
                                <p className='text-xs text-gray-400 mb-1'>Doctor</p>
                                <p className='font-bold text-gray-800'>Dr. {appointment.doctor.name}</p>
                                <p className='text-sm text-gray-500'>{appointment.doctor.specialization}</p>
                                <p className='text-sm text-gray-500'>{appointment.doctor.department?.name}</p>
                                <p className='text-sm text-gray-500'>{appointment.doctor.email}</p>
                            </div>

                            {/* Patient */}
                            <div className='bg-green-50 rounded-xl p-4'>
                                <p className='text-xs text-gray-400 mb-1'>Patient</p>
                                <p className='font-bold text-gray-800'>{appointment.patient.name}</p>
                                <p className='text-sm text-gray-500'>{appointment.patient.email}</p>
                                <p className='text-sm text-gray-500'>{appointment.patient.gender}</p>
                                <p className='text-sm text-gray-500'>Blood: {appointment.patient.bloodGroup}</p>
                            </div>

                            {/* Date & Time */}
                            <div className='bg-purple-50 rounded-xl p-4'>
                                <p className='text-xs text-gray-400 mb-1'>Date & Time</p>
                                <p className='font-bold text-gray-800'>{formattedDate}</p>
                            </div>

                            {/* Reason */}
                            <div className='bg-yellow-50 rounded-xl p-4'>
                                <p className='text-xs text-gray-400 mb-1'>Reason</p>
                                <p className='font-bold text-gray-800'>{appointment.reason}</p>
                            </div>

                        </div>

                        {/* Back button */}
                        <div className='mt-8 text-center'>
                            <button
                                onClick={() => {
                                    setAppointment(null);
                                    setAppointmentId('');
                                }}
                                className='text-blue-500 hover:underline text-sm'>
                                ← Check another appointment
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CheckAppointment