package com.agrilink.security;

import com.agrilink.user.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class JwtService {

    private final Key signingKey;
    private final long expirationMs;

    public JwtService(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.expiration-ms}") long expirationMs
    ) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(ensureBase64(secret)));
        this.expirationMs = expirationMs;
    }

    public String generate(User user) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);

        Map<String, Object> claims = Map.of(
                "roles", user.getRoles().stream().map(r -> r.getUserName()).collect(Collectors.toSet())
        );

        return Jwts.builder()
                .setSubject(user.getId().toString())
                .addClaims(claims)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private String ensureBase64(String secret) {
        // If already Base64, return; otherwise encode to Base64 for key generation
        try {
            Decoders.BASE64.decode(secret);
            return secret;
        } catch (Exception ignored) {
            return java.util.Base64.getEncoder().encodeToString(secret.getBytes());
        }
    }
}
