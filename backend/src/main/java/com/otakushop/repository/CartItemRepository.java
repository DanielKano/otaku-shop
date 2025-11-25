package com.otakushop.repository;

import com.otakushop.entity.CartItem;
import com.otakushop.entity.Product;
import com.otakushop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    // Búsquedas por usuario logeado
    List<CartItem> findByUserId(Long userId);
    
    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);
    
    void deleteByUserId(Long userId);
    
    Long countByUserId(Long userId);
    
    // ✅ NUEVAS: Búsquedas para carrito anónimo (session_id)
    List<CartItem> findBySessionId(String sessionId);
    
    List<CartItem> findBySessionIdAndUserIsNull(String sessionId);
    
    Optional<CartItem> findBySessionIdAndProductId(String sessionId, Long productId);
    
    void deleteBySessionId(String sessionId);
    
    Long countBySessionId(String sessionId);
    
    // ✅ Búsqueda por User y Product (para merge)
    Optional<CartItem> findByUserAndProduct(User user, Product product);
    
    // ✅ Búsqueda por User OR SessionId (para obtener carrito)
    @Query("""
        SELECT ci FROM CartItem ci 
        WHERE (ci.user = :user AND :user IS NOT NULL) 
           OR (ci.sessionId = :sessionId AND :sessionId IS NOT NULL)
    """)
    List<CartItem> findByUserOrSessionId(@Param("user") User user, @Param("sessionId") String sessionId);
}
