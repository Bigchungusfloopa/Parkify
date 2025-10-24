package com.parkify.Park.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "http://localhost:5173", 
                "http://localhost:5174",
                "http://localhost:3000",  // Add common React ports
                "http://127.0.0.1:5173",  // Add IP variants
                "http://127.0.0.1:5174"
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600); // Cache preflight response for 1 hour
    }
}