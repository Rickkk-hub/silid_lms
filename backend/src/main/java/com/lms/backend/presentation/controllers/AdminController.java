package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.AdminStatsDTO;
import com.lms.backend.application.services.AdminService; // Import the service
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private AdminService adminService; // Inject the service instead of repositories

    @GetMapping("/stats")
    public AdminStatsDTO getOverviewStats() {
        // Just call the service method
        return adminService.getOverviewStats();
    }
}