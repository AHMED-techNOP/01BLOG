package com._blog._blog.controller;

import com._blog._blog.entity.Post;
import com._blog._blog.entity.User;
import com._blog._blog.repository.PostRepository;
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

    /**
     * Get posts for the dashboard (currently returns all posts)
     * TODO: Filter by subscribed users when subscription feature is implemented
     */
    @GetMapping("/me")
    @Transactional
    public ResponseEntity<?> getSubscribedUsersPosts(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }
        
        // For now, return all posts ordered by creation date
        // TODO: Later filter by subscribed users only
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        
        // Convert to DTOs to avoid lazy loading issues and include username
        List<Map<String, Object>> postDTOs = posts.stream().map(post -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", post.getId());
            dto.put("title", post.getTitle());
            dto.put("description", post.getDescription());
            dto.put("mediaUrl", post.getMediaUrl() != null ? post.getMediaUrl() : "");
            dto.put("createdAt", post.getCreatedAt());
            dto.put("username", post.getUser().getUsername());
            return dto;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(postDTOs);
    }
}
