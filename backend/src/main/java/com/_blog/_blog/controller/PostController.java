package com._blog._blog.controller;
import com._blog._blog.entity.Post;
import com._blog._blog.entity.User;
import com._blog._blog.entity.Like;
import com._blog._blog.entity.Comment;
import com._blog._blog.repository.PostRepository;
import com._blog._blog.repository.UserRepository;
import com._blog._blog.repository.LikeRepository;
import com._blog._blog.repository.CommentRepository;
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

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private com._blog._blog.repository.NotificationRepository notificationRepository;

    @Autowired
    private com._blog._blog.repository.SubscriptionRepository subscriptionRepository;

    @Autowired
    private com._blog._blog.repository.ReportRepository reportRepository;

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

            // Validate title length
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.status(400).body(Map.of("message", "Title is required"));
            }
            if (title.length() > 200) {
                return ResponseEntity.status(400).body(Map.of("message", "Title must not exceed 200 characters"));
            }
            if (description == null || description.trim().isEmpty()) {
                return ResponseEntity.status(400).body(Map.of("message", "Description is required"));
            }
            // Validate description length
            if (description != null && description.length() > 5000) {
                return ResponseEntity.status(400).body(Map.of("message", "Description must not exceed 5000 characters"));
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

            // Create notifications for all subscribers
            List<com._blog._blog.entity.Subscription> subscriptions = subscriptionRepository.findBySubscribedTo(user);
            for (com._blog._blog.entity.Subscription subscription : subscriptions) {
                User subscriber = subscription.getSubscriber();
                String message = user.getUsername() + " published a new post: " + title;
                com._blog._blog.entity.Notification notification = new com._blog._blog.entity.Notification(
                    subscriber, 
                    user, 
                    savedPost, 
                    "NEW_POST", 
                    message
                );
                notificationRepository.save(notification);
            }

            // Return DTO with username and like info
            return ResponseEntity.ok(postToDTO(savedPost, user));


        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to upload media file"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to create post: " + e.getMessage()));
        }
    }

    @GetMapping
    @Transactional
    public ResponseEntity<?> getAllPosts(@AuthenticationPrincipal User user) {
        List<Post> posts;
        
            posts = postRepository.findByIsHiddenFalseOrderByCreatedAtDesc();
        
        
        // Convert to DTOs to include username and like info
        List<Map<String, Object>> postDTOs = posts.stream()
                .map(post -> postToDTO(post, user))
                .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(postDTOs);
    }

    @GetMapping("/user/{username}")
    @Transactional
    public ResponseEntity<?> getUserPosts(
            @PathVariable String username,
            @AuthenticationPrincipal User currentUser) {
        // Find user or return 404
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found", "message", "User '" + username + "' does not exist"));
        }
        
        // Get user's posts (admins see all, regular users don't see hidden posts)
        List<Post> posts;
       
            posts = postRepository.findByUserAndIsHiddenFalseOrderByCreatedAtDesc(user);
        
        
        // Convert to DTOs to include username and like info
        List<Map<String, Object>> postDTOs = posts.stream()
                .map(post -> postToDTO(post, currentUser))
                .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(postDTOs);
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

            // Check if user owns the post or is an admin
            if (!post.getUser().getId().equals(user.getId()) && !user.getRole().equals("ADMIN")) {
                return ResponseEntity.status(403).body(Map.of("message", "You don't have permission to delete this post"));
            }


            // Delete all related data first (to avoid foreign key constraints)
            // 1. Delete all likes
            likeRepository.deleteByPost(post);

            // 2. Delete all comments
            commentRepository.deleteByPost(post);

            // 3. Delete all notifications
            notificationRepository.deleteByPost(post);

            // 4. Delete all reports
            reportRepository.deleteByPost(post);

            // Delete media file if exists
            if (post.getMediaUrl() != null && !post.getMediaUrl().isEmpty()) {
                try {
                    Path filePath = Paths.get(UPLOAD_DIR + post.getMediaUrl().substring(post.getMediaUrl().lastIndexOf("/") + 1));
                    Files.deleteIfExists(filePath);
                } catch (IOException e) {
                    System.err.println("Failed to delete media file: " + e.getMessage());
                }
            }

            // Finally delete the post
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
            
            // Validate title length
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.status(400).body(Map.of("message", "Title is required"));
            }
            if (title.length() > 200) {
                return ResponseEntity.status(400).body(Map.of("message", "Title must not exceed 200 characters"));
            }

            // Validate description length
            if (description != null && description.length() > 5000) {
                return ResponseEntity.status(400).body(Map.of("message", "Description must not exceed 5000 characters"));
            }
            
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            
            // Check if user owns the post or is an admin
            if (!post.getUser().getId().equals(user.getId()) && !user.getRole().equals("ADMIN")) {
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
            
            // Return DTO with username and like info
            return ResponseEntity.ok(postToDTO(updatedPost, user));

        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to upload media file"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to update post: " + e.getMessage()));
        }
    }

    // Helper method to convert Post to DTO with like information
    private Map<String, Object> postToDTO(Post post, User currentUser) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", post.getId());
        dto.put("title", post.getTitle());
        dto.put("description", post.getDescription());
        dto.put("mediaUrl", post.getMediaUrl() != null ? post.getMediaUrl() : "");
        dto.put("createdAt", post.getCreatedAt());
        dto.put("username", post.getUser().getUsername());
        dto.put("likeCount", likeRepository.countByPost(post));
        dto.put("isLiked", currentUser != null && likeRepository.existsByPostAndUser(post, currentUser));
        dto.put("commentCount", commentRepository.countByPost(post));
        return dto;
    }

    // Like a post
    @PostMapping("/{postId}/like")
    @Transactional
    public ResponseEntity<?> likePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
            }

            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            // Check if user has already liked the post
            if (likeRepository.existsByPostAndUser(post, user)) {
                return ResponseEntity.status(400).body(Map.of("message", "Post already liked"));
            }

            // Create and save like
            Like like = new Like(post, user);
            likeRepository.save(like);

            // Return updated like count and status
            Map<String, Object> response = new HashMap<>();
            response.put("likeCount", likeRepository.countByPost(post));
            response.put("isLiked", true);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to like post: " + e.getMessage()));
        }
    }

    // Unlike a post
    @DeleteMapping("/{postId}/like")
    @Transactional
    public ResponseEntity<?> unlikePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
            }

            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            // Check if user has liked the post
            if (!likeRepository.existsByPostAndUser(post, user)) {
                return ResponseEntity.status(400).body(Map.of("message", "Post not liked yet"));
            }

            // Delete the like
            likeRepository.deleteByPostAndUser(post, user);

            // Return updated like count and status
            Map<String, Object> response = new HashMap<>();
            response.put("likeCount", likeRepository.countByPost(post));
            response.put("isLiked", false);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to unlike post: " + e.getMessage()));
        }
    }

    // Get comments for a post
    @GetMapping("/{postId}/comments")
    @Transactional
    public ResponseEntity<?> getComments(@PathVariable Long postId) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            List<Comment> comments = commentRepository.findByPostOrderByCreatedAtDesc(post);

            // Convert to DTOs
            List<Map<String, Object>> commentDTOs = comments.stream().map(comment -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", comment.getId());
                dto.put("content", comment.getContent());
                dto.put("username", comment.getUser().getUsername());
                dto.put("createdAt", comment.getCreatedAt());
                return dto;
            }).collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(commentDTOs);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to get comments: " + e.getMessage()));
        }
    }

    // Add a comment to a post
    @PostMapping("/{postId}/comments")
    @Transactional
    public ResponseEntity<?> addComment(
            @PathVariable Long postId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
            }

            String content = request.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.status(400).body(Map.of("message", "Comment content cannot be empty"));
            }
            
            // Validate comment length
            if (content.length() > 1000) {
                return ResponseEntity.status(400).body(Map.of("message", "Comment must not exceed 1000 characters"));
            }

            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            // Create and save comment
            Comment comment = new Comment(post, user, content.trim());
            Comment savedComment = commentRepository.save(comment);

            // Return comment DTO
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedComment.getId());
            response.put("content", savedComment.getContent());
            response.put("username", user.getUsername());
            response.put("createdAt", savedComment.getCreatedAt());
            response.put("commentCount", commentRepository.countByPost(post));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to add comment: " + e.getMessage()));
        }
    }

    // Delete a comment
    @DeleteMapping("/{postId}/comments/{commentId}")
    @Transactional
    public ResponseEntity<?> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
            }

            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new RuntimeException("Comment not found"));

            // Check if user owns the comment or the post
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            if (!comment.getUser().getId().equals(user.getId()) && !post.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "You don't have permission to delete this comment"));
            }

            commentRepository.delete(comment);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Comment deleted successfully");
            response.put("commentCount", commentRepository.countByPost(post));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to delete comment: " + e.getMessage()));
        }
    }
}
