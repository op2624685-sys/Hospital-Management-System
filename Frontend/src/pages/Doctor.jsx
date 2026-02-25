import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import DoctorCard from '../components/DoctorCard'
import API from '../api/api'

const Doctor = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className='px-20 py-5'>
            <Header />
            <div className='flex justify-center items-center mt-20 px-30'>
                <div className='section-1 flex flex-col m-10 p-8 h-150 w-1/3 bg-transparent'>
                    <h1 className='text-8xl font-semibold'>Our Medical Experts</h1>
                    <p className='mt-10'>We are proud to have a team of highly skilled and experienced doctors who are dedicated to providing exceptional care to our patients.</p>
                </div>

                <div className='section-2 flex flex-wrap m-10 py-3 px-12 h-170 w-2/3 bg-transparent border-2 border-black rounded-2xl overflow-y-auto'>
                    {/* loading state */}
                    {loading && <p className='text-center w-full mt-10'>Loading doctors...</p>}

                    {/* no doctors found */}
                    {!loading && doctors.length === 0 && (
                        <p className='text-center w-full mt-10'>No doctors found!</p>
                    )}

                    {/* map all doctors */}
                    {doctors.map((doctor) => (
                        <DoctorCard key={doctor.id} doctor={doctor} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Doctor