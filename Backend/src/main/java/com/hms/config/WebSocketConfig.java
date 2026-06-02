package com.hms.config;

import com.hms.entity.User;
import com.hms.repository.UserRepository;
import com.hms.security.AuthUtil;
import java.security.Principal;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration for real-time notifications.
 * Enables STOMP protocol over WebSocket with SockJS fallback.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final AuthUtil authUtil;
    private final UserRepository userRepository;
    private final CorsProperties corsProperties;

    public WebSocketConfig(AuthUtil authUtil, UserRepository userRepository, CorsProperties corsProperties) {
        this.authUtil = authUtil;
        this.userRepository = userRepository;
        this.corsProperties = corsProperties;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple in-memory message broker
        config.enableSimpleBroker("/topic", "/user");
        
        // Set prefix for messages sent to application-handled controllers
        config.setApplicationDestinationPrefixes("/app");
        
        // Set user destination prefix for direct user messaging
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register WebSocket endpoint with SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOrigins(corsProperties.getAllowedOrigins().toArray(String[]::new))
                .withSockJS()
                .setClientLibraryUrl("https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authorization = accessor.getFirstNativeHeader("Authorization");
                    if (authorization != null && authorization.startsWith("Bearer ")) {
                        String token = authorization.substring(7);
                        String username = authUtil.getUsernameFromToken(token);
                        User user = userRepository.findByUsernameIgnoreCase(username)
                                .orElseThrow(() -> new IllegalArgumentException("Authenticated user no longer exists"));
                        Principal principal = () -> user.getId().toString();
                        accessor.setUser(principal);
                    }
                }
                return message;
            }
        });
    }
}
