package com.hms.event;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

import com.hms.config.KafkaConfig;
import com.hms.service.PrescriptionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class PrescriptionGenerationEventConsumer {

    private final PrescriptionService prescriptionService;

    @KafkaListener(
            topics = KafkaConfig.PRESCRIPTION_GENERATION_TOPIC,
            groupId = "prescription-generator",
            properties = {
                    "spring.json.use.type.headers=false",
                    "spring.json.trusted.packages=com.hms.event",
                    "spring.json.value.default.type=com.hms.event.PrescriptionGenerationRequestedEvent"
            }
    )
    public void consume(PrescriptionGenerationRequestedEvent event, Acknowledgment ack) {
        try {
            log.info("Generating prescription PDF prescriptionId={} appointmentId={}",
                    event.prescriptionId(), event.appointmentId());
            prescriptionService.generateDocument(event.prescriptionId(), event.requestVersion());
            ack.acknowledge();
        } catch (Exception ex) {
            log.error("Failed to process prescription generation event prescriptionId={}: {}",
                    event.prescriptionId(), ex.getMessage(), ex);
            throw ex;
        }
    }
}
