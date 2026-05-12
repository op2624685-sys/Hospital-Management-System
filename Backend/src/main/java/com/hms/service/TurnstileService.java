package com.hms.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.Map;

@Service
@Slf4j
public class TurnstileService {

    private static final String SITEVERIFY_URL =
            "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    @Value("${cloudflare.turnstile.secret-key}")
    private String secretKey;

    private final RestTemplate restTemplate;

    public TurnstileService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }



    /**
     * Verifies a Cloudflare Turnstile token by calling the siteverify API.
     *
     * @param token the cf-turnstile-response token submitted by the client
     * @return true if Cloudflare confirms the challenge was solved successfully
     */
    public boolean verify(String token) {
        if (token == null || token.isBlank()) {
            log.warn("Turnstile verification skipped — token is blank");
            return false;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("secret", secretKey);
            body.add("response", token);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    SITEVERIFY_URL, request, Map.class);

            if (response == null) {
                log.warn("Turnstile siteverify returned null response");
                return false;
            }

            Boolean success = (Boolean) response.get("success");
            if (Boolean.TRUE.equals(success)) {
                return true;
            }

            log.warn("Turnstile verification failed. Error codes: {}", response.get("error-codes"));
            return false;

        } catch (Exception e) {
            log.error("Error calling Cloudflare Turnstile siteverify: {}", e.getMessage());
            return false;
        }
    }
}
