package com.hms.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    public static final String RATING_TOPIC        = "doctor-rating-events";
    public static final int    RATING_PARTITIONS   = 3;
    public static final short  RATING_REPLICAS     = 1; 
    public static final String PRESCRIPTION_GENERATION_TOPIC = "prescription-generation-requested";

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
}
