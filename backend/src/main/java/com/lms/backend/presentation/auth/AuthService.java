package com.lms.backend.presentation.auth;

import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.domain.entities.User;
import com.lms.backend.domain.repositories.IUserRepository;
import com.lms.backend.domain.repositories.IAdminRepository;
import com.lms.backend.domain.repositories.ITeacherRepository; // Idagdag ito
import com.lms.backend.domain.repositories.IStudentRepository; // Idagdag ito
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final IUserRepository userRepository;
    private final IAdminRepository adminRepository; 
    private final ITeacherRepository teacherRepository; // Inject teacher repo
    private final IStudentRepository studentRepository; // Inject student repo
    private final PasswordEncoder passwordEncoder;

    public ResultDTO login(String email, String password) {
        ResultDTO result = new ResultDTO();
        var userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (passwordEncoder.matches(password, user.getPassword())) {
                result.setSuccess(true);

                String role = user.getRole() != null ? user.getRole() : "ADMIN";
                result.setRole(role);
                result.setMessage(role + " Access Granted");
                result.setUserid(user.getUserId()); 

                // --- SAFE ROLE-BASED PROFILE TARGETING ---
                // Dito natin kukunin ang pangalan direkta sa saktong profile table para walang conflict!
                String upperRole = role.toUpperCase();
                
                if ("ADMIN".equals(upperRole)) {
                    adminRepository.findByUserUserId(user.getUserId())
                            .ifPresent(admin -> result.setFullname(admin.getFullname()));
                } 
                else if ("TEACHER".equals(upperRole)) {
                    teacherRepository.findByUser_UserId(user.getUserId())
                            .ifPresent(teacher -> result.setFullname(teacher.getFullname()));
                } 
                else if ("STUDENT".equals(upperRole)) {
                    studentRepository.findByUser_UserId(user.getUserId())
                            .ifPresent(student -> result.setFullname(student.getFullname()));
                }

                // Kung sakaling blangko pa rin sa profiles, gamitin ang master user fullname or generic text
                if (result.getFullname() == null || result.getFullname().trim().isEmpty()) {
                    result.setFullname(user.getFullname() != null ? user.getFullname() : "LMS User");
                }

                // Tiyakin natin na hindi mapapakialaman o ma-ooverwryt ng helper na ito ang fullname na nakuha natin sa itaas!
                String finalName = result.getFullname();
                result.populateFromUser(user);
                result.setFullname(finalName); // Hard lock the correct name into the final payload

                return result;
            }
        }

        result.setSuccess(false);
        result.setMessage("Invalid email or password");
        return result;
    }
}