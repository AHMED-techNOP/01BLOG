package com._blog._blog.repository;

import com._blog._blog.entity.Notification;
import com._blog._blog.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Get unread notifications for a user
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);
    
    // Mark notification as read
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :notificationId AND n.user.id = :userId")
    void markAsRead(@Param("notificationId") Long notificationId, @Param("userId") Long userId);
    
    // Mark all notifications as read for a user
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    void markAllAsRead(@Param("userId") Long userId);
    
    // Delete all notifications for a post
    void deleteByPost(com._blog._blog.entity.Post post);
    
    // Delete all notifications for/from a user (for cascade delete)
    void deleteByUser(User user);
    void deleteByActor(User actor);
}
