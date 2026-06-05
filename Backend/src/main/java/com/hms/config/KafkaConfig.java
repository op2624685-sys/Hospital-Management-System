package com.hms.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.TopicBuilder;
import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableKafka
@Slf4j
public class KafkaConfig {

    // ==================== Topic Names ====================
    public static final String RATING_TOPIC = "doctor-rating-events";
    public static final int RATING_PARTITIONS = 3;
    public static final short RATING_REPLICAS = 1;
    public static final String PRESCRIPTION_GENERATION_TOPIC = "prescription-generation-requested";

    // Appointment event topics
    public static final String APPOINTMENT_PENDING_TOPIC = "appointment.pending";
    public static final String APPOINTMENT_CONFIRMED_TOPIC = "appointment.confirmed";
    public static final String APPOINTMENT_CANCELLED_TOPIC = "appointment.cancelled";
    public static final String APPOINTMENT_REFUND_TOPIC = "appointment.refund";
    public static final String APPOINTMENT_RESCHEDULED_TOPIC = "appointment.rescheduled";
    public static final String APPOINTMENT_DLT_TOPIC = "appointment.dlt";

    // Email outbox topic
    public static final String EMAIL_OUTBOX_TOPIC = "email.outbox";

    // ==================== Existing Topic Definitions ====================
    @Bean
    public NewTopic doctorRatingTopic() {
        return TopicBuilder.name(RATING_TOPIC)
                .partitions(RATING_PARTITIONS)
                .replicas(RATING_REPLICAS)
                .build();
    }

    @Bean
    public NewTopic prescriptionGenerationTopic() {
        return TopicBuilder.name(PRESCRIPTION_GENERATION_TOPIC)
                .partitions(3)
                .replicas((short) 1)
                .build();
    }

    // ==================== Appointment Event Topic Definitions ====================
    @Bean
    public NewTopic appointmentPendingTopic() {
        return TopicBuilder.name(APPOINTMENT_PENDING_TOPIC)
                .partitions(3)
                .replicas((short) 1)
                .build();
    }

    @Bean
    public NewTopic appointmentConfirmedTopic() {
        return TopicBuilder.name(APPOINTMENT_CONFIRMED_TOPIC)
                .partitions(3)
                .replicas((short) 1)
                .build();
    }

    @Bean
    public NewTopic appointmentCancelledTopic() {
        return TopicBuilder.name(APPOINTMENT_CANCELLED_TOPIC)
                .partitions(3)
                .replicas((short) 1)
                .build();
    }

    @Bean
    public NewTopic appointmentRefundTopic() {
        return TopicBuilder.name(APPOINTMENT_REFUND_TOPIC)
                .partitions(3)
                .replicas((short) 1)
                .build();
    }

    @Bean
    public NewTopic appointmentRescheduledTopic() {
        return TopicBuilder.name(APPOINTMENT_RESCHEDULED_TOPIC)
                .partitions(3)
                .replicas((short) 1)
                .build();
    }

    @Bean
    public NewTopic appointmentDltTopic() {
        return TopicBuilder.name(APPOINTMENT_DLT_TOPIC)
                .partitions(1)
                .replicas((short) 1)
                .build();
    }

    // ==================== Email Outbox Topic Definition ====================
    @Bean
    public NewTopic emailOutboxTopic() {
        return TopicBuilder.name(EMAIL_OUTBOX_TOPIC)
                .partitions(3)
                .replicas((short) 1)
                .build();
    }

}
