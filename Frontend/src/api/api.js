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

// Doctor API Endpoints
export const doctorAPI = {
  getProfile: () => API.get('/doctor/profile'),
  getMyDepartments: () => API.get('/doctor/my-departments'),
};

// Patient API Endpoints
export const patientAPI = {
  getProfile: () => API.get('/patients/profile'),
  updateProfile: (patientUpdateRequest) => API.put('/patients/profile', patientUpdateRequest),
  getProfileCompletionStatus: () => API.get('/patients/profile/completion-status'),
};

// Admin API Endpoints
export const adminAPI = {
  getProfile: () => API.get('/admin/profile'),
};

// User API Endpoints
export const userAPI = {
  getProfile: () => API.get('/user/profile'),
  updateProfilePhoto: (formData) => API.post('/user/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default API;
