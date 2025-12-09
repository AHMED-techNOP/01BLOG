package com._blog._blog.service;
import com._blog._blog.dto.AuthResponse;
import com._blog._blog.dto.LoginRequest;
import com._blog._blog.dto.RegisterRequest;
import com._blog._blog.entity.Role;
import com._blog._blog.entity.User;
import com._blog._blog.repository.UserRepository;
import com._blog._blog.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public AuthResponse register(RegisterRequest registerRequest) {
        // Check if username already exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already registered!");
        }

        // Create new user
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword())); // Hash password
        user.setRole(Role.USER); // Default role

        // Save user to database
        User savedUser = userRepository.save(user);

        // ✨ Generate JWT token with user details (auto-login after registration)
        String jwt = jwtTokenProvider.generateTokenFromUser(
            savedUser.getUsername(),
            savedUser.getEmail(), 
            savedUser.getRole().name()
        );

        // Return response with token
        return new AuthResponse(
            jwt,
            savedUser.getUsername(),
            savedUser.getEmail(),
            savedUser.getRole().name()
        );
    }

    public AuthResponse login(LoginRequest loginRequest) {
        // ✨ Authenticate user with Spring Security
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsernameOrEmail(),
                loginRequest.getPassword()
            )
        );

        // Get user details
        User user = (User) authentication.getPrincipal();

        // ✨ Generate JWT token with user details
        String jwt = jwtTokenProvider.generateTokenFromUser(
            user.getUsername(),
            user.getEmail(),
            user.getRole().name()
        );

        // Return response with token
        return new AuthResponse(
            jwt,
            user.getUsername(),
            user.getEmail(),
            user.getRole().name()
        );
    }
}
