import React, { useState } from 'react';
import API from '../../api/api';
import { Link } from 'react-router-dom';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../context/AuthContext';
const Login = () => {

    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await API.post('/auth/login', {
                username: username,
                password: password
            });

            // If backend returns JWT token
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("userId", response.data.userId);
                localStorage.setItem("roles", JSON.stringify(response.data.roles));

                login(response.data);

                toast.success("Login successful!");
                const userRoles = response.data.roles || [];
                window.location.href = userRoles.includes("ADMIN") ? "/admin" : "/";

            }

        } catch (error) {
            toast.warn("Login failed!");
            console.error(error);
        }
    };

    return (
        <div className='h-screen flex items-center justify-center bg-cover'
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1545569341-9eb8b30979d9')" }}>

            <div className='border-2 border-black rounded-xl p-8 shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-30 relative '>

                <h1 className='text-4xl font-bold text-center p-3 mb-6'>Login</h1>

                {/* CONNECT FORM HERE */}
                <form onSubmit={handleLogin}>

                    <div className='relative my-4'>
                        <input
                            type="text"
                            className='block w-72 py-2.5 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-white focus:border-blue-500 peer'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <label className='absolute text-sm duration-300 transform -translate scale-75 top-3 -z-10 origin-left peer-focus:text-blue-500'>
                            Username
                        </label>
                    </div>

                    <div className='relative my-4'>
                        <input
                            type="password"
                            className='block w-72 py-2.5 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-white focus:border-blue-500 peer'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <label className='absolute text-sm duration-300 transform -translate scale-75 top-3 -z-10 origin-left peer-focus:text-blue-500'>
                            Password
                        </label>
                    </div>
                    <button
                        type="submit"
                        className='w-full mb-4 mt-6 text-[18px] rounded bg-blue-500 py-2 hover:bg-blue-600 transition-colors duration-300 active:scale-90'>
                        Login
                    </button>
                </form>

                <div>
                    <Link to="/forgotpassword" className='text-[11px] font-bold'>
                        Forgot Password*
                    </Link>
                </div>
                <div>
                    <Link to="/signup" className='text-[12px]'>
                        Don't have an account? <span className='font-bold'>Sign Up</span>
                    </Link>
                </div>

            </div>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
        </div>
    );
};

export default Login;
