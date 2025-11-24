package com.otakushop.service;

import com.otakushop.dto.NotificationResponse;
import com.otakushop.entity.Notification;
import com.otakushop.entity.User;
import com.otakushop.exception.ResourceNotFoundException;
import com.otakushop.repository.NotificationRepository;
import com.otakushop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Transactional
    public NotificationResponse createNotification(Long userId, String title, String message, String type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(Notification.NotificationType.valueOf(type));
        
        Notification saved = notificationRepository.save(notification);
        
        // Enviar notificación en tiempo real via WebSocket
        NotificationResponse response = mapToResponse(saved);
        messagingTemplate.convertAndSendToUser(
            user.getEmail(),
            "/queue/notifications",
            response
        );
        
        return response;
    }
    
    public Page<NotificationResponse> getUserNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }
    
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }
    
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notificación no encontrada"));
        
        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("No tienes permiso para marcar esta notificación");
        }
        
        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }
    
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }
    
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notificación no encontrada"));
        
        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("No tienes permiso para eliminar esta notificación");
        }
        
        notificationRepository.delete(notification);
    }
    
    private NotificationResponse mapToResponse(Notification notification) {
        return new NotificationResponse(
            notification.getId(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getType().name(),
            notification.isRead(),
            notification.getCreatedAt(),
            notification.getReadAt(),
            notification.getMetadata()
        );
    }
}
