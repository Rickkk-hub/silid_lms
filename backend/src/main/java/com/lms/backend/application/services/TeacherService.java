package com.lms.backend.application.services;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.lms.backend.application.dto.ResultDTO;
import com.lms.backend.application.dto.TeacherLoginDTO;
import com.lms.backend.application.dto.TeacherRegisterDTO;
import com.lms.backend.application.interfaces.ITeacherService;
import com.lms.backend.domain.entities.Teacher;
import com.lms.backend.domain.entities.User;
import com.lms.backend.domain.repositories.ITeacherRepository;
import com.lms.backend.domain.repositories.IUserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeacherService implements ITeacherService {
    
    private final ITeacherRepository teacherRepository;
    private final IUserRepository userRepository; // We need this to link the User identity
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional // Ensures both User and Teacher are saved, or neither is
    public ResultDTO TeacherRegister(TeacherRegisterDTO register) {
        ResultDTO result = new ResultDTO();
        try {
            if(!register.getPassword().equals(register.getConfirmpassword())) {
                throw new IllegalArgumentException("Passwords do not match!");
            }

            // Check if User already exists in the centralized Users table
            if(userRepository.findByEmail(register.getEmail()).isPresent()){
                throw new IllegalArgumentException("Email is already registered!");
            }

            // 1. Create the Base User (Credentials)
            User user = new User();
            user.setFullname(register.getFullname());
            user.setEmail(register.getEmail());
            user.setPassword(passwordEncoder.encode(register.getPassword()));
            user.setRole("TEACHER");
            User savedUser = userRepository.save(user);

            // 2. Create the Teacher Profile linked to that User
            Teacher teacher = new Teacher();
            teacher.setUser(savedUser); // This is the link from your diagram
            // If you have faculty_number in your DTO, set it here:
            // teacher.setFacultyNumber(register.getFacultyNumber());

            Teacher savedTeacher = teacherRepository.save(teacher);
            
            result.setSuccess(true);
            result.setMessage("Teacher successfully registered!");
            result.setTeacher(savedTeacher);
        } catch(Exception e) { 
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        }
        return result;
    }
    
    @Override
    public ResultDTO TeacherLogin(TeacherLoginDTO login) {
        ResultDTO result = new ResultDTO();
        try {
            // Find the Teacher by reaching through the User relationship
            Teacher teacher = teacherRepository.findByUserEmail(login.getEmail())
                .orElseThrow(() -> new Exception("Invalid email or password"));
      
            if(!passwordEncoder.matches(login.getPassword(), teacher.getUser().getPassword())) {
                throw new Exception("Invalid email or password");
            }

            result.setSuccess(true);
            result.setMessage("Login successful!");
            result.setTeacher(teacher);
        } catch(Exception e) {
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        }
        return result;
    }
}