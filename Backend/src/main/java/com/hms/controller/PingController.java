package com.hms.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

@RestController
public class PingController {

    /**
     * Lightweight endpoint to keep the server awake on Render free tier.
     * Does not interact with the database to save Neon DB compute hours.
     */
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}
