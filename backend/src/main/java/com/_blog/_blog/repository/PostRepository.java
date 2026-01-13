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
    // Find user's posts (including hidden ones for the owner)
    List<Post> findByUserOrderByCreatedAtDesc(User user);
    
    // Find all posts excluding hidden ones
    List<Post> findByHiddenFalseOrderByCreatedAtDesc();
    
    // Find posts by users that the current user is subscribed to (excluding hidden)
    @Query("SELECT p FROM Post p WHERE p.user.id IN :userIds AND p.hidden = false ORDER BY p.createdAt DESC")
    List<Post> findByUserIdInOrderByCreatedAtDesc(@Param("userIds") List<Long> userIds);
    
    // Delete all posts by a user (for cascade delete)
    void deleteByUser(User user);
}
