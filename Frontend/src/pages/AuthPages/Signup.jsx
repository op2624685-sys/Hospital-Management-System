import React, { useState } from 'react'
import API from '../../api/api'
import { Link } from 'react-router-dom'

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        birthDate: '',
        gender: '',
        bloodGroup: '',
        username: '',
        password: '',
        agreeToTerms: false
    })

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
    e.preventDefault()
    try {
        const response = await API.post('/auth/signup', formData)
        console.log('Signup successful:', response.data)
        // Optional: redirect to login page
        window.location.href = '/login'
    } catch (error) {
        console.error('Signup failed:', error.response?.data || error.message)
    }
}


    return (
        <div className='h-screen flex items-center justify-center bg-cover' style={{ "backgroundImage": "url('https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}>
            <div className='border border-blue-300 rounded-md p-8 shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-30 relative w-full md:w-1/2 lg:w-1/3'>
                <h1 className='text-4xl font-bold text-center p-3 mb-6'>Sign Up</h1>
                <form onSubmit={handleSubmit}>
                    <div className='relative my-4'>
                        <input
                            type="text"
                            className='block w-full py-2.5 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-blur-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-500 peer'
                            placeholder=''
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                        <label htmlFor="fullName" className='absolute text-sm duration-300 transform -translate scale-75 top-3 -z-10 origin-left peer-focus:left-0 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-6'>Full Name</label>
                    </div>

                    <div className='relative my-4'>
                        <input
                            type="email"
                            className='block w-full py-2.5 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-blur-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-500 peer'
                            placeholder=''
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                        <label htmlFor="email" className='absolute text-sm duration-300 transform -translate scale-75 top-3 -z-10 origin-left peer-focus:left-0 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-6'>Email Address</label>
                    </div>

                    <div className='relative my-4'>
                        <input
                            type="date"
                            className='block w-full py-2.5 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-blur-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-500 peer'
                            id="birthDate"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleInputChange}
                            max={new Date().toISOString().split("T")[0]} // Prevents selecting a future date
                        />
                        {formData.birthDate && <p>Date of birth selected: {formData.birthDate}</p>}
                        <label htmlFor="birthDate" className='absolute text-sm duration-300 transform -translate scale-75 top-3 -z-10 origin-left peer-focus:left-0 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-6'>Enter your birthday:</label>
                    </div>

                    <div className='relative my-4'>
                        <select
                            className='block w-full py-2.5 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-blur-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-500 peer'
                            name="gender"
                            id="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="" className='bg-gray-800 text-white'> </option>
                            <option value="MALE" className='bg-gray-800 text-white'>Male</option>
                            <option value="FEMALE" className='bg-gray-800 text-white'>Female</option>
                            <option value="OTHER" className='bg-gray-800 text-white'>Other</option>
                        </select>
                        <label htmlFor="gender" className='absolute text-sm duration-300 transform -translate scale-75 top-3 -z-10 origin-left peer-focus:left-0 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-6'>Gender</label>
                    </div>

                    <div className='relative my-4'>
                        <select
                            className='block w-full py-2.5 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-blur-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-500 peer'
                            name="bloodGroup"
                            id="bloodGroup"
                            value={formData.bloodGroup}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="" className='bg-gray-800 text-white'> </option>
                            <option value="A_POSITIVE" className='bg-gray-800 text-white'>A+</option>
                            <option value="A_NEGATIVE" className='bg-gray-800 text-white'>A-</option>
                            <option value="B_POSITIVE" className='bg-gray-800 text-white'>B+</option>
                            <option value="B_NEGATIVE" className='bg-gray-800 text-white'>B-</option>
                            <option value="O_POSITIVE" className='bg-gray-800 text-white'>O+</option>
                            <option value="O_NEGATIVE" className='bg-gray-800 text-white'>O-</option>
                            <option value="AB_POSITIVE" className='bg-gray-800 text-white'>AB+</option>
                            <option value="AB_NEGATIVE" className='bg-gray-800 text-white'>AB-</option>
                        </select>
                        <label htmlFor="bloodGroup" className='absolute text-sm duration-300 transform -translate scale-75 top-3 -z-10 origin-left peer-focus:left-0 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-6'>BloodGroup</label>
                    </div>

                    <div className='relative my-4'>
                        <input
                            type="text"
                            className='block w-full py-2.5 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-blur-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-500 peer'
                            placeholder=''
                            name="username"
                            id="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                        />
                        <label htmlFor="username" className='absolute text-sm duration-300 transform -translate scale-75 top-3 -z-10 origin-left peer-focus:left-0 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-6'>Username</label>
                    </div>

                    <div className='relative my-4'>
                        <input
                            type="password"
                            className='block w-full py-2.5 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-blur-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-500 peer'
                            placeholder=''
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                        <label htmlFor="password" className='absolute text-sm duration-300 transform -translate scale-75 top-3 -z-10 origin-left peer-focus:left-0 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-6'>Password</label>
                    </div>

                    <div className='flex items-center my-4'>
                        <input
                            type="checkbox"
                            name="agreeToTerms"
                            id="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleInputChange}
                            className='mr-2 w-4 h-4 text-blue-600 bg-transparent border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
                            required
                        />
                        <label htmlFor="agreeToTerms" className='text-sm text-white'>
                            I agree to the <span className='text-blue-400 hover:text-blue-300 cursor-pointer'>Terms and Conditions</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className='w-full mb-4 mt-6 text-[18px] rounded bg-blue-500 py-2 hover:bg-blue-600 transition-colors duration-300 active:scale-90'
                        disabled={!formData.agreeToTerms}
                    >
                        Sign Up
                    </button>
                </form>

                <div className='text-center'>
                    <Link to="/login" className='text-[12px]'>
                        Already have an account? <span className='font-bold'>Login</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Signup