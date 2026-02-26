import React, { useState } from 'react'
import API from '../api/api'
import Header from '../components/Header'

const statusConfig = {
    PENDING: {
        style: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        dot: 'bg-yellow-400',
        label: 'Pending Confirmation'
    },
    CONFIRMED: {
        style: 'bg-green-50 text-green-700 border-green-200',
        dot: 'bg-green-400',
        label: 'Confirmed'
    },
    CANCELLED: {
        style: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-400',
        label: 'Cancelled'
    },
}

const CheckAppointment = () => {
    const [appointmentId, setAppointmentId] = useState('');
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pasted, setPasted] = useState(false);

    // ✅ Paste from clipboard
    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setAppointmentId(text);
            setPasted(true);
            setTimeout(() => setPasted(false), 2000);
        } catch (err) {
            console.error('Clipboard access denied:', err);
        }
    };

    const handleCheck = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setAppointment(null);

        try {
            const response = await API.get(`/patients/appointments/check/${appointmentId}`);
            setAppointment(response.data);
        } catch (error) {
            setError('No appointment found with this ID. Please check and try again.');
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

    const status = appointment
        ? (statusConfig[appointment.status] || statusConfig.PENDING)
        : null;

    return (
        <div className='min-h-screen bg-gray-50'>
            <Header />

            <div className='max-w-2xl mx-auto px-4 py-16'>

                {/* ── Page Header ── */}
                <div className='text-center mb-10'>
                    <div className='inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-4'>
                        <svg className='w-7 h-7 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                        </svg>
                    </div>
                    <h1 className='text-3xl font-bold text-gray-800'>Check Appointment</h1>
                    <p className='text-gray-400 mt-2 text-sm'>
                        Enter your appointment ID to view your booking details
                    </p>
                </div>

                {/* ── Search Card ── */}
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6'>

                    <form onSubmit={handleCheck}>
                        <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>
                            Appointment ID
                        </label>

                        {/* ── Input Row ── */}
                        <div className='flex gap-2 mb-4'>

                            {/* Input with paste button inside */}
                            <div className='relative flex-1'>
                                <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
                                    <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                                            d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={appointmentId}
                                    onChange={(e) => setAppointmentId(e.target.value)}
                                    placeholder="e.g. 550e8400-e29b-41d4-a716..."
                                    className='w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500 focus:bg-white transition-all'
                                    required
                                />
                            </div>

                            {/* ✅ Paste Button */}
                            <button
                                type="button"
                                onClick={handlePaste}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all duration-300 shrink-0
                                    ${pasted
                                        ? 'border-green-400 bg-green-50 text-green-600'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-500'
                                    }`}>
                                {pasted ? (
                                    <>
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                                        </svg>
                                        Pasted!
                                    </>
                                ) : (
                                    <>
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                                                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                                        </svg>
                                        Paste
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Hint text */}
                        <p className='text-xs text-gray-400 mb-6'>
                            💡 Copy the ID from your appointment confirmation and click Paste
                        </p>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !appointmentId}
                            className='w-full bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors duration-300 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2'>
                            {loading ? (
                                <>
                                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                                            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                                    </svg>
                                    Search Appointment
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className='flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl mb-6'>
                        <div className='w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0'>
                            <svg className='w-4 h-4 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                                    d='M6 18L18 6M6 6l12 12' />
                            </svg>
                        </div>
                        <div>
                            <p className='font-semibold text-sm'>Not Found</p>
                            <p className='text-xs text-red-400 mt-0.5'>{error}</p>
                        </div>
                    </div>
                )}

                {/* ── Result Card ── */}
                {appointment && (
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>

                        {/* Card Header */}
                        <div className='bg-linear-to-r from-blue-500 to-blue-600 px-8 py-6'>
                            <div className='flex justify-between items-center'>
                                <div>
                                    <p className='text-blue-100 text-xs'>Appointment Found ✓</p>
                                    <p className='text-white font-bold text-lg mt-1'>HMS Hospital</p>
                                </div>
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${status.style}`}>
                                    <div className={`w-2 h-2 rounded-full ${status.dot}`}></div>
                                    <span className='text-xs font-semibold'>{status.label}</span>
                                </div>
                            </div>
                        </div>

                        <div className='p-8'>

                            {/* Appointment ID */}
                            <div className='bg-gray-50 border border-dashed border-gray-200 rounded-xl px-5 py-4 mb-8'>
                                <p className='text-xs text-gray-400 uppercase tracking-widest text-center mb-2'>
                                    Appointment ID
                                </p>
                                <p className='font-mono text-blue-600 font-bold text-sm text-center break-all'>
                                    {appointment.appointmentId}
                                </p>
                            </div>

                            {/* Divider */}
                            <div className='flex items-center gap-3 mb-6'>
                                <div className='flex-1 h-px bg-gray-100'></div>
                                <p className='text-xs text-gray-400 uppercase tracking-widest'>Details</p>
                                <div className='flex-1 h-px bg-gray-100'></div>
                            </div>

                            {/* Details Grid */}
                            <div className='grid grid-cols-2 gap-4'>

                                {/* Doctor */}
                                <div className='flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100'>
                                    <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0'>
                                        <svg className='w-5 h-5 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                                                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className='text-xs text-blue-400 uppercase tracking-wide mb-1'>Doctor</p>
                                        <p className='font-bold text-gray-800 text-sm'>Dr. {appointment.doctor.name}</p>
                                        <p className='text-xs text-gray-500'>{appointment.doctor.specialization}</p>
                                        <p className='text-xs text-gray-400'>{appointment.doctor.department?.name}</p>
                                        <p className='text-xs text-gray-400'>{appointment.doctor.email}</p>
                                    </div>
                                </div>

                                {/* Patient */}
                                <div className='flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100'>
                                    <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0'>
                                        <svg className='w-5 h-5 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                                                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className='text-xs text-green-400 uppercase tracking-wide mb-1'>Patient</p>
                                        <p className='font-bold text-gray-800 text-sm'>{appointment.patient.name}</p>
                                        <p className='text-xs text-gray-500'>{appointment.patient.email}</p>
                                        <p className='text-xs text-gray-400'>{appointment.patient.gender}</p>
                                        <p className='text-xs text-gray-400'>Blood: {appointment.patient.bloodGroup}</p>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className='flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100'>
                                    <div className='w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0'>
                                        <svg className='w-5 h-5 text-purple-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                                                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className='text-xs text-purple-400 uppercase tracking-wide mb-1'>Date & Time</p>
                                        <p className='font-bold text-gray-800 text-sm'>{formattedDate}</p>
                                    </div>
                                </div>

                                {/* Reason */}
                                <div className='flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100'>
                                    <div className='w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center shrink-0'>
                                        <svg className='w-5 h-5 text-yellow-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                                                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className='text-xs text-yellow-500 uppercase tracking-wide mb-1'>Reason</p>
                                        <p className='font-bold text-gray-800 text-sm'>{appointment.reason}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Check another */}
                            <button
                                onClick={() => {
                                    setAppointment(null);
                                    setAppointmentId('');
                                }}
                                className='w-full mt-8 border-2 border-gray-200 text-gray-500 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center gap-2'>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                                        d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                                </svg>
                                Check Another Appointment
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                {!appointment && (
                    <p className='text-center text-xs text-gray-400 mt-6'>
                        Your appointment ID was provided when you booked your appointment
                    </p>
                )}
            </div>
        </div>
    )
}

export default CheckAppointment