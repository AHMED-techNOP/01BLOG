package com._blog._blog.controller;

import com._blog._blog.entity.Post;
import com._blog._blog.entity.Report;
import com._blog._blog.entity.User;
import com._blog._blog.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") // All endpoints require ADMIN role
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    // ==================== USER MANAGEMENT ====================

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<Map<String, Object>> userDTOs = users.stream().map(user -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", user.getId());
                dto.put("username", user.getUsername());
                dto.put("email", user.getEmail());
                dto.put("role", user.getRole().toString());
                dto.put("createdAt", user.getCreatedAt());
                dto.put("postCount", user.getPosts() != null ? user.getPosts().size() : 0);
                dto.put("followerCount", subscriptionRepository.countBySubscribedTo(user));
                dto.put("isBanned", user.isBanned());
                return dto;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/users/{userId}/ban")
    public ResponseEntity<?> banUser(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getRole().toString().equals("ADMIN")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Cannot ban admin users"));
            }

            user.setBanned(true);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "User banned successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/users/{userId}/unban")
    public ResponseEntity<?> unbanUser(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setBanned(false);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "User unbanned successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getRole().toString().equals("ADMIN")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Cannot delete admin users"));
            }

            userRepository.delete(user);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== POST MANAGEMENT ====================

    @GetMapping("/posts")
    public ResponseEntity<?> getAllPosts() {
        try {
            List<Post> posts = postRepository.findAll();
            List<Map<String, Object>> postDTOs = posts.stream().map(post -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", post.getId());
                dto.put("title", post.getTitle());
                dto.put("content", post.getDescription());
                dto.put("username", post.getUser().getUsername());
                dto.put("createdAt", post.getCreatedAt());
                dto.put("likeCount", post.getLikes() != null ? post.getLikes().size() : 0);
                dto.put("commentCount", post.getComments() != null ? post.getComments().size() : 0);
                dto.put("isHidden", post.isHidden());
                return dto;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(postDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/posts/{postId}/hide")
    public ResponseEntity<?> hidePost(@PathVariable Long postId) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            post.setHidden(true);
            postRepository.save(post);

            return ResponseEntity.ok(Map.of("message", "Post hidden successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/posts/{postId}/unhide")
    public ResponseEntity<?> unhidePost(@PathVariable Long postId) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            post.setHidden(false);
            postRepository.save(post);

            return ResponseEntity.ok(Map.of("message", "Post unhidden successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long postId) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            postRepository.delete(post);
            return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== REPORT MANAGEMENT ====================

    @GetMapping("/reports")
    public ResponseEntity<?> getAllReports() {
        try {
            List<Report> reports = reportRepository.findAll();
            List<Map<String, Object>> reportDTOs = reports.stream().map(report -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", report.getId());
                dto.put("reporterId", report.getReporter().getId());
                dto.put("reporterUsername", report.getReporter().getUsername());
                
                if (report.getReportedUser() != null) {
                    dto.put("reportedUserId", report.getReportedUser().getId());
                    dto.put("reportedUsername", report.getReportedUser().getUsername());
                }
                
                if (report.getPost() != null) {
                    dto.put("postId", report.getPost().getId());
                    dto.put("postTitle", report.getPost().getTitle());
                }
                
                dto.put("reason", report.getReason());
                dto.put("status", report.getStatus());
                dto.put("timestamp", report.getTimestamp());
                
                return dto;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(reportDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/reports/{reportId}/status")
    public ResponseEntity<?> updateReportStatus(
            @PathVariable Long reportId,
            @RequestBody Map<String, String> request) {
        try {
            Report report = reportRepository.findById(reportId)
                    .orElseThrow(() -> new RuntimeException("Report not found"));

            String status = request.get("status");
            if (status == null || status.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Status is required"));
            }

            // Validate status
            if (!status.equals("PENDING") && !status.equals("REVIEWED") && !status.equals("RESOLVED")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid status. Must be PENDING, REVIEWED, or RESOLVED"));
            }

            report.setStatus(status);
            reportRepository.save(report);

            return ResponseEntity.ok(Map.of("message", "Report status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/reports/{reportId}")
    public ResponseEntity<?> deleteReport(@PathVariable Long reportId) {
        try {
            Report report = reportRepository.findById(reportId)
                    .orElseThrow(() -> new RuntimeException("Report not found"));

            reportRepository.delete(report);
            return ResponseEntity.ok(Map.of("message", "Report deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
