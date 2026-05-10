package com.lms.backend.presentation.auth;

import com.lms.backend.application.dto.ResultDTO;
import com.lms.backend.domain.entities.Teacher;
import com.lms.backend.domain.entities.User;
import com.lms.backend.domain.repositories.ITeacherRepository;
import com.lms.backend.domain.repositories.IUserRepository;
import com.lms.backend.domain.repositories.IStudentRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final IUserRepository userRepository;
    private final ITeacherRepository teacherRepository;
    private final IStudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public ResultDTO login(String email, String password) {
        ResultDTO result = new ResultDTO();
        var userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            if (passwordEncoder.matches(password, user.getPassword())) {
                result.setSuccess(true);
                result.setId(user.getId()); // Crucial for frontend storage
                result.setRole(user.getRole());
                result.setEmail(user.getEmail()); 
                result.setFullname(user.getFullname());
                
                // --- ROLE-SPECIFIC DATA FETCHING ---
                
                if ("TEACHER".equals(user.getRole())) {
                    result.setTeacher(teacherRepository.findByUserId(user.getId()).orElse(null));
                } 
                else if ("STUDENT".equals(user.getRole())) {
                    result.setStudent(studentRepository.findByUserId(user.getId()).orElse(null));
                }
                else if ("ADMIN".equals(user.getRole())) {
                    // ADMINs don't have a linked Teacher/Student table.
                    // Just return the success and basic user info.
                    result.setMessage("Administrator Access Granted");
                }
                
                return result;
            }
        }

        result.setSuccess(false);
        result.setMessage("Invalid email or password");
        return result;
    }
}