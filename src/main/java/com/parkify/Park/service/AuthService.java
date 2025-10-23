package com.parkify.Park.service;

import com.parkify.Park.dto.LoginDto;
import com.parkify.Park.dto.RegisterDto;
import com.parkify.Park.model.User;
import com.parkify.Park.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.regex.Pattern;

@Service
public class AuthService {

    // Define password requirements using Regex (example: min 8 chars, 1 uppercase, 1 lowercase, 1 digit)
    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$");

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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

    // --- Forgot Password Methods (Simulation) ---

    // Handles the request to initiate password reset
    public String handleForgotPassword(String email) {
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User with this email not found."));

        // Simulate token generation and email sending
        String resetToken = java.util.UUID.randomUUID().toString(); // Generate a simple token
        System.out.println("---- PASSWORD RESET ----");
        System.out.println("Simulating email to: " + email);
        System.out.println("Reset Token: " + resetToken); // Log the token for testing
        System.out.println("---- END SIMULATION ----");

        // In a real app, you would save this token linked to the user with an expiry time.

        return resetToken; // Return token for simulation purposes
    }

    // Handles the actual password reset using the token
    public void resetPassword(String email, String token, String newPassword) {
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        // --- Simulate Token Validation ---
        // Replace this with actual token validation against a stored token and expiry
        if (token == null || token.length() < 10) { // Very basic check for simulation
             throw new RuntimeException("Invalid or expired reset token.");
        }
        System.out.println("Simulating token validation successful for token: " + token);
        // --- End Simulation ---

        // Validate the new password
        if (!isValidPassword(newPassword)) {
            throw new RuntimeException("New password does not meet requirements.");
        }

        // Update password and save user
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // --- Helper Method for Password Validation ---
    private boolean isValidPassword(String password) {
        if (password == null) {
            return false;
        }
        return PASSWORD_PATTERN.matcher(password).matches();
    }
}