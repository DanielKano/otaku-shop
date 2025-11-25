package com.otakushop.scheduler;

import com.otakushop.repository.StockReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

/**
 * Scheduler para limpiar reservas de stock expiradas
 * Ejecuta cada 5 minutos para liberar stock que no fue confirmado en orden
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StockReservationScheduler {
    
    private final StockReservationRepository stockReservationRepository;
    
    /**
     * Ejecuta cada 5 minutos para liberar reservas expiradas
     * Patrón: fixedRate en milisegundos (300000ms = 5 minutos)
     */
    @Scheduled(fixedRate = 300000, initialDelay = 60000)
    @Transactional
    public void releaseExpiredReservations() {
        try {
            LocalDateTime now = LocalDateTime.now();
            
            // Buscar reservas que expiraron y NO están confirmadas en orden
            var expiredReservations = stockReservationRepository
                .findByExpiresAtBeforeAndOrderIdIsNull(now);
            
            if (!expiredReservations.isEmpty()) {
                stockReservationRepository.deleteAll(expiredReservations);
                log.info("✅ Liberadas {} reservas de stock expiradas", expiredReservations.size());
            } else {
                log.debug("No expired stock reservations to release");
            }
            
        } catch (Exception e) {
            log.error("❌ Error liberando reservas expiradas", e);
        }
    }
}
