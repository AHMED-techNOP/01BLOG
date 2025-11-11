package com._blog._blog.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // User who receives the notification
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post; // Post that triggered the notification
    
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // Optional: notification type and message
    @Column(name = "notification_type")
    private String notificationType;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    // Custom constructor
    public Notification(User user, Post post, String notificationType, String message) {
        this.user = user;
        this.post = post;
        this.notificationType = notificationType;
        this.message = message;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }
}
