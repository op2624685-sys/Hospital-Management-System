package com.hms.security;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import com.hms.repository.UserRepository;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.servlet.HandlerExceptionResolver;

class JwtAuthFilterTest {

    @Test
    void invalidTokenOnPublicRouteProceedsUnauthenticated() throws Exception {
        UserRepository userRepository = mock(UserRepository.class);
        AuthUtil authUtil = mock(AuthUtil.class);
        HandlerExceptionResolver resolver = mock(HandlerExceptionResolver.class);
        JwtAuthFilter filter = new JwtAuthFilter(userRepository, authUtil, resolver);
        FilterChain chain = mock(FilterChain.class);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/public/doctors");
        request.setServletPath("/public/doctors");
        request.addHeader("Authorization", "Bearer invalid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(authUtil.getUsernameFromToken(anyString())).thenThrow(new RuntimeException("invalid token"));

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
    }

    @Test
    void invalidTokenOnProtectedRouteUsesExceptionResolver() throws Exception {
        UserRepository userRepository = mock(UserRepository.class);
        AuthUtil authUtil = mock(AuthUtil.class);
        HandlerExceptionResolver resolver = mock(HandlerExceptionResolver.class);
        JwtAuthFilter filter = new JwtAuthFilter(userRepository, authUtil, resolver);
        FilterChain chain = mock(FilterChain.class);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/doctor/profile");
        request.setServletPath("/doctor/profile");
        request.addHeader("Authorization", "Bearer invalid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        doThrow(new RuntimeException("invalid token")).when(authUtil).getUsernameFromToken(anyString());

        filter.doFilter(request, response, chain);

        verify(resolver).resolveException(any(), any(), any(), any());
    }
}
