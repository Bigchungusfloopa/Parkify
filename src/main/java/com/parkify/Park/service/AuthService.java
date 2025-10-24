package com.parkify.Park.service;

import com.parkify.Park.dto.LoginDto;
import com.parkify.Park.dto.RegisterDto;
import com.parkify.Park.model.User;
import com.parkify.Park.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class AuthService {

    // Define password requirements using Regex (example: min 8 chars, 1 uppercase, 1 lowercase, 1 digit)
    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$");

    // Add password reset token storage
    private final Map<String, PasswordResetToken> resetTokens = new HashMap<>();
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Add this inner class
    private static class PasswordResetToken {
        String token;
        String email;
        LocalDateTime expiryDate;
        
        PasswordResetToken(String token, String email) {
            this.token = token;
            this.email = email;
            this.expiryDate = LocalDateTime.now().plusHours(1); // 1 hour expiry
        }
        
        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiryDate);
        }
    }

    // --- User Registration ---
    public User registerUser(RegisterDto registerDto) {
        // Validate Password
        if (!isValidPassword(registerDto.getPassword())) {
            throw new RuntimeException("Password does not meet requirements. Must be at least 8 characters long and include uppercase, lowercase, and a digit.");
        }

        // Check if email already exists
        if (userRepository.findByEmail(registerDto.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already taken!");
        }

        // Create and save new user (no role set)
        User user = new User();
        user.setName(registerDto.getName());
        user.setEmail(registerDto.getEmail());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
        // Role is not set in this version
        return userRepository.save(user);
    }

    // --- User Login (Manual Check) ---
    public User loginUser(LoginDto loginDto) {
        // Find user by email
        User user = userRepository.findByEmail(loginDto.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Manually check password match using the encoder
        if (!passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        return user; // Return the found user
    }

    // --- Forgot Password Methods (Enhanced) ---

    // Handles the request to initiate password reset
    public String handleForgotPassword(String email) {
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User with this email not found."));

        // Generate token and store it
        String resetToken = UUID.randomUUID().toString();
        resetTokens.put(resetToken, new PasswordResetToken(resetToken, email));

        // Simulate email sending
        System.out.println("---- PASSWORD RESET ----");
        System.out.println("Email to: " + email);
        System.out.println("Reset Token: " + resetToken);
        System.out.println("Link: http://localhost:5173/reset-password?token=" + resetToken);
        System.out.println("---- END SIMULATION ----");

        return resetToken; // Return token for simulation purposes
    }

    // Handles the actual password reset using the token
    public void resetPassword(String email, String token, String newPassword) {
        // Validate token
        PasswordResetToken resetToken = resetTokens.get(token);
        if (resetToken == null || resetToken.isExpired() || !resetToken.email.equals(email)) {
            throw new RuntimeException("Invalid or expired reset token.");
        }

        // Clean up used token
        resetTokens.remove(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        // Validate the new password
        if (!isValidPassword(newPassword)) {
            throw new RuntimeException("New password does not meet requirements.");
        }

        // Update password and save user
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        System.out.println("Password reset successful for user: " + email);
    }

    // --- Helper Method for Password Validation ---
    private boolean isValidPassword(String password) {
        if (password == null) {
            return false;
        }
        return PASSWORD_PATTERN.matcher(password).matches();
    }
}