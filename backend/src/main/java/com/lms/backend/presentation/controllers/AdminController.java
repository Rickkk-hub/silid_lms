package com.lms.backend.presentation.controllers;


import com.lms.backend.application.dto.admin.AdminLoginDTO;
import com.lms.backend.application.dto.admin.AdminRegisterDTO;
import com.lms.backend.application.dto.admin.AdminStatsDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.application.services.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/register")
    public ResponseEntity<ResultDTO> register(@RequestBody AdminRegisterDTO dto) {
        ResultDTO result = adminService.registerAdmin(dto);
        return result.isSuccess() ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    @PostMapping("/login")
    public ResponseEntity<ResultDTO> login(@RequestBody AdminLoginDTO dto) {
        ResultDTO result = adminService.loginAdmin(dto);
        return result.isSuccess() ? ResponseEntity.ok(result) : ResponseEntity.status(401).body(result);
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getStats() {
        // Direct return is fine here as getDashboardStats handles internal errors
        return ResponseEntity.ok(adminService.getDashboardStats());
    }
}