import React from 'react'

const DoctorCard = () => {
    return (
        <div className='card m-2 h-70 w-45 rounded-2xl bg-gray-100'>
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
    )
}

export default DoctorCard
