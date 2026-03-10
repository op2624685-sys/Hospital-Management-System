import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api/v1",
});

// Auto attach token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Forgot Password API Endpoints
export const forgotPasswordAPI = {
  sendOtp: (username) => API.post('/auth/forgot-password', { username }),
  resendOtp: (username) => API.post('/auth/resend-otp', { username }),
  verifyOtp: (email, otp) => API.post('/auth/verify-otp', { email, otp }),
  resetPassword: (email, newPassword, confirmPassword) => 
    API.post('/auth/reset-password', { email, newPassword, confirmPassword })
};

export default API;
