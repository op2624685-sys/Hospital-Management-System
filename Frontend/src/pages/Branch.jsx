import React from 'react'
import Header from '../components/Header'
import { Search } from 'lucide-react'
import BranchCard from '../components/BranchCard'

const Branch = () => {
  return (
    <div className='mt-20 px-20 py-5'>
      <Header />
      <div className='flex justify-center items-center mt-10 px-20'>
        <div className='section-1 flex flex-col m-10 p-2 h-150 w-1/2 bg-transparent '>
          <h2 className='text-8xl font-semibold mb-2'>Find Our Branch Near You</h2>
          <p className='text-xl mt-6'>Locate our hospitals across the country with ease. View brach addresses, contact, information and operating hours to plan your visit.</p>
        </div>
        <div className='section-2 m-10 p-8 h-170 w-2/3 bg-transparent border-2 border-black rounded-2xl'>
          <form className='flex justify-between py-1 px-4 border-2 rounded-2xl shadow-md shadow-black border-black w-md'>
            <input className='block w-full py-2 px-0 text-md text-black bg-transparent border-0 border-b-2 border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:text-gray-800 focus:border-gray-800 peer' type="search" id="branch_search" name="brach_search" placeholder="Search for a branch...." />
            <button className='cursor-pointer active:scale-80' type="submit"><Search /></button>
          </form>
          <div className='flex flex-row h-full w-full pt-5'>
            <BranchCard />
            <BranchCard />
            <BranchCard />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Branch
