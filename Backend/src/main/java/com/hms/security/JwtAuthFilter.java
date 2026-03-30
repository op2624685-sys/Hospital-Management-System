package com.hms.security;

import java.io.IOException;
import java.util.Set;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;
import com.hms.entity.User;
import com.hms.error.UnauthorizedException;
import com.hms.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Set<String> PUBLIC_PATH_PREFIXES = Set.of(
            "/public/",
            "/auth/",
            "/swagger-ui/",
            "/v3/api-docs/"
    );

    private final UserRepository userRepository;
    private final AuthUtil authUtil;
    private final HandlerExceptionResolver handlerExceptionResolver;

    public JwtAuthFilter(UserRepository userRepository, AuthUtil authUtil,
                         @Qualifier("handlerExceptionResolver") HandlerExceptionResolver handlerExceptionResolver) {
        this.userRepository = userRepository;
        this.authUtil = authUtil;
        this.handlerExceptionResolver = handlerExceptionResolver;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        boolean isPublicEndpoint = isPublicEndpoint(request.getServletPath());
        try {
            final String requestTokenHeader = request.getHeader("Authorization");

            if (requestTokenHeader == null || !requestTokenHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            String token = requestTokenHeader.substring(7);
            String username = authUtil.getUsernameFromToken(token);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                User user = userRepository.findByUsernameIgnoreCase(username)
                        .orElseThrow(() -> new UnauthorizedException("Authenticated user no longer exists"));
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken 
                = new UsernamePasswordAuthenticationToken(
                        user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
            filterChain.doFilter(request, response);
            
        } catch (Exception ex) {
            if (isPublicEndpoint) {
                // If token is invalid/expired on a public endpoint, proceed unauthenticated.
                filterChain.doFilter(request, response);
                return;
            }
            handlerExceptionResolver.resolveException(request, response, null, ex);
        }
    }

    private boolean isPublicEndpoint(String uri) {
        if (uri == null) {
            return false;
        }
        if ("/swagger-ui.html".equals(uri)) {
            return true;
        }
        return PUBLIC_PATH_PREFIXES.stream().anyMatch(uri::startsWith);
    }

}
