package com.hms.listener;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import java.security.Principal;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

/**
 * Listens to WebSocket connection/disconnection events.
 * Tracks active user connections for targeted messaging.
 */
@Component
@Slf4j
public class WebSocketEventListener {

    private static final Map<String, String> userSessionMap = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        String sessionId = event.getMessage().getHeaders().get("simpSessionId", String.class);
        Principal principal = event.getUser();
        
        if (principal != null) {
            String username = principal.getName();
            userSessionMap.put(username, sessionId);
            log.info("User connected: {} with session ID: {}", username, sessionId);
        } else {
            log.debug("Anonymous user connected with session ID: {}", sessionId);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String sessionId = event.getMessage().getHeaders().get("simpSessionId", String.class);
        Principal principal = event.getUser();
        
        if (principal != null) {
            String username = principal.getName();
            userSessionMap.remove(username);
            log.info("User disconnected: {} with session ID: {}", username, sessionId);
        } else {
            log.debug("Anonymous user disconnected with session ID: {}", sessionId);
        }
    }

    /**
     * Get active user sessions map for reference
     */
    public static Map<String, String> getActiveSessions() {
        return new ConcurrentHashMap<>(userSessionMap);
    }

    /**
     * Check if user is connected
     */
    public static boolean isUserConnected(String username) {
        return userSessionMap.containsKey(username);
    }
}
