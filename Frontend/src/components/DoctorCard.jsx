import React, { useState } from 'react'

const specialityColors = {
    'Cardiology': 'bg-red-50 text-red-600 border-red-100',
    'Neurology': 'bg-purple-50 text-purple-600 border-purple-100',
    'Pediatrics': 'bg-yellow-50 text-yellow-600 border-yellow-100',
    'Orthopedics': 'bg-blue-50 text-blue-600 border-blue-100',
    'Dermatology': 'bg-pink-50 text-pink-600 border-pink-100',
    'default': 'bg-green-50 text-green-600 border-green-100',
}

const avatarColors = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-green-400 to-green-600',
    'from-red-400 to-red-600',
    'from-yellow-400 to-orange-500',
    'from-pink-400 to-pink-600',
]

const DoctorCard = ({ doctor }) => {
    const [hovered, setHovered] = useState(false);

    const specialityStyle = specialityColors[doctor.speciality] || specialityColors.default;
    const avatarColor = avatarColors[doctor.id % avatarColors.length];

    // Get initials from name
    const initials = doctor.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className='bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer'>

            {/* ── Card Top ── */}
            <div className={`relative bg-linear-to-br ${avatarColor} p-6 flex flex-col items-center`}>

                {/* Available badge */}
                <div className='absolute top-3 right-3 flex items-center gap-1 bg-white bg-opacity-90 px-2 py-1 rounded-full'>
                    <div className='w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse'></div>
                    <span className='text-xs font-medium text-gray-600'>Available</span>
                </div>

                {/* Avatar with initials */}
                <div className='w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-4 border-white border-opacity-40 mb-3'>
                    <span className='text-white font-bold text-2xl'>{initials}</span>
                </div>

                <h3 className='text-white font-bold text-lg text-center'>Dr. {doctor.name}</h3>
                <p className='text-white text-opacity-80 text-xs mt-0.5'>{doctor.email}</p>
            </div>

            {/* ── Card Body ── */}
            <div className='p-5'>

                {/* Speciality badge */}
                <div className='flex justify-center mb-4'>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${specialityStyle}`}>
                        {doctor.speciality || 'General'}
                    </span>
                </div>

                {/* Department */}
                <div className='flex items-center gap-2 text-gray-500 text-xs mb-2'>
                    <svg className='w-3.5 h-3.5 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                            d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                    </svg>
                    <span>{doctor.department?.name || 'General Department'}</span>
                </div>

                {/* Divider */}
                <div className='h-px bg-gray-100 my-4'></div>

                {/* Book button */}
                <button
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                        ${hovered
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}>
                    {hovered ? '📅 Book Appointment' : 'View Profile'}
                </button>
            </div>
        </div>
    )
}

export default DoctorCard