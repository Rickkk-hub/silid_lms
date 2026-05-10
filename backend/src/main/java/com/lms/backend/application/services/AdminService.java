package com.lms.backend.application.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.lms.backend.application.dto.AdminLoginDTO;
import com.lms.backend.application.dto.AdminRegisterDTO;
import com.lms.backend.application.dto.AdminStatsDTO;
import com.lms.backend.application.dto.ResultDTO;
import com.lms.backend.application.interfaces.IAdminService;
import com.lms.backend.domain.entities.Admin;
import com.lms.backend.domain.repositories.IAdminRepository;
import com.lms.backend.domain.repositories.ICourseRepository;
import com.lms.backend.domain.repositories.IUserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService implements IAdminService {
    
    private final IAdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ResultDTO AdminRegister(AdminRegisterDTO register) {
        ResultDTO result = new ResultDTO();
        try {
            if(!register.getPassword().equals(register.getConfirmpassword())) {
                throw new IllegalArgumentException("Passwords do not match!");
            }

            if(adminRepository.findByEmail(register.getEmail()).isPresent()){
                throw new IllegalArgumentException("Email is already registered!");
            }

            Admin admin = new Admin();
            admin.setFullname(register.getFullname());
            admin.setEmail(register.getEmail());
            admin.setPassword(passwordEncoder.encode(register.getPassword()));
            admin.setRole("ADMIN");

            Admin saved = adminRepository.save(admin);
            
            result.setSuccess(true);
            result.setMessage("Admin successfully registered!");
            result.setAdmin(saved);
        } catch(Exception e) { 
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        }
        return result;
    }
    
    @Override
    public ResultDTO AdminLogin(AdminLoginDTO login) {
        ResultDTO result = new ResultDTO();
        try {
    
            Admin admin = adminRepository.findByEmail(login.getEmail())
                .orElseThrow(() -> new Exception("Invalid Email"));
      
            // FIX: Check if password DOES NOT match
            if(!passwordEncoder.matches(login.getPassword(), admin.getPassword())) {
                throw new ExceptionInInitializerError("Invalid Password");
            }

            result.setSuccess(true);
            result.setMessage("Login successful!");
            result.setAdmin(admin);
        } catch(Exception e) {
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        }
        return result;
    }


    @Autowired
    private ICourseRepository courseRepo;

    @Autowired
    private IUserRepository userRepo;

    public AdminStatsDTO getOverviewStats() {
        AdminStatsDTO stats = new AdminStatsDTO();
        
        // 1. Course Stats
        stats.setTotalCourses(courseRepo.count());
        stats.setUnassignedCount(courseRepo.countByTeacherIsNull());
        stats.setDepartmentCount(courseRepo.countDistinctDepartments());
        
        // 2. User Stats
        stats.setActiveFaculty(userRepo.countByRole("TEACHER"));
        stats.setTotalStudents(userRepo.countByRole("STUDENT"));
        
        // 3. System Stats
        stats.setActiveRoles(5); 

        return stats;
    }
}

