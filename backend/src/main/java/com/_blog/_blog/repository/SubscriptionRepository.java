package com._blog._blog.repository;

import com._blog._blog.entity.Subscription;
import com._blog._blog.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    
    // Check if a subscription exists
    boolean existsBySubscriberAndSubscribedTo(User subscriber, User subscribedTo);
    
    // Find a specific subscription
    Optional<Subscription> findBySubscriberAndSubscribedTo(User subscriber, User subscribedTo);
    
    // Get all users that a user is subscribed to
    List<Subscription> findBySubscriber(User subscriber);
    
    // Get all subscribers of a user
    List<Subscription> findBySubscribedTo(User subscribedTo);
    
    // Count subscribers
    long countBySubscribedTo(User subscribedTo);
    
    // Count subscriptions (following count)
    long countBySubscriber(User subscriber);
    
    // Delete a subscription
    void deleteBySubscriberAndSubscribedTo(User subscriber, User subscribedTo);
    
    // Get users IDs that the current user is subscribed to
    @Query("SELECT s.subscribedTo.id FROM Subscription s WHERE s.subscriber.id = :userId")
    List<Long> findSubscribedToUserIds(@Param("userId") Long userId);
    
    // Delete all subscriptions by/to a user (for cascade delete)
    void deleteBySubscriber(User subscriber);
    void deleteBySubscribedTo(User subscribedTo);
}
