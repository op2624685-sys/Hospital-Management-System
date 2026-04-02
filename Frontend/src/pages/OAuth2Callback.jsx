import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API from '../api/api';

const OAuth2Callback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem('token', token);
            
            // Fetch user profile to get roles and ID (since OAuth redirect only gives token for simplicity)
            // Or we could have passed them in the URL too, but fetching is safer.
            const fetchUserProfile = async () => {
                try {
                    // Assuming there's a /auth/me or similar endpoint. 
                    // If not, I'll check what's available.
                    const response = await API.get('/auth/me');
                    const userData = response.data;
                    
                    localStorage.setItem('userId', userData.id);
                    localStorage.setItem('roles', JSON.stringify(userData.roles));
                    
                    login({
                        userId: userData.id,
                        roles: userData.roles
                    });

                    toast.success('Login successful via OAuth');
                    
                    const userRoles = userData.roles || [];
                    if (userRoles.includes('HEADADMIN')) {
                        navigate('/head-admin');
                    } else if (userRoles.includes('ADMIN')) {
                        navigate('/admin');
                    } else if (userRoles.includes('DOCTOR')) {
                        navigate('/doctor/booked-details');
                    } else if (userRoles.includes('PATIENT')) {
                        navigate('/my-appointments');
                    } else {
                        navigate('/');
                    }
                } catch (error) {
                    console.error("Failed to fetch user profile after OAuth", error);
                    toast.error("Auth failed during profile sync");
                    navigate('/login');
                }
            };

            fetchUserProfile();
        } else {
            toast.error('Authentication failed');
            navigate('/login');
        }
    }, [location, navigate, login]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg font-medium">Completing authentication...</p>
                <p className="text-slate-400 text-sm">Please wait while we sync your profile.</p>
            </div>
        </div>
    );
};

export default OAuth2Callback;
