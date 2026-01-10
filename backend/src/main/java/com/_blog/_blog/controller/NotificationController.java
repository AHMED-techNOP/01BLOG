package com._blog._blog.controller;

import com._blog._blog.entity.Notification;
import com._blog._blog.entity.User;
import com._blog._blog.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:4200")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Get unread notifications for the current user
     */
    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications(@AuthenticationPrincipal User user) {
        try {
            List<Notification> notifications = notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
            
            List<Map<String, Object>> notificationDTOs = notifications.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(notificationDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error fetching unread notifications: " + e.getMessage()));
        }
    }

    /**
     * Mark a notification as read
     */
    @PutMapping("/{id}/read")
    @Transactional
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            notificationRepository.markAsRead(id, user.getId());
            return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error marking notification as read: " + e.getMessage()));
        }
    }

    /**
     * Mark all notifications as read
     */
    @PutMapping("/read-all")
    @Transactional
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal User user) {
        try {
            notificationRepository.markAllAsRead(user.getId());
            return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error marking all as read: " + e.getMessage()));
        }
    }

    /**
     * Convert Notification entity to DTO
     */
    private Map<String, Object> toDTO(Notification notification) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", notification.getId());
        dto.put("type", notification.getNotificationType());
        dto.put("message", notification.getMessage());
        dto.put("read", notification.getIsRead());
        dto.put("createdAt", notification.getCreatedAt());
        
        if (notification.getActor() != null) {
            dto.put("actorUsername", notification.getActor().getUsername());
        }
        
        if (notification.getPost() != null) {
            dto.put("postId", notification.getPost().getId());
            dto.put("postTitle", notification.getPost().getTitle());
        }
        
        return dto;
    }
}
