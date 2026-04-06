package com.agrilink.security;

import com.agrilink.user.model.User;
import com.agrilink.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        logger.info("JwtAuthFilter processing request to: {}", request.getRequestURI());
        
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwtService.parse(token);
                Long userId = Long.parseLong(claims.getSubject());
                logger.info("JWT Token parsed - User ID: {}", userId);
                
                User user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    logger.info("User found in DB: {} (ID: {})", user.getFullName(), userId);
                    logger.info("User roles from DB: {}", user.getRoles().stream().map(r -> r.getUserName()).collect(Collectors.toList()));
                    
                    Set<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                            .map(r -> new SimpleGrantedAuthority(r.getUserName()))
                            .collect(Collectors.toSet());
                    
                    logger.info("Authorities being set: {}", authorities.stream().map(a -> a.getAuthority()).collect(Collectors.toList()));
                    
                    // Set principal to user ID string so authentication.getName() returns the ID
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userId.toString(), null, authorities);
                    auth.setDetails(user); // Store user object in details for reference if needed
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    logger.info("Authentication set in SecurityContext");
                } else {
                    logger.warn("User not found in DB for ID: {}", userId);
                }
            } catch (Exception e) {
                logger.error("Error processing JWT token", e);
            }
        } else {
            logger.debug("No Bearer token found in Authorization header");
        }
        filterChain.doFilter(request, response);
    }
}
