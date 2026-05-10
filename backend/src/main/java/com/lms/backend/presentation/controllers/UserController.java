package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.ResultDTO;
import com.lms.backend.application.dto.StudentLoginDTO;
import com.lms.backend.application.dto.StudentRegisterDTO;
import com.lms.backend.application.interfaces.IUserService;
import com.lms.backend.presentation.auth.AuthService; // ADD THIS IMPORT
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;
    private final AuthService authService;

   // ADD THIS METHOD
    @GetMapping("/role/{role}")
    public ResponseEntity<List<?>> getUsersByRole(@PathVariable String role) {
        // You'll need to implement this in your IUserService
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    // Optional: Add a general get all users for the Admin
    @GetMapping
    public ResponseEntity<List<?>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/register")
    public ResponseEntity<ResultDTO> register(@RequestBody StudentRegisterDTO registerDTO) {
        ResultDTO result = userService.StudentRegister(registerDTO);
        
        if (result.isSuccess()) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }

    @PostMapping("/login")
    public ResponseEntity<ResultDTO> login(@RequestBody StudentLoginDTO loginDTO) {
        // This now uses the unified service to check both teacher and users tables
        ResultDTO result = authService.login(loginDTO.getEmail(), loginDTO.getPassword());
        
        if (result.isSuccess()) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(401).body(result);
    }

    
}