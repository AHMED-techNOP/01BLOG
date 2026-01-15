package com._blog._blog.repository;

import com._blog._blog.entity.Post;
import com._blog._blog.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // Find user's posts
    List<Post> findByUserOrderByCreatedAtDesc(User user);
    
    // Find user's posts (excluding hidden for non-admins)
    List<Post> findByUserAndIsHiddenFalseOrderByCreatedAtDesc(User user);
    
    // Find all posts
    List<Post> findAllByOrderByCreatedAtDesc();
    
    // Find all visible posts (excluding hidden)
    List<Post> findByIsHiddenFalseOrderByCreatedAtDesc();
    
    // Find posts by users that the current user is subscribed to
    @Query("SELECT p FROM Post p WHERE p.user.id IN :userIds ORDER BY p.createdAt DESC")
    List<Post> findByUserIdInOrderByCreatedAtDesc(@Param("userIds") List<Long> userIds);
    
    // Find visible posts by users that the current user is subscribed to
    @Query("SELECT p FROM Post p WHERE p.user.id IN :userIds AND p.isHidden = false ORDER BY p.createdAt DESC")
    List<Post> findByUserIdInAndIsHiddenFalseOrderByCreatedAtDesc(@Param("userIds") List<Long> userIds);
    
    // Delete all posts by a user (for cascade delete)
    void deleteByUser(User user);
}
