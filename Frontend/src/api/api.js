import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
const ACCESS_TOKEN_COOKIE = "hmsAccessToken";
const REFRESH_TOKEN_COOKIE = "hmsRefreshToken";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const getCookie = (name) => {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${encodeURIComponent(name)}=`));
  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
};

const setCookie = (name, value, maxAge = COOKIE_MAX_AGE_SECONDS) => {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
};

const deleteCookie = (name) => {
  document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/; SameSite=Lax`;
};

export const getAccessToken = () => getCookie(ACCESS_TOKEN_COOKIE) || localStorage.getItem("token");
export const getRefreshToken = () => getCookie(REFRESH_TOKEN_COOKIE) || localStorage.getItem("refreshToken");

export const saveAuthTokens = ({ token, refreshToken }) => {
  if (token) {
    setCookie(ACCESS_TOKEN_COOKIE, token);
    localStorage.removeItem("token");
  }
  if (refreshToken) {
    setCookie(REFRESH_TOKEN_COOKIE, refreshToken);
    localStorage.removeItem("refreshToken");
  }
};

export const clearAuthTokens = () => {
  deleteCookie(ACCESS_TOKEN_COOKIE);
  deleteCookie(REFRESH_TOKEN_COOKIE);
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Auto attach token to every request
API.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let refreshPromise = null;

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const refreshToken = getRefreshToken();
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/login")
      || originalRequest?.url?.includes("/auth/refresh")
      || originalRequest?.url?.includes("/auth/logout");

    if (status !== 401 || !refreshToken || originalRequest?._retry || originalRequest?._skipAuthRefresh || isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= API.post("/auth/refresh", { refreshToken }, { _skipAuthRefresh: true })
        .then((response) => {
          saveAuthTokens({
            token: response.data.token,
            refreshToken: response.data.refreshToken,
          });
          return response.data.token;
        })
        .finally(() => {
          refreshPromise = null;
        });

      const newAccessToken = await refreshPromise;
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return API(originalRequest);
    } catch (refreshError) {
      clearAuthTokens();
      window.dispatchEvent(new Event("hms:auth-expired"));
      return Promise.reject(refreshError);
    }
  }
);

export const authAPI = {
  logout: (refreshToken) => API.post("/auth/logout", { refreshToken }, { _skipAuthRefresh: true }),
};

// Forgot Password API Endpoints
export const forgotPasswordAPI = {
  sendOtp: (username) => API.post('/auth/forgot-password', { username }),
  resendOtp: (username) => API.post('/auth/resend-otp', { username }),
  verifyOtp: (email, otp) => API.post('/auth/verify-otp', { email, otp }),
  resetPassword: (email, newPassword, confirmPassword) => 
    API.post('/auth/reset-password', { email, newPassword, confirmPassword })
};

// Signup Magic Link API Endpoints
export const signupAPI = {
  requestMagicLink: (email, cfTurnstileToken) =>
    API.post('/auth/signup-link', { email, cfTurnstileToken }),

  completeMagicLinkSignup: (payload) => API.post('/auth/signup/complete', payload),
};

// Doctor API Endpoints
export const doctorAPI = {
  getProfile: () => API.get('/doctor/profile'),
  getMyDepartments: () => API.get('/doctor/my-departments'),
  updateStamp: (formData) => API.post('/doctor/profile/stamp', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const receptionistAPI = {
  getProfile: () => API.get('/receptionist/profile'),
};

// Patient API Endpoints
export const patientAPI = {
  getProfile: () => API.get('/patients/profile'),
  updateProfile: (patientUpdateRequest) => API.put('/patients/profile', patientUpdateRequest),
  getProfileCompletionStatus: () => API.get('/patients/profile/completion-status'),
  register: (patientRequest) => API.post('/patients/register', patientRequest),
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

export const notificationAPI = {
  getList: (size = 10) => API.get('/user/notifications', { params: { size } }),
  getUnreadCount: () => API.get('/user/notifications/unread-count'),
  markRead: (id) => API.put(`/user/notifications/${id}/read`),
  markAllRead: () => API.put('/user/notifications/read-all'),
};

export default API;
