package com._blog._blog.controller;

import com._blog._blog.entity.Post;
import com._blog._blog.entity.User;
import com._blog._blog.repository.PostRepository;
import com._blog._blog.repository.LikeRepository;
import com._blog._blog.repository.CommentRepository;
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
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get posts for the dashboard (only from subscribed users)
     */
    @GetMapping("/me")
    @Transactional
    public ResponseEntity<?> getSubscribedUsersPosts(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }
        
        // Get IDs of users that the current user is subscribed to
        List<Long> subscribedUserIds = subscriptionRepository.findSubscribedToUserIds(user.getId());
        
        // Fetch posts only from subscribed users, or all posts if not subscribed to anyone
        List<Post> posts;
        if (subscribedUserIds.isEmpty()) {
            // If user is not subscribed to anyone, show all posts (excluding hidden ones)
            posts = postRepository.findByHiddenFalseOrderByCreatedAtDesc();
        } else {
            posts = postRepository.findByUserIdInOrderByCreatedAtDesc(subscribedUserIds);
        }
        
        // Convert to DTOs to avoid lazy loading issues and include username and like info
        List<Map<String, Object>> postDTOs = posts.stream().map(post -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", post.getId());
            dto.put("title", post.getTitle());
            dto.put("description", post.getDescription());
            dto.put("mediaUrl", post.getMediaUrl() != null ? post.getMediaUrl() : "");
            dto.put("createdAt", post.getCreatedAt());
            dto.put("username", post.getUser().getUsername());
            dto.put("likeCount", likeRepository.countByPost(post));
            dto.put("isLiked", likeRepository.existsByPostAndUser(post, user));
            dto.put("commentCount", commentRepository.countByPost(post));
            return dto;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(postDTOs);
    }

    /**
     * Get all users with subscription info
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers(@AuthenticationPrincipal User currentUser) {
        try {
            List<User> users = userRepository.findAll();
            
            // Get current user's subscriptions
            List<Long> subscribedUserIds = subscriptionRepository.findSubscribedToUserIds(currentUser.getId());
            
            // Convert to DTO with subscription info
            List<Map<String, Object>> userDTOs = users.stream()
                .filter(user -> !user.getId().equals(currentUser.getId())) // Exclude current user
                .map(user -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", user.getId());
                    dto.put("username", user.getUsername());
                    dto.put("email", user.getEmail());
                    dto.put("role", user.getRole());
                    dto.put("subscriberCount", subscriptionRepository.countBySubscribedTo(user));
                    dto.put("isSubscribed", subscribedUserIds.contains(user.getId()));
                    return dto;
                })
                .collect(Collectors.toList());

            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error fetching users: " + e.getMessage()));
        }
    }
}
