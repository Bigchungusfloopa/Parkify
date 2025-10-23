package com.parkify.Park.config;

import com.parkify.Park.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
// Import needed for AuthenticationManagerBuilder
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import java.lang.Exception;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Inject your UserDetailsService
    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Bean to make the AuthenticationManager available (needed by AuthService)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Get AuthenticationManagerBuilder to wire UserDetailsService
        AuthenticationManagerBuilder authenticationManagerBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder.userDetailsService(customUserDetailsService).passwordEncoder(passwordEncoder());

        http
            .cors(Customizer.withDefaults()) // Apply CORS config from WebConfig
            .csrf(csrf -> csrf.disable()) // Disable CSRF
            .authorizeHttpRequests(authz -> authz
                // --- Public ---
                .requestMatchers("/api/auth/**").permitAll() // Login, register, forgot password

                // --- Authenticated (Any Logged-in User) ---
                .requestMatchers(HttpMethod.GET, "/api/floors/**").authenticated() // Viewing floors/slots needs login
                .requestMatchers(HttpMethod.GET, "/api/bookings/user/**").authenticated() // Viewing own history needs login
                .requestMatchers(HttpMethod.POST, "/api/bookings/**").authenticated() // Creating bookings needs login

                // --- Admin Only (Commented out) ---
                // .requestMatchers(HttpMethod.POST, "/api/floors/**").hasRole("ADMIN")
                // .requestMatchers(HttpMethod.PUT, "/api/floors/**").hasRole("ADMIN")
                // .requestMatchers(HttpMethod.DELETE, "/api/floors/**").hasRole("ADMIN")

                // --- Default ---
                .anyRequest().authenticated() // All other requests require login
            );
        return http.build();
    }
}