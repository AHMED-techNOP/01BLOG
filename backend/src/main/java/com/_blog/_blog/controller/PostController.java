package com._blog._blog.controller;
import com._blog._blog.entity.Post;
import com._blog._blog.entity.User;
import com._blog._blog.repository.PostRepository;
import com._blog._blog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:4200")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    private final String UPLOAD_DIR = "uploads/";

    @PostMapping
    @Transactional
    public ResponseEntity<?> createPost(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "media", required = false) MultipartFile mediaFile,
            @AuthenticationPrincipal User user) {

        try {
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
            }

            System.out.println("User found: " + user.getUsername());

            String mediaUrl = null;

            // Handle media upload if present
            if (mediaFile != null && !mediaFile.isEmpty()) {
                // Create upload directory if it doesn't exist
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                // Generate unique filename
                String originalFilename = mediaFile.getOriginalFilename();
                String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

                // Save file
                Path filePath = uploadPath.resolve(uniqueFilename);
                Files.copy(mediaFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                mediaUrl = "/uploads/" + uniqueFilename;
            }

            // Create and save post
            Post post = new Post(user, title, description, mediaUrl);
            Post savedPost = postRepository.save(post);

            // Return DTO with username
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedPost.getId());
            response.put("title", savedPost.getTitle());
            response.put("description", savedPost.getDescription());
            response.put("mediaUrl", savedPost.getMediaUrl() != null ? savedPost.getMediaUrl() : "");
            response.put("createdAt", savedPost.getCreatedAt());
            response.put("username", user.getUsername());
            
            return ResponseEntity.ok(response);


        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to upload media file"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to create post: " + e.getMessage()));
        }
    }

    @GetMapping
    @Transactional
    public ResponseEntity<?> getAllPosts() {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        
        // Convert to DTOs to include username
        List<Map<String, Object>> postDTOs = posts.stream().map(post -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", post.getId());
            dto.put("title", post.getTitle());
            dto.put("description", post.getDescription());
            dto.put("mediaUrl", post.getMediaUrl() != null ? post.getMediaUrl() : "");
            dto.put("createdAt", post.getCreatedAt());
            dto.put("username", post.getUser().getUsername());
            return dto;
        }).collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(postDTOs);
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUserPosts(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(postRepository.findByUserOrderByCreatedAtDesc(user));
    }

    @DeleteMapping("/{postId}")
    @Transactional
    public ResponseEntity<?> deletePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
            }

            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            // Check if user owns the post
            if (!post.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "You don't have permission to delete this post"));
            }

            // Delete media file if exists
            if (post.getMediaUrl() != null && !post.getMediaUrl().isEmpty()) {
                try {
                    Path filePath = Paths.get(UPLOAD_DIR + post.getMediaUrl().substring(post.getMediaUrl().lastIndexOf("/") + 1));
                    Files.deleteIfExists(filePath);
                } catch (IOException e) {
                    System.err.println("Failed to delete media file: " + e.getMessage());
                }
            }

            postRepository.delete(post);
            return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to delete post: " + e.getMessage()));
        }
    }

    @PutMapping("/{postId}")
    @Transactional
    public ResponseEntity<?> updatePost(
            @PathVariable Long postId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "media", required = false) MultipartFile mediaFile,
            @RequestParam(value = "removeMedia", required = false) Boolean removeMedia,
            @AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
            }
            
            System.out.println("Update request from user: " + user.getUsername());
            System.out.println("Found user with ID: " + user.getId());

            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            
            System.out.println("Found post with ID: " + post.getId());
            System.out.println("Post owner ID: " + post.getUser().getId());
            System.out.println("Current user ID: " + user.getId());

            // Check if user owns the post
            if (!post.getUser().getId().equals(user.getId())) {
                System.out.println("Permission denied: User " + user.getId() + " tried to edit post owned by " + post.getUser().getId());
                return ResponseEntity.status(403).body(Map.of("message", "You don't have permission to edit this post"));
            }

            // Update title and description
            post.setTitle(title);
            post.setDescription(description);

            // Handle media removal
            if (removeMedia != null && removeMedia && post.getMediaUrl() != null) {
                try {
                    Path filePath = Paths.get(UPLOAD_DIR + post.getMediaUrl().substring(post.getMediaUrl().lastIndexOf("/") + 1));
                    Files.deleteIfExists(filePath);
                } catch (IOException e) {
                    System.err.println("Failed to delete old media file: " + e.getMessage());
                }
                post.setMediaUrl(null);
            }

            // Handle new media upload
            if (mediaFile != null && !mediaFile.isEmpty()) {
                // Delete old media if exists
                if (post.getMediaUrl() != null) {
                    try {
                        Path oldFilePath = Paths.get(UPLOAD_DIR + post.getMediaUrl().substring(post.getMediaUrl().lastIndexOf("/") + 1));
                        Files.deleteIfExists(oldFilePath);
                    } catch (IOException e) {
                        System.err.println("Failed to delete old media file: " + e.getMessage());
                    }
                }

                // Upload new media
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                String originalFilename = mediaFile.getOriginalFilename();
                String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

                Path filePath = uploadPath.resolve(uniqueFilename);
                Files.copy(mediaFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                post.setMediaUrl("/uploads/" + uniqueFilename);
            }

            Post updatedPost = postRepository.save(post);
            
            // Return DTO with username
            Map<String, Object> response = new HashMap<>();
            response.put("id", updatedPost.getId());
            response.put("title", updatedPost.getTitle());
            response.put("description", updatedPost.getDescription());
            response.put("mediaUrl", updatedPost.getMediaUrl() != null ? updatedPost.getMediaUrl() : "");
            response.put("createdAt", updatedPost.getCreatedAt());
            response.put("username", user.getUsername());
            
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to upload media file"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to update post: " + e.getMessage()));
        }
    }
}
