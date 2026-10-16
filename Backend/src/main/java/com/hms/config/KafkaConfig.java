package com.hms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.TopicBuilder;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.NewTopic;

@Configuration
@EnableKafka
@Slf4j
public class KafkaConfig {

    // ==================== Topic Names ====================
    public static final String RATING_TOPIC = "doctor-rating-events";
    public static final int RATING_PARTITIONS = 2;
    public static final short RATING_REPLICAS = 1;
    public static final String PRESCRIPTION_GENERATION_TOPIC = "prescription-generation-requested";

    // Consolidated Appointment event topic
    public static final String APPOINTMENT_EVENTS_TOPIC = "appointment-events";
    public static final String APPOINTMENT_DLT_TOPIC = "appointment.dlt";

    // Email outbox topic
    public static final String EMAIL_OUTBOX_TOPIC = "email.outbox";

    // ==================== Topic Definitions ====================
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
                .partitions(2)
                .replicas((short) 1)
                .build();
    }

    @Bean
    public NewTopic appointmentEventsTopic() {
        return TopicBuilder.name(APPOINTMENT_EVENTS_TOPIC)
                .partitions(2)
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

    @Bean
    public NewTopic emailOutboxTopic() {
        return TopicBuilder.name(EMAIL_OUTBOX_TOPIC)
                .partitions(2)
                .replicas((short) 1)
                .build();
    }
}
