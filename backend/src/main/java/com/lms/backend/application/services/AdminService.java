package com.lms.backend.application.services;

import com.lms.backend.application.dto.admin.AdminDTO;
import com.lms.backend.application.dto.admin.AdminLoginDTO;
import com.lms.backend.application.dto.admin.AdminRegisterDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.domain.entities.Admin;
import com.lms.backend.domain.entities.User;
import com.lms.backend.domain.repositories.IAdminRepository;
import com.lms.backend.domain.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final IAdminRepository adminRepository;
    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;



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
            
            // Fetch the name from the admin table to send back to frontend
            adminRepository.findByUserUserid(user.getUserid())
                .ifPresent(admin -> result.setFullname(admin.getFullname()));

        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        }
        return result;
    }

    public AdminDTO getAdminByUserId(long userId) {
        Admin admin = adminRepository.findByUserUserid(userId)
                .orElseThrow(() -> new RuntimeException("Admin profile not found"));

        AdminDTO dto = new AdminDTO();
        dto.setId(admin.getId());
        dto.setUserId(admin.getUser().getUserid());
        dto.setFullname(admin.getFullname());
        dto.setEmail(admin.getEmail());
        dto.setRole(admin.getRole());
        return dto;
    }
}