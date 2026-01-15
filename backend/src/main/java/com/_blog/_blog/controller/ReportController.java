package com._blog._blog.controller;

import com._blog._blog.entity.Post;
import com._blog._blog.entity.Report;
import com._blog._blog.entity.User;
import com._blog._blog.repository.PostRepository;
import com._blog._blog.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private PostRepository postRepository;

    /**
     * Submit a report for a post or user
     */
    @PostMapping
    public ResponseEntity<?> reportPost(
            @RequestBody Map<String, Object> reportData,
            @AuthenticationPrincipal User user) {
        
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }

        try {
           
            // Validate required fields
            if (!reportData.containsKey("postId")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Missing postId field"));
            }
            
            if (!reportData.containsKey("reason")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Missing reason field"));
            }
            
            if (!reportData.containsKey("reportType")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Missing reportType field"));
            }
            
            Long postId = Long.valueOf(reportData.get("postId").toString());
            String reason = reportData.get("reason").toString();
            String reportType = reportData.get("reportType").toString(); // 'post' or 'user'
            
            // Validate reason length
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Reason cannot be empty"));
            }
            if (reason.length() > 500) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Reason must not exceed 500 characters"));
            }
            
            
            // Find the post
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            
            User postAuthor = post.getUser();
                        
            // Check if user is trying to report their own post/user
            if (postAuthor.getId().equals(user.getId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "You cannot report your own content"));
            }
            
            // Create and save the report based on type
            Report report;
            if ("user".equals(reportType)) {
                // Report the user
                report = new Report(user, postAuthor, reason);
                report.setPost(null); // No specific post, just user report
            } else {
                // Report the post (default)
                report = new Report(user, post, reason);
                report.setReportedUser(postAuthor); // Also set the post's author as reported user
            }
            
            report.setStatus("PENDING");
            reportRepository.save(report);
                        
            return ResponseEntity.ok(Map.of(
                    "message", "Report submitted successfully",
                    "reportId", report.getId(),
                    "reportType", reportType,
                    "status", report.getStatus()
            ));
            
        } catch (Exception e) {
            System.err.println("Error submitting report: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to submit report: " + e.getMessage()));
        }
    }
}
