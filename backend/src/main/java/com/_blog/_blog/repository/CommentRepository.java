package com._blog._blog.repository;

import com._blog._blog.entity.Comment;
import com._blog._blog.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    // Find all comments for a specific post, ordered by creation date
    List<Comment> findByPostOrderByCreatedAtDesc(Post post);
    
    // Count comments for a post
    long countByPost(Post post);
}
