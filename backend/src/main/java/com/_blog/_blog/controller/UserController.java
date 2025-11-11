package com._blog._blog.controller;

import com._blog._blog.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    /**
     * Get current authenticated user's profile
     * This endpoint is protected - Spring Security filters validate the token
     * If token is invalid, user never reaches this method (gets 401)
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());
        response.put("id", user.getId());
        response.put("createdAt", user.getCreatedAt());
        
        return ResponseEntity.ok(response);
    }
}
