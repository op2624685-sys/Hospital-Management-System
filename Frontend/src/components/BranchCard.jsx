import React from 'react'

const BranchCard = () => {
  return (
    <div className='branch-card flex flex-col py-1 px-4 mx-2 bg-gray-200 h-1/2 w-1/2 rounded-4xl'>
              <h3 className='text-xl mt-2 font-semibold text-center'>Sarda Heart Hospital Mumbai</h3>
              <p className='font-semibold'>Address: <span className='font-normal'>Falana, Thikana jagha, Near there where here</span></p>
              <p className='font-semibold'>Location: <span className='font-normal'>Mumbai</span></p>
              <p className='font-semibold'>PinCode: <span className='font-normal'>909090</span></p>
              <p className='font-semibold'>Contact No: <span className='font-normal'>111111111</span></p>
              <div className='flex justify-between items-center mt-4  '>
                <button className='bg-[#e42320] text-white m-1 py-2 px-4 rounded-lg hover:bg-[#d50e0e]'>Book Appointment</button>
                <button className='bg-transparent m-1 border-2 border-black text-black py-2 px-4 rounded-lg hover:bg-green-500 hover:text-white'>Get Directions</button>
              </div>
            </div>
  )
}

export default BranchCard
