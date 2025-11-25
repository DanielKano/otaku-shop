package com.otakushop.repository;

import com.otakushop.entity.StockReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockReservationRepository extends JpaRepository<StockReservation, Long> {
    
    /**
     * Obtiene la cantidad total reservada para un producto (no expiradas, no confirmadas)
     */
    @Query("""
        SELECT COALESCE(SUM(sr.quantity), 0)
        FROM StockReservation sr
        WHERE sr.product.id = :productId
        AND sr.expiresAt > CURRENT_TIMESTAMP
        AND sr.orderId IS NULL
    """)
    int sumQuantityByProductAndNotExpired(@Param("productId") Long productId);
    
    /**
     * Obtiene reservas expiradas que no han sido confirmadas en orden
     */
    List<StockReservation> findByExpiresAtBeforeAndOrderIdIsNull(LocalDateTime expiresAt);
    
    /**
     * Obtiene todas las reservas de un usuario para un producto
     */
    @Query("""
        SELECT sr FROM StockReservation sr
        WHERE sr.product.id = :productId
        AND sr.user.id = :userId
        AND sr.expiresAt > CURRENT_TIMESTAMP
        AND sr.orderId IS NULL
    """)
    List<StockReservation> findByProductAndUserAndNotExpired(
        @Param("productId") Long productId,
        @Param("userId") Long userId
    );
    
    /**
     * Obtiene todas las reservas de una sesión para un producto
     */
    @Query("""
        SELECT sr FROM StockReservation sr
        WHERE sr.product.id = :productId
        AND sr.sessionId = :sessionId
        AND sr.expiresAt > CURRENT_TIMESTAMP
        AND sr.orderId IS NULL
    """)
    List<StockReservation> findByProductAndSessionAndNotExpired(
        @Param("productId") Long productId,
        @Param("sessionId") String sessionId
    );
    
    /**
     * Obtiene reservas confirmadas en una orden
     */
    List<StockReservation> findByOrderId(Long orderId);
}
