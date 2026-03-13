import API from "./api";

export const adminApi = {
  // Get all patients (with pagination)
  getPatients(page = 0, size = 10) {
    return API.get(`/admin/patients?page=${page}&size=${size}`);
  },

  // Get recent appointments for admin's branch
  getAppointments(page = 0, size = 10) {
    return API.get(`/admin/appointments?page=${page}&size=${size}`);
  },

  // Get doctors for admin's branch
  getDoctors(params = {}) {
    const query = new URLSearchParams(params).toString();
    return API.get(`/admin/doctors${query ? `?${query}` : ""}`);
  },

  // Overview stats for admin dashboard
  getOverview() {
    return API.get("/admin/overview");
  },

  // Departments for admin branch
  getDepartments() {
    return API.get("/admin/departments");
  },

  // Create new department
  createDepartment(payload) {
    return API.post("/admin/createNewDepartment", payload);
  },

  // Onboard new doctor (branch auto-assigned on backend for admins)
  onboardDoctor(payload) {
    return API.post("/admin/onBoardNewDoctor", payload);
  },
};

export default adminApi;
