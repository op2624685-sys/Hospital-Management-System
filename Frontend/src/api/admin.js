import API from "./api";

export const adminApi = {
  // Get all patients (with pagination)
  getPatients(page = 0, size = 10) {
    return API.get(`/admin/patients?page=${page}&size=${size}`);
  },

  // Create new department
  createDepartment(payload) {
    return API.post("/admin/createNewDepartment", payload);
  },
};

export default adminApi;
