import API from "./api";

export const reviewsAPI = {
  /** Submit or update a review (PATIENT only — JWT required) */
  submitReview(doctorId, payload) {
    return API.post(`/reviews/doctors/${doctorId}`, payload);
  },

  /** Paginated reviews list for a doctor (public) */
  getReviews(doctorId, page = 0, size = 10) {
    return API.get(`/reviews/doctors/${doctorId}`, { params: { page, size } });
  },

  /** Cached rating summary for a doctor (public) */
  getRatingSummary(doctorId) {
    return API.get(`/reviews/doctors/${doctorId}/summary`);
  },
};

export default reviewsAPI;
