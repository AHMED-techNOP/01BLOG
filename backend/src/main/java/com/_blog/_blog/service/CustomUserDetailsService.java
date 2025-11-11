package com._blog._blog.service;
import com._blog._blog.entity.User;
import com._blog._blog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;
    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        // Find user by username or email
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail)
                .orElseThrow(() -> 
                    new UsernameNotFoundException("User not found with username or email: " + usernameOrEmail)
                );
        return user; // User UserDetails
    }
}
