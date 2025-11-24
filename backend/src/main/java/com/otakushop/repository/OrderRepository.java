package com.otakushop.repository;

import com.otakushop.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    
    /**
     * Prevenir N+1 queries cargando items con @EntityGraph
     */
    @EntityGraph(attributePaths = {"items", "items.product", "user"})
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId")
    List<Order> findByUserIdWithItems(@Param("userId") Long userId);
    
    /**
     * Prevenir N+1 queries al obtener orden individual
     */
    @EntityGraph(attributePaths = {"items", "items.product", "user"})
    @Query("SELECT o FROM Order o WHERE o.id = :orderId")
    Optional<Order> findByIdWithItems(@Param("orderId") Long orderId);
}
