package com.otakushop.controller;

import com.otakushop.dto.NotificationResponse;
import com.otakushop.security.CurrentUser;
import com.otakushop.security.UserPrincipal;
import com.otakushop.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notificaciones", description = "Gestión de notificaciones de usuario")
@SecurityRequirement(name = "Bearer Authentication")
public class NotificationController {
    
    private final NotificationService notificationService;
    
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener todas las notificaciones del usuario")
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<NotificationResponse> notifications = notificationService.getUserNotifications(
            currentUser.getId(), page, size
        );
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener notificaciones no leídas")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @CurrentUser UserPrincipal currentUser) {
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(
            currentUser.getId()
        );
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/unread/count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener cantidad de notificaciones no leídas")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @CurrentUser UserPrincipal currentUser) {
        Long count = notificationService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }
    
    @PutMapping("/{notificationId}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Marcar notificación como leída")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long notificationId,
            @CurrentUser UserPrincipal currentUser) {
        notificationService.markAsRead(notificationId, currentUser.getId());
        return ResponseEntity.ok(Map.of("message", "Notificación marcada como leída"));
    }
    
    @PutMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Marcar todas las notificaciones como leídas")
    public ResponseEntity<?> markAllAsRead(@CurrentUser UserPrincipal currentUser) {
        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok(Map.of("message", "Todas las notificaciones marcadas como leídas"));
    }
    
    @DeleteMapping("/{notificationId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Eliminar notificación")
    public ResponseEntity<?> deleteNotification(
            @PathVariable Long notificationId,
            @CurrentUser UserPrincipal currentUser) {
        notificationService.deleteNotification(notificationId, currentUser.getId());
        return ResponseEntity.ok(Map.of("message", "Notificación eliminada"));
    }
    
    // WebSocket endpoint para suscripción a notificaciones
    @MessageMapping("/notifications/subscribe")
    @SendTo("/topic/notifications")
    public NotificationResponse subscribeToNotifications() {
        // Este método permite a los clientes suscribirse a notificaciones en tiempo real
        return null;
    }
}
