package com.parkify.Park.service;

import com.parkify.Park.model.User;
import com.parkify.Park.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Use the role from the User model if it exists, otherwise provide no authorities
        String role = user.getRole(); // Assumes User model has getRole()
        Collection<GrantedAuthority> authorities;
        if (role != null && !role.isEmpty()) {
             GrantedAuthority authority = new SimpleGrantedAuthority(role);
             authorities = Collections.singletonList(authority);
        } else {
             authorities = Collections.emptyList();
             // It's good practice to log this situation
             System.err.println("Warning: User " + email + " logged in but has no role assigned in the database.");
        }

        // Return the standard Spring Security User object
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities // Provide the list of roles/permissions
        );
    }
}