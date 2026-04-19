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

    @Bean
    public NewTopic doctorRatingTopic() {
        return TopicBuilder.name(RATING_TOPIC)
                .partitions(RATING_PARTITIONS)
                .replicas(RATING_REPLICAS)
                .build();
    }
}
