package com.hms.service.impl;

import com.hms.config.KafkaConfig;
import com.hms.dto.Request.ReviewRequest;
import com.hms.dto.Response.RatingSummaryResponse;
import com.hms.dto.Response.ReviewResponse;
import com.hms.entity.Doctor;
import com.hms.entity.DoctorReview;
import com.hms.entity.Patient;
import com.hms.event.RatingEvent;
import com.hms.repository.DoctorRatingSummaryRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.DoctorReviewRepository;
import com.hms.repository.PatientRepository;
import com.hms.service.DoctorReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorReviewServiceImpl implements DoctorReviewService {

    private final DoctorReviewRepository       reviewRepository;
    private final DoctorRatingSummaryRepository summaryRepository;
    private final DoctorRepository             doctorRepository;
    private final PatientRepository            patientRepository;
    private final KafkaTemplate<String, RatingEvent> kafkaTemplate;

    @Override
    @Transactional
    public ReviewResponse submitReview(Long patientId, Long doctorId, ReviewRequest request) {

        // 1. Validate doctor exists
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Doctor not found with id: " + doctorId));

        // 2. Validate patient exists
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Patient not found with id: " + patientId));

        // 3. Enforce: patient must have a COMPLETED appointment with this doctor
        if (!reviewRepository.hasCompletedAppointment(patientId, doctorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only rate doctors after completing an appointment with them.");
        }

        // 4. Upsert: one review per (patient, doctor) pair
        boolean isUpdate = false;
        DoctorReview review = reviewRepository
                .findByPatientIdAndDoctorId(patientId, doctorId)
                .orElse(DoctorReview.builder().patient(patient).doctor(doctor).build());

        if (review.getId() != null) {
            isUpdate = true;
        }

        review.setRating(request.rating());
        review.setComment(request.comment());
        review = reviewRepository.save(review);

        // 5. Publish Kafka event — returns immediately; consumer handles aggregation
        String eventType = isUpdate ? "UPDATED" : "CREATED";
        RatingEvent event = new RatingEvent(doctorId, patientId, review.getId(), request.rating(), eventType);
        kafkaTemplate.send(KafkaConfig.RATING_TOPIC, doctorId.toString(), event);
        log.info("Published {} RatingEvent for doctorId={} by patientId={}", eventType, doctorId, patientId);

        return toResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsForDoctor(Long doctorId, Pageable pageable) {
        return reviewRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Cacheable(value = "doctorRating", key = "#doctorId")
    @Transactional(readOnly = true)
    public RatingSummaryResponse getRatingSummary(Long doctorId) {
        return summaryRepository.findById(doctorId)
                .map(s -> new RatingSummaryResponse(s.getDoctorId(), s.getAverageRating(), s.getTotalReviews()))
                .orElse(new RatingSummaryResponse(doctorId, 0.0, 0L));
    }

    // ─── Internal helpers ────────────────────────────────────────────────────

    private ReviewResponse toResponse(DoctorReview r) {
        return new ReviewResponse(
                r.getId(),
                r.getPatient().getName(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }
}
