import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import DoctorCard from '../components/DoctorCard'
import API from '../api/api'

const Doctor = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await API.get('/public/doctors');
                setDoctors(response.data);
            } catch (error) {
                console.error('Failed to fetch doctors:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    //  filter doctors by search
    const filtered = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(search.toLowerCase()) ||
        doctor.speciality?.toLowerCase().includes(search.toLowerCase()) ||
        doctor.department?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className='min-h-screen bg-gray-50'>
            <Header />

            {/* ── Hero Section ── */}
            <div className='relative bg-linear-to-br from-blue-600 to-blue-700 px-20 py-20 overflow-hidden'>

                {/* Background circles */}
                <div className='absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-20 translate-x-32 -translate-y-32'></div>
                <div className='absolute bottom-0 left-0 w-64 h-64 bg-blue-800 rounded-full opacity-20 -translate-x-20 translate-y-20'></div>

                <div className='relative max-w-4xl'>
                    {/* Tagline */}
                    <span className='inline-flex items-center gap-2 bg-white bg-opacity-20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6'>
                        <span className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></span>
                        HMS Hospital · Meet Our Team
                    </span>

                    <h1 className='text-6xl font-bold text-white leading-tight mb-6'>
                        Our Medical <br />
                        <span className='text-blue-200'>Experts</span>
                    </h1>

                    <p className='text-blue-100 text-lg max-w-xl leading-relaxed mb-10'>
                        We are proud to have a team of highly skilled and experienced doctors
                        dedicated to providing exceptional care to our patients.
                    </p>

                    {/* Stats row */}
                    <div className='flex gap-8'>
                        {[
                            { value: `${doctors.length}+`, label: 'Doctors' },
                            { value: '15+', label: 'Specializations' },
                            { value: '10k+', label: 'Patients Treated' },
                            { value: '24/7', label: 'Available' },
                        ].map((stat, i) => (
                            <div key={i} className='text-center'>
                                <p className='text-3xl font-bold text-white'>{stat.value}</p>
                                <p className='text-blue-200 text-xs mt-1'>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Search Bar ── */}
            <div className='bg-white border-b border-gray-100 px-20 py-6 sticky top-0 z-10 shadow-sm'>
                <div className='max-w-xl relative'>
                    <div className='absolute inset-y-0 left-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, specialization or department..."
                        className='w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all'
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className='absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600'>
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* ── Doctors Grid ── */}
            <div className='px-20 py-12'>

                {/* Results count */}
                {!loading && (
                    <p className='text-sm text-gray-400 mb-8'>
                        Showing <span className='font-semibold text-gray-700'>{filtered.length}</span> doctors
                        {search && <span> for "<span className='text-blue-500'>{search}</span>"</span>}
                    </p>
                )}

                {/* Loading */}
                {loading && (
                    <div className='flex flex-col items-center justify-center py-32'>
                        <div className='w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4'></div>
                        <p className='text-gray-400 text-sm'>Loading doctors...</p>
                    </div>
                )}

                {/* No results */}
                {!loading && filtered.length === 0 && (
                    <div className='flex flex-col items-center justify-center py-32'>
                        <p className='text-5xl mb-4'>👨‍⚕️</p>
                        <p className='text-xl font-semibold text-gray-700'>No doctors found</p>
                        <p className='text-gray-400 text-sm mt-2'>Try searching with different keywords</p>
                        {search && (
                            <button onClick={() => setSearch('')}
                                className='mt-4 text-blue-500 hover:underline text-sm'>
                                Clear search
                            </button>
                        )}
                    </div>
                )}

                {/* Doctors Grid */}
                {!loading && filtered.length > 0 && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                        {filtered.map((doctor) => (
                            <DoctorCard key={doctor.id} doctor={doctor} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Doctor