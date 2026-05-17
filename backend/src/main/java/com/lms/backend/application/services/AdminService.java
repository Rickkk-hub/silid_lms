package com.lms.backend.application.services;

import com.lms.backend.application.dto.admin.*;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.domain.entities.Admin;
import com.lms.backend.domain.entities.User;
import com.lms.backend.domain.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Added for logging
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j // Added to handle exceptions properly
@Service
@RequiredArgsConstructor
public class AdminService {

    private final IAdminRepository adminRepository;
    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ICourseRepository courseRepository;

    @Transactional
    public ResultDTO registerAdmin(AdminRegisterDTO dto) {
        ResultDTO result = new ResultDTO();
        try {
            if (!dto.getPassword().equals(dto.getConfirmpassword())) {
                throw new Exception("Passwords do not match!");
            }

            if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
                throw new Exception("Email is already registered.");
            }

            User user = new User();
            user.setEmail(dto.getEmail());
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            user.setRole("ADMIN");
            user.setActive(true);
            User savedUser = userRepository.save(user);

            Admin admin = new Admin();
            admin.setFullname(dto.getFullname());
            admin.setEmail(dto.getEmail());
            admin.setRole("ADMIN");
            admin.setUser(savedUser);
            adminRepository.save(admin);

            result.setSuccess(true);
            result.setMessage("Admin registered successfully!");
            result.setFullname(admin.getFullname());
            result.populateFromUser(savedUser);

        } catch (Exception e) {
            log.error("Registration failed: ", e); // Handle exception or log it
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        }
        return result;
    }

    public ResultDTO loginAdmin(AdminLoginDTO dto) {
        ResultDTO result = new ResultDTO();
        try {
            User user = userRepository.findByEmail(dto.getEmail())
                    .orElseThrow(() -> new Exception("Invalid credentials"));

            if (!"ADMIN".equals(user.getRole())) {
                throw new Exception("Access Denied: Not an Administrator");
            }

            if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
                throw new Exception("Invalid credentials");
            }

            result.setSuccess(true);
            result.setMessage("Administrator Access Granted");
            result.populateFromUser(user);

            // Link the fullname from Admin table
            adminRepository.findByUserUserId(user.getUserId())
                    .ifPresent(admin -> result.setFullname(admin.getFullname()));

        } catch (Exception e) {
            log.error("Login attempt failed for email {}: ", dto.getEmail(), e); // Log handled exception
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        }
        return result;
    }

    public AdminStatsDTO getDashboardStats() {
        AdminStatsDTO stats = new AdminStatsDTO();
        try {
            stats.setTotalCourses(courseRepository.count());
            stats.setActiveFaculty(userRepository.countByRole("TEACHER"));
            stats.setTotalStudents(userRepository.countByRole("STUDENT"));
            stats.setUnassignedCount(courseRepository.countByTeacherIsNull());
            stats.setActiveRoles(3);
            stats.setDepartmentCount(4);
        } catch (Exception e) {
            // "Handle this exception" fix: Log the error properly
            log.error("Failed to fetch dashboard stats from the database", e);
        }
        return stats;
    }
}