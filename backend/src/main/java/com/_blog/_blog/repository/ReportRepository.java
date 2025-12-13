package com._blog._blog.repository;

import com._blog._blog.entity.Report;
import com._blog._blog.entity.User;
import com._blog._blog.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    
    // Find all reports by status
    List<Report> findByStatus(String status);
    
    // Find reports for a specific post
    List<Report> findByPost(Post post);
    
    // Find reports submitted by a user
    List<Report> findByReporter(User reporter);
    
    // Find reports for a specific user
    List<Report> findByReportedUser(User reportedUser);
    
    // Count reports for a post
    long countByPost(Post post);
    
    // Count pending reports
    long countByStatus(String status);
}
