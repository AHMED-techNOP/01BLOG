package com._blog._blog.controller;

import com._blog._blog.entity.Subscription;
import com._blog._blog.entity.User;
import com._blog._blog.repository.SubscriptionRepository;
import com._blog._blog.repository.UserRepository;
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
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Subscribe to a user
     */
    @PostMapping("/subscribe/{username}")
    @Transactional
    public ResponseEntity<?> subscribe(
            @PathVariable String username,
            @AuthenticationPrincipal User currentUser) {
        
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }

        // Find the user to subscribe to
        User userToSubscribe = userRepository.findByUsername(username)
                .orElse(null);
        
        if (userToSubscribe == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        // Can't subscribe to yourself
        if (currentUser.getId().equals(userToSubscribe.getId())) {
            return ResponseEntity.status(400).body(Map.of("error", "Cannot subscribe to yourself"));
        }

        // Check if already subscribed
        if (subscriptionRepository.existsBySubscriberAndSubscribedTo(currentUser, userToSubscribe)) {
            return ResponseEntity.status(400).body(Map.of("error", "Already subscribed"));
        }

        // Create subscription
        Subscription subscription = new Subscription(currentUser, userToSubscribe);
        subscriptionRepository.save(subscription);

        // Return updated counts
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Subscribed successfully");
        response.put("isSubscribed", true);
        response.put("subscriberCount", subscriptionRepository.countBySubscribedTo(userToSubscribe));
        
        return ResponseEntity.ok(response);
    }

    /**
     * Unsubscribe from a user
     */
    @DeleteMapping("/unsubscribe/{username}")
    @Transactional
    public ResponseEntity<?> unsubscribe(
            @PathVariable String username,
            @AuthenticationPrincipal User currentUser) {
        
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }

        // Find the user to unsubscribe from
        User userToUnsubscribe = userRepository.findByUsername(username)
                .orElse(null);
        
        if (userToUnsubscribe == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        // Delete subscription
        subscriptionRepository.deleteBySubscriberAndSubscribedTo(currentUser, userToUnsubscribe);

        // Return updated counts
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Unsubscribed successfully");
        response.put("isSubscribed", false);
        response.put("subscriberCount", subscriptionRepository.countBySubscribedTo(userToUnsubscribe));
        
        return ResponseEntity.ok(response);
    }

    /**
     * Check if current user is subscribed to another user
     */
    @GetMapping("/check/{username}")
    public ResponseEntity<?> checkSubscription(
            @PathVariable String username,
            @AuthenticationPrincipal User currentUser) {
        
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }

        User targetUser = userRepository.findByUsername(username)
                .orElse(null);
        
        if (targetUser == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        boolean isSubscribed = subscriptionRepository.existsBySubscriberAndSubscribedTo(currentUser, targetUser);
        long subscriberCount = subscriptionRepository.countBySubscribedTo(targetUser);
        
        Map<String, Object> response = new HashMap<>();
        response.put("isSubscribed", isSubscribed);
        response.put("subscriberCount", subscriberCount);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get user's subscribers
     */
    @GetMapping("/{username}/subscribers")
    public ResponseEntity<?> getSubscribers(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElse(null);
        
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        List<Subscription> subscriptions = subscriptionRepository.findBySubscribedTo(user);
        
        List<Map<String, Object>> subscribers = subscriptions.stream()
                .map(sub -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("username", sub.getSubscriber().getUsername());
                    dto.put("email", sub.getSubscriber().getEmail());
                    return dto;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(subscribers);
    }

    /**
     * Get users that a user is subscribed to
     */
    @GetMapping("/{username}/subscriptions")
    public ResponseEntity<?> getSubscriptions(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElse(null);
        
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        List<Subscription> subscriptions = subscriptionRepository.findBySubscriber(user);
        
        List<Map<String, Object>> subscribedTo = subscriptions.stream()
                .map(sub -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("username", sub.getSubscribedTo().getUsername());
                    dto.put("email", sub.getSubscribedTo().getEmail());
                    return dto;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(subscribedTo);
    }
}
