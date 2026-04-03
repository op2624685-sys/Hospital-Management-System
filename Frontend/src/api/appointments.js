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

  // Payment methods
  createPaymentIntentForDoctor(doctorId, payload) {
    return API.post(`/payments/create-for-doctor/${doctorId}`, payload);
  },
  initiateUpiPaymentForDoctor(doctorId, payload) {
    return API.post(`/payments/initiate-upi/${doctorId}`, payload);
  },
  confirmAndBook(payload, paymentIntentId) {
    return API.post(`/payments/confirm-and-book?paymentIntentId=${paymentIntentId}`, payload);
  },
  confirmUpiAndBook(payload, transactionId) {
    return API.post(`/payments/confirm-upi-and-book?transactionId=${encodeURIComponent(transactionId)}`, payload);
  },
  getUpiOrderStatus(orderId) {
    return API.get(`/payments/upi/order/${orderId}`);
  },
  verifyPayment(paymentIntentId) {
    return API.get(`/payments/verify/${paymentIntentId}`);
  },

  // Stripe Checkout methods
  createStripeCheckoutSession(doctorId, payload) {
    return API.post(`/payments/create-stripe-checkout-session/${doctorId}`, payload);
  },
  confirmStripePayment(payload) {
    return API.post(`/payments/confirm-stripe-payment`, payload);
  },
};

export default appointmentApi;
