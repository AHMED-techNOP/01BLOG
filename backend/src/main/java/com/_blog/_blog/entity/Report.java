package com._blog._blog.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
public class Report {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_user_id")
    private User reportedUser;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;
    
    @Column(nullable = false, length = 500)
    private String reason;
    
    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, REVIEWED, RESOLVED
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // Custom constructor for user reports
    public Report(User reporter, User reportedUser, String reason) {
        this.reporter = reporter;
        this.reportedUser = reportedUser;
        this.reason = reason;
        this.timestamp = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }
    
    // Custom constructor for post reports
    public Report(User reporter, Post post, String reason) {
        this.reporter = reporter;
        this.post = post;
        this.reason = reason;
        this.timestamp = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }
}
