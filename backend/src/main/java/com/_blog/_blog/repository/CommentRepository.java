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
    
    // Delete all comments for a post
    void deleteByPost(Post post);
    
    // Delete all comments by a user (for cascade delete)
    void deleteByUser(com._blog._blog.entity.User user);
}
