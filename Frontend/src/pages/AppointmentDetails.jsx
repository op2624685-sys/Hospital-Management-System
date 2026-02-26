import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

const AppointmentDetails = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                const response = await API.get(`/patients/appointments/check/${appointmentId}`);
                setAppointment(response.data);
            } catch (error) {
                setError('Appointment not found!');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointment();
    }, [appointmentId]);

    const handleCopyId = () => {
        navigator.clipboard.writeText(appointment.appointmentId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => window.print();

    // ── Loading ──
    if (loading) return (
        <div className='min-h-screen bg-gray-50'>
            <Header />
            <div className='flex flex-col items-center justify-center mt-40'>
                <div className='w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                <p className='text-gray-400 mt-4 text-sm'>Loading appointment...</p>
            </div>
        </div>
    );

    // ── Error ──
    if (error) return (
        <div className='min-h-screen bg-gray-50'>
            <Header />
            <div className='flex flex-col items-center mt-40'>
                <p className='text-5xl mb-4'>😕</p>
                <p className='text-xl font-semibold text-gray-700'>{error}</p>
                <button onClick={() => navigate('/appointment')}
                    className='mt-6 bg-blue-500 text-white px-8 py-3 rounded-xl hover:bg-blue-600 transition-colors'>
                    Go Back
                </button>
            </div>
        </div>
    );

    const status = statusConfig[appointment.status] || statusConfig.PENDING;
    const formattedDate = new Date(appointment.appointmentTime)
        .toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });

    return (
        <div className='min-h-screen bg-gray-50'>
            <Header />

            {/* Print styles */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; }
                }
            `}</style>

            <div className='max-w-2xl mx-auto px-4 py-12'>

                {/* ── Success Banner ── */}
                <div className='text-center mb-8'>
                    <div className='inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4'>
                        <svg className='w-8 h-8 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                        </svg>
                    </div>
                    <h1 className='text-3xl font-bold text-gray-800'>Appointment Booked!</h1>
                    <p className='text-gray-400 mt-1 text-sm'>Your appointment has been successfully booked</p>
                </div>

                {/* ── Main Card ── */}
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>

                    {/* Card Header */}
                    <div className='bg-linear-to-r from-blue-500 to-blue-600 px-8 py-6'>
                        <div className='flex justify-between items-center'>
                            <div>
                                <p className='text-blue-100 text-xs'>Appointment Reference</p>
                                <p className='text-white font-bold text-xl mt-1'>HMS Hospital</p>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${status.style}`}>
                                <div className={`w-2 h-2 rounded-full ${status.dot}`}></div>
                                <span className='text-xs font-semibold'>{status.label}</span>
                            </div>
                        </div>
                    </div>

                    <div className='p-8'>

                        {/* ── QR Style ID Box ── */}
                        <div className='border-2 border-dashed border-gray-200 rounded-xl p-5 mb-8 bg-gray-50'>
                            <p className='text-xs text-gray-400 text-center mb-3 uppercase tracking-widest'>
                                Appointment ID
                            </p>

                            <div className='flex items-center justify-center gap-4'>
                                {/* QR visual */}
                                <div className='w-16 h-16 bg-white border-2 border-gray-200 rounded-lg grid grid-cols-3 gap-0.5 p-1.5 shrink-0'>
                                    {[...Array(9)].map((_, i) => (
                                        <div key={i}
                                            className={`rounded-sm ${[0, 2, 6, 8].includes(i)
                                                ? 'bg-blue-500'
                                                : i === 4
                                                    ? 'bg-blue-300'
                                                    : 'bg-gray-200'
                                                }`}>
                                        </div>
                                    ))}
                                </div>

                                {/* ID text */}
                                <p className='font-mono text-blue-600 font-bold text-sm break-all leading-relaxed'>
                                    {appointment.appointmentId}
                                </p>
                            </div>

                            {/* Copy Button */}
                            <button
                                onClick={handleCopyId}
                                className='no-print w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-sm text-gray-500 cursor-pointer'>
                                {copied ? (
                                    <>
                                        <svg className='w-4 h-4 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                                        </svg>
                                        <span className='text-green-500 font-medium'>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                                        </svg>
                                        Copy ID
                                    </>
                                )}
                            </button>
                        </div>

                        {/* ── Divider ── */}
                        <div className='flex items-center gap-3 mb-6'>
                            <div className='flex-1 h-px bg-gray-100'></div>
                            <p className='text-xs text-gray-400 uppercase tracking-widest'>Details</p>
                            <div className='flex-1 h-px bg-gray-100'></div>
                        </div>

                        {/* ── Details Grid ── */}
                        <div className='grid grid-cols-2 gap-4'>

                            {/* Doctor */}
                            <div className='flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100'>
                                <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0'>
                                    <svg className='w-5 h-5 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                                    </svg>
                                </div>
                                <div>
                                    <p className='text-xs text-blue-400 uppercase tracking-wide mb-1'>Doctor</p>
                                    <p className='font-bold text-gray-800 text-sm'>Dr. {appointment.doctor.name}</p>
                                    <p className='text-xs text-gray-500'>{appointment.doctor.specialization}</p>
                                    <p className='text-xs text-gray-400'>{appointment.doctor.department?.name}</p>
                                </div>
                            </div>

                            {/* Patient */}
                            <div className='flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100'>
                                <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0'>
                                    <svg className='w-5 h-5 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                                    </svg>
                                </div>
                                <div>
                                    <p className='text-xs text-green-400 uppercase tracking-wide mb-1'>Patient</p>
                                    <p className='font-bold text-gray-800 text-sm'>{appointment.patient.name}</p>
                                    <p className='text-xs text-gray-500'>{appointment.patient.email}</p>
                                    <p className='text-xs text-gray-400'>{appointment.patient.gender}</p>
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className='flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100'>
                                <div className='w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0'>
                                    <svg className='w-5 h-5 text-purple-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
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
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                                    </svg>
                                </div>
                                <div>
                                    <p className='text-xs text-yellow-500 uppercase tracking-wide mb-1'>Reason</p>
                                    <p className='font-bold text-gray-800 text-sm'>{appointment.reason}</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Action Buttons ── */}
                        <div className='flex gap-3 mt-8 no-print'>
                            <button
                                onClick={() => navigate('/appointment')}
                                className='flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm'>
                                Book Another
                            </button>
                            <button
                                onClick={handlePrint}
                                className='flex-1 border-2 border-blue-500 text-blue-500 py-3 rounded-xl hover:bg-blue-50 transition-colors font-medium text-sm flex items-center justify-center gap-2'>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' />
                                </svg>
                                Print
                            </button>
                            <button
                                onClick={() => navigate('/appointment/check')}
                                className='flex-1 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium text-sm'>
                                Check Status
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer note */}
                <p className='text-center text-xs text-gray-400 mt-6 no-print'>
                    Please arrive 10 minutes before your appointment time.
                </p>
            </div>
        </div>
    )
}

export default AppointmentDetails