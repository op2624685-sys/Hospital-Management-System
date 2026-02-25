import React from 'react'

const DoctorCard = ({ doctor }) => {
    return (
        <div className='card m-2 h-70 w-45 rounded-2xl bg-gray-100'>
            <div className="logo flex justify-center items-center mt-4">
                <img className='h-25 w-22 rounded-full'
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=764&auto=format&fit=crop" />
            </div>
            <div className='details flex flex-col justify-center items-center mt-1 py-2 px-3'>
                <h1 className='text-2xl font-semibold m-0.5'>Dr. {doctor.name}</h1>
                <p><span className='font-semibold'>Speciality: </span>{doctor.speciality}</p>
                <p><span className='font-semibold'>Department: </span>{doctor.department?.name}</p>
                <p><span className='font-semibold'>Email: </span>{doctor.email}</p>
            </div>
        </div>
    )
}

export default DoctorCard