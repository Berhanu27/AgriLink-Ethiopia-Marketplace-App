package com.agrilink.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class DebugAuthorizationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(DebugAuthorizationFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        if (path.contains("/api/users")) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            logger.info("DebugAuthorizationFilter - {} {} - Auth: {}", method, path, auth);
            if (auth != null) {
                logger.info("  Principal: {}", auth.getPrincipal());
                logger.info("  Authorities: {}", auth.getAuthorities());
                logger.info("  Authenticated: {}", auth.isAuthenticated());
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
