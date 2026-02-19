import React from 'react'
import Header from '../components/Header'
import DoctorCard from '../components/DoctorCard'

const Doctor = () => {
    return (
        <div className='px-20 py-5'>
            <Header />
            <div className='flex justify-center items-center mt-20 px-30'>
                <div className='section-1 flex flex-col m-10 p-8 h-150 w-1/3 bg-transparent '>
                    <h1 className='text-8xl font-semibold'>Our Medical Experts</h1>
                    <p className='mt-10'>We are proud to have a team of highly skilled and experienced doctors who are dedicated to providing exceptional care to our patients. Doctors are trained to diagnose and treat a wide range of medical conditions, including diseases, injuries, and illnesses. They also have expertise in a wide range of medical specialties, such as medicine, surgery, dentistry, and more.</p>
                </div>

                <div className='section-2 flex flex-wrap m-10 py-3 px-12 h-170 w-2/3 bg-transparent border-2 border-black rounded-2xl'>
                    {/* Doctors card's */}
                    <DoctorCard />
                    <DoctorCard />
                    <DoctorCard />
                    <DoctorCard />
                    <DoctorCard />
                    <DoctorCard />
                </div>
            </div>
        </div>
    )
}

export default Doctor
