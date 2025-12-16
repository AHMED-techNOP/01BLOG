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
     * Submit a report for a post
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
            
            Long postId = Long.valueOf(reportData.get("postId").toString());
            String reason = reportData.get("reason").toString();
            
            
            // Find the post
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));
                        
            // Check if user is trying to report their own post
            if (post.getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "You cannot report your own post"));
            }
            
            // Create and save the report
            Report report = new Report(user, post, reason);
            report.setReportedUser(post.getUser()); // Set the post's author as the reported user
            report.setStatus("PENDING");
            reportRepository.save(report);
                        
            return ResponseEntity.ok(Map.of(
                    "message", "Report submitted successfully",
                    "reportId", report.getId(),
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
