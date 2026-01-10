package com._blog._blog.repository;

import com._blog._blog.entity.Like;
import com._blog._blog.entity.Post;
import com._blog._blog.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    
    // Check if a user has liked a post
    boolean existsByPostAndUser(Post post, User user);
    
    // Find a specific like by post and user
    Optional<Like> findByPostAndUser(Post post, User user);
    
    // Count likes for a post
    long countByPost(Post post);
    
    // Delete a like by post and user
    void deleteByPostAndUser(Post post, User user);
    
    // Delete all likes for a post
    void deleteByPost(Post post);
}
