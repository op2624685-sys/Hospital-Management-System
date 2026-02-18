import React from 'react'
import Header from '../components/Header'

const Doctor = () => {
    return (
        <div className='px-20 py-5'>
            <Header />
            <div className='flex justify-center items-center mt-20 px-30'>
                <div className='section-1 flex flex-col m-10 p-8 h-150 w-1/3 bg-green-300 '>
                    <h1 className='text-8xl font-semibold'>Our Medical Experts</h1>
                    <p className='mt-10'>We are proud to have a team of highly skilled and experienced doctors who are dedicated to providing exceptional care to our patients. Doctors are trained to diagnose and treat a wide range of medical conditions, including diseases, injuries, and illnesses. They also have expertise in a wide range of medical specialties, such as medicine, surgery, dentistry, and more.</p>
                </div>

                <div className='section-2 flex flex-col m-10 p-4 h-150 w-1/2 bg-gray-700 rounded-2xl'>
                    <div className='card h-70 w-45 rounded-2xl bg-amber-50'>
                        {/* Doctors card's */}
                        <div className="logo flex justify-center items-center mt-4">
                            <img className='h-25 w-22 rounded-full' src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
                        </div>
                        <div className='details flex flex-col justify-center items-center mt-1 py-2 px-3'>
                            <h1 className='text-2xl font-semibold m-0.5'>Dr. John Doe</h1>
                            <p><span className='font-semibold'>Specialty:</span>Cardiology</p>
                            <p><span className='font-semibold'>Experience:</span>10 years</p>
                            <p><span className='font-semibold'>Education:</span>Harvard University</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Doctor
