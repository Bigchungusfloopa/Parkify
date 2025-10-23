package com.parkify.Park.controller;

import com.parkify.Park.dto.ForgotPasswordRequestDto; // Import ForgotPasswordRequestDto
import com.parkify.Park.dto.LoginDto;
import com.parkify.Park.dto.RegisterDto;
import com.parkify.Park.dto.ResetPasswordRequestDto; // Import ResetPasswordRequestDto
import com.parkify.Park.model.User;
import com.parkify.Park.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth") // Global CORS is handled in WebConfig, so no @CrossOrigin here
public class AuthController {

    @Autowired
    private AuthService authService;

    // --- Registration Endpoint ---
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterDto registerDto) {
        try {
            authService.registerUser(registerDto);
            return new ResponseEntity<>("User registered successfully!", HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // --- Login Endpoint ---
   @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginDto loginDto) {
        try {
            User user = authService.loginUser(loginDto);
            // Return only name and userId
            Map<String, Object> response = Map.of(
                "message", "Login successful",
                "name", user.getName(),
                "userId", user.getId()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    // --- Forgot Password Endpoints ---

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequestDto request) {
        try {
            // In simulation, we return the token in the response for testing.
            // In a real app, you'd just return a success message like "Email sent".
            String token = authService.handleForgotPassword(request.getEmail());
            return ResponseEntity.ok("Password reset initiated. Check console for token (simulation). Token: " + token);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequestDto request) {
        try {
            authService.resetPassword(request.getEmail(), request.getToken(), request.getNewPassword());
            return ResponseEntity.ok("Password has been reset successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}