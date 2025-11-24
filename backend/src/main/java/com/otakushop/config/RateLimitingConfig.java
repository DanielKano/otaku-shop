package com.otakushop.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class RateLimitingConfig {

    /**
     * Cache de buckets por IP para rate limiting
     */
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    /**
     * Resuelve un bucket para la IP dada, creándolo si no existe
     * Límite: 100 requests por minuto por IP
     */
    public Bucket resolveBucket(String ip) {
        return cache.computeIfAbsent(ip, k -> createNewBucket());
    }

    /**
     * Resuelve un bucket para autenticación (más restrictivo)
     * Límite: 5 intentos por minuto por IP
     */
    public Bucket resolveAuthBucket(String ip) {
        return cache.computeIfAbsent("auth:" + ip, k -> createAuthBucket());
    }

    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1)));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private Bucket createAuthBucket() {
        // Más restrictivo para endpoints de autenticación
        Bandwidth limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1)));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
