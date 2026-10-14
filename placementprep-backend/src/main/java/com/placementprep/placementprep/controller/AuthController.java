package com.placementprep.placementprep.controller;

import com.placementprep.placementprep.dto.LoginRequest;
import com.placementprep.placementprep.dto.LoginResponse;
import com.placementprep.placementprep.dto.RegisterRequest;
import com.placementprep.placementprep.Entity.User;
import com.placementprep.placementprep.security.JwtService;
import com.placementprep.placementprep.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request.getName() == null || request.getName().isBlank()
                || request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Name, email, and password are required"));
        }

        if (userService.getUserByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "An account with this email already exists"));
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole("STUDENT");

        User savedUser = userService.saveUser(user);
        String token = jwtService.generateToken(savedUser.getEmail());
        LoginResponse response = new LoginResponse(
                "Registration successful",
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Optional<User> userOptional =
                userService.loginUser(request.getEmail(), request.getPassword());

        if (userOptional.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        User user = userOptional.get();

        String token = jwtService.generateToken(user.getEmail());

        LoginResponse response = new LoginResponse(
                "Login successful",
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity.ok(response);
    }
}
