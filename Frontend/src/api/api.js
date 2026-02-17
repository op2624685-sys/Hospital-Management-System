import axios from 'axios';

// ⚙️ CONFIGURATION - Change this to your backend URL
const API_BASE_URL = 'http://localhost:5000/api'; // ← CHANGE THIS TO YOUR BACKEND URL

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - Automatically adds token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden - No permission
    if (error.response?.status === 403) {
      console.error('Access denied');
    }
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server error');
    }
    
    return Promise.reject(error);
  }
);

// ==================== AUTH SERVICES ====================

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Sign Up
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset Password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// ==================== USER SERVICES ====================

export const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/user/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.put('/user/change-password', { oldPassword, newPassword });
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    const response = await api.post('/user/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ==================== PATIENT SERVICES ====================

export const patientService = {
  // Get all patients (Admin/Doctor)
  getAllPatients: async (page = 1, limit = 10, search = '') => {
    const response = await api.get('/patients', {
      params: { page, limit, search },
    });
    return response.data;
  },

  // Get single patient
  getPatient: async (patientId) => {
    const response = await api.get(`/patients/${patientId}`);
    return response.data;
  },

  // Create patient
  createPatient: async (patientData) => {
    const response = await api.post('/patients', patientData);
    return response.data;
  },

  // Update patient
  updatePatient: async (patientId, patientData) => {
    const response = await api.put(`/patients/${patientId}`, patientData);
    return response.data;
  },

  // Delete patient
  deletePatient: async (patientId) => {
    const response = await api.delete(`/patients/${patientId}`);
    return response.data;
  },

  // Get patient medical history
  getMedicalHistory: async (patientId) => {
    const response = await api.get(`/patients/${patientId}/medical-history`);
    return response.data;
  },
};

// ==================== DOCTOR SERVICES ====================

export const doctorService = {
  // Get all doctors
  getAllDoctors: async (specialty = '', available = '') => {
    const response = await api.get('/doctors', {
      params: { specialty, available },
    });
    return response.data;
  },

  // Get single doctor
  getDoctor: async (doctorId) => {
    const response = await api.get(`/doctors/${doctorId}`);
    return response.data;
  },

  // Create doctor
  createDoctor: async (doctorData) => {
    const response = await api.post('/doctors', doctorData);
    return response.data;
  },

  // Update doctor
  updateDoctor: async (doctorId, doctorData) => {
    const response = await api.put(`/doctors/${doctorId}`, doctorData);
    return response.data;
  },

  // Delete doctor
  deleteDoctor: async (doctorId) => {
    const response = await api.delete(`/doctors/${doctorId}`);
    return response.data;
  },

  // Get doctor's schedule
  getSchedule: async (doctorId, date) => {
    const response = await api.get(`/doctors/${doctorId}/schedule`, {
      params: { date },
    });
    return response.data;
  },
};

// ==================== APPOINTMENT SERVICES ====================

export const appointmentService = {
  // Get all appointments
  getAllAppointments: async (status = '', date = '') => {
    const response = await api.get('/appointments', {
      params: { status, date },
    });
    return response.data;
  },

  // Get single appointment
  getAppointment: async (appointmentId) => {
    const response = await api.get(`/appointments/${appointmentId}`);
    return response.data;
  },

  // Create appointment
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  // Update appointment
  updateAppointment: async (appointmentId, appointmentData) => {
    const response = await api.put(`/appointments/${appointmentId}`, appointmentData);
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId, reason) => {
    const response = await api.put(`/appointments/${appointmentId}/cancel`, { reason });
    return response.data;
  },

  // Complete appointment
  completeAppointment: async (appointmentId, notes) => {
    const response = await api.put(`/appointments/${appointmentId}/complete`, { notes });
    return response.data;
  },

  // Get my appointments (for patients/doctors)
  getMyAppointments: async () => {
    const response = await api.get('/appointments/my-appointments');
    return response.data;
  },
};

// ==================== ADMIN SERVICES ====================

export const adminService = {
  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // Get all users
  getAllUsers: async (role = '', page = 1, limit = 10) => {
    const response = await api.get('/admin/users', {
      params: { role, page, limit },
    });
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId, newRole) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role: newRole });
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Get system logs
  getSystemLogs: async (page = 1, limit = 50) => {
    const response = await api.get('/admin/logs', {
      params: { page, limit },
    });
    return response.data;
  },
};

// ==================== MEDICAL RECORDS SERVICES ====================

export const medicalRecordService = {
  // Get patient's medical records
  getPatientRecords: async (patientId) => {
    const response = await api.get(`/medical-records/patient/${patientId}`);
    return response.data;
  },

  // Create medical record
  createRecord: async (recordData) => {
    const response = await api.post('/medical-records', recordData);
    return response.data;
  },

  // Update medical record
  updateRecord: async (recordId, recordData) => {
    const response = await api.put(`/medical-records/${recordId}`, recordData);
    return response.data;
  },

  // Delete medical record
  deleteRecord: async (recordId) => {
    const response = await api.delete(`/medical-records/${recordId}`);
    return response.data;
  },

  // Upload medical document
  uploadDocument: async (recordId, file) => {
    const formData = new FormData();
    formData.append('document', file);
    const response = await api.post(`/medical-records/${recordId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ==================== PRESCRIPTION SERVICES ====================

export const prescriptionService = {
  // Get prescriptions
  getPrescriptions: async (patientId) => {
    const response = await api.get('/prescriptions', {
      params: { patientId },
    });
    return response.data;
  },

  // Create prescription
  createPrescription: async (prescriptionData) => {
    const response = await api.post('/prescriptions', prescriptionData);
    return response.data;
  },

  // Update prescription
  updatePrescription: async (prescriptionId, prescriptionData) => {
    const response = await api.put(`/prescriptions/${prescriptionId}`, prescriptionData);
    return response.data;
  },

  // Delete prescription
  deletePrescription: async (prescriptionId) => {
    const response = await api.delete(`/prescriptions/${prescriptionId}`);
    return response.data;
  },
};

// ==================== BILLING SERVICES ====================

export const billingService = {
  // Get invoices
  getInvoices: async (patientId = '', status = '') => {
    const response = await api.get('/billing/invoices', {
      params: { patientId, status },
    });
    return response.data;
  },

  // Get single invoice
  getInvoice: async (invoiceId) => {
    const response = await api.get(`/billing/invoices/${invoiceId}`);
    return response.data;
  },

  // Create invoice
  createInvoice: async (invoiceData) => {
    const response = await api.post('/billing/invoices', invoiceData);
    return response.data;
  },

  // Update invoice
  updateInvoice: async (invoiceId, invoiceData) => {
    const response = await api.put(`/billing/invoices/${invoiceId}`, invoiceData);
    return response.data;
  },

  // Process payment
  processPayment: async (invoiceId, paymentData) => {
    const response = await api.post(`/billing/invoices/${invoiceId}/payment`, paymentData);
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async (patientId) => {
    const response = await api.get('/billing/payment-history', {
      params: { patientId },
    });
    return response.data;
  },
};

// ==================== NOTIFICATION SERVICES ====================

export const notificationService = {
  // Get notifications
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },
};

// Export the axios instance for custom requests
export default api;