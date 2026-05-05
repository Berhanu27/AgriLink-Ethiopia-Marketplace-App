package com.agrilink.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        
        if ((request.getRequestURI().contains("/api/users") || request.getRequestURI().contains("/api/delivery-requests")) && request.getMethod().equals("PATCH")) {
            ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
            
            try {
                filterChain.doFilter(wrappedRequest, response);
            } finally {
                byte[] buf = wrappedRequest.getContentAsByteArray();
                if (buf.length > 0) {
                    String payload = new String(buf, StandardCharsets.UTF_8);
                    logger.info("PATCH Request Body: {}", payload);
                    logger.info("Content-Type: {}", wrappedRequest.getContentType());
                    logger.info("Content-Length: {}", wrappedRequest.getContentLength());
                }
            }
        } else if (request.getRequestURI().contains("/api/delivery-requests")) {
            logger.info("DeliveryRequest {} {}", request.getMethod(), request.getRequestURI());
            logger.info("Authorization header: {}", request.getHeader("Authorization"));
            filterChain.doFilter(request, response);
        } else {
            filterChain.doFilter(request, response);
        }
    }
}
