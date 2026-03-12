import API from "./api";

export const appointmentApi = {
  create(payload) {
    return API.post("/patients/appointments", payload);
  },

  getByAppointmentId(appointmentId) {
    return API.get(`/patients/appointments/check/${appointmentId}`);
  },

  cancelByPatient(appointmentId) {
    return API.put(`/patients/appointments/${appointmentId}/cancel`);
  },

  getMyAppointments() {
    return API.get("/patients/appointments");
  },

  getDoctorAppointments(doctorId) {
    const query = doctorId ? `?doctorId=${doctorId}` : "";
    return API.get(`/doctor/appointments${query}`);
  },

  getBookedSlots(doctorId, date) {
    return API.get(`/public/doctors/${doctorId}/booked-slots`, { params: { date } });
  },

  updateStatus(appointmentId, status) {
    return API.put(`/doctor/appointments/${appointmentId}/status?status=${status}`);
  },

  updateDetails(appointmentId, payload) {
    return API.put(`/doctor/appointments/${appointmentId}`, payload);
  },
};

export default appointmentApi;
