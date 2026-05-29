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

  getMyAppointments(page = 0, size = 15) {
    return API.get("/patients/appointments", { params: { page, size } });
  },

  getDoctorAppointments(doctorId, page = 0, size = 15) {
    const params = { page, size };
    if (doctorId) params.doctorId = doctorId;
    return API.get("/doctor/appointments", { params });
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

  createPrescription(appointmentId, payload) {
    return API.post(`/doctor/appointments/${appointmentId}/prescription`, payload);
  },

  updatePrescription(appointmentId, payload) {
    return API.put(`/doctor/appointments/${appointmentId}/prescription`, payload);
  },

  getDoctorPrescription(appointmentId) {
    return API.get(`/doctor/appointments/${appointmentId}/prescription`);
  },

  retryPrescriptionGeneration(appointmentId) {
    return API.post(`/doctor/appointments/${appointmentId}/prescription/retry`);
  },

  getPatientPrescription(appointmentId) {
    return API.get(`/patients/appointments/${appointmentId}/prescription`);
  },

  getReceptionistAppointments(params = {}) {
    return API.get("/receptionist/appointments", { params });
  },

  searchReceptionistAppointments(params = {}) {
    return API.get("/receptionist/appointments/search", { params });
  },

  getReceptionistAppointment(appointmentId) {
    return API.get(`/receptionist/appointments/${appointmentId}`);
  },

  updateReceptionistStatus(appointmentId, status) {
    return API.put(`/receptionist/appointments/${appointmentId}/status?status=${status}`);
  },

  getDepartmentQueue(params = {}) {
    return API.get("/receptionist/queue", { params });
  },

  getDoctorQueue(doctorId, params = {}) {
    return API.get(`/receptionist/queue/doctors/${doctorId}`, { params });
  },

  createPaymentIntentForDoctor(doctorId, payload) {
    return API.post(`/payments/create-for-doctor/${doctorId}`, payload);
  },

  confirmAndBook(payload, paymentIntentId) {
    return API.post(`/payments/confirm-and-book?paymentIntentId=${paymentIntentId}`, payload);
  },

  verifyPayment(paymentIntentId) {
    return API.get(`/payments/verify/${paymentIntentId}`);
  },

  createStripeCheckoutSession(doctorId, payload) {
    return API.post(`/payments/create-stripe-checkout-session/${doctorId}`, payload);
  },

  confirmStripePayment(payload) {
    return API.post(`/payments/confirm-stripe-payment`, payload);
  },
};

export default appointmentApi;
