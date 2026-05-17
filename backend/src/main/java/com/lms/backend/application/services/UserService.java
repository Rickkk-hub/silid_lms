package com.lms.backend.application.services;

import com.lms.backend.application.dto.student.StudentLoginDTO;
import com.lms.backend.application.dto.student.StudentRegisterDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.application.interfaces.IUserService;
import com.lms.backend.domain.entities.Student;
import com.lms.backend.domain.entities.User;
import com.lms.backend.domain.repositories.IStudentRepository;
import com.lms.backend.domain.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {

    private final IUserRepository userRepository;
    private final IStudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<User> findAllByRole(String role) {
        return userRepository.findAllByRole(role.toUpperCase());
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public ResultDTO StudentRegister(StudentRegisterDTO register) {
        ResultDTO result = new ResultDTO();
        try {
            // 1. Validations
            if (!register.getPassword().equals(register.getConfirmPassword())) {
                throw new Exception("Passwords do not match!");
            }

            if (userRepository.findByEmail(register.getEmail()).isPresent()) {
                throw new Exception("A user with this email already exists!");
            }

            // 2. Create and Save User (Login Credentials)
            User user = new User();
            user.setEmail(register.getEmail());
            user.setPassword(passwordEncoder.encode(register.getPassword()));
            user.setRole("STUDENT");
            user.setActive(true);
            
            // REAL-TIME SYNC: I-save ang fullname sa master users table
            user.setFullname(register.getFullname());
            
            User savedUser = userRepository.save(user);

            // 3. Create and Save Student Profile (Personal Details)
            Student student = new Student();
            student.setFullname(register.getFullname());
            student.setEmail(register.getEmail());
            student.setCourse(register.getCourse());
            student.setYear_level(register.getYear_level());
            student.setGender(register.getGender());
            student.setBirth_date(register.getBirth_date());
            student.setAddress(register.getAddress());
            student.setPhone_number(register.getPhone_number());
            student.setRole("STUDENT");
            student.setUser(savedUser); 

            studentRepository.save(student);

            result.setSuccess(true);
            result.setMessage("Student successfully registered!");
            result.setUserid(savedUser.getUserId());
            result.setRole(savedUser.getRole());
            result.setFullname(student.getFullname());

        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        }
        return result;
    }

    @Override
    public ResultDTO StudentLogin(StudentLoginDTO login) {
        ResultDTO result = new ResultDTO();
        try {
            User user = userRepository.findByEmail(login.getEmail())
                    .orElseThrow(() -> new Exception("Invalid email or password!"));

            if (!passwordEncoder.matches(login.getPassword(), user.getPassword())) {
                throw new Exception("Invalid email or password!");
            }

            result.setSuccess(true);
            result.setMessage("Login successful!");
            result.setUserid(user.getUserId());
            result.setRole(user.getRole());
            
            // --- THE REAL-TIME UNIFIED FIX ---
            // Dahil may fullname field na ang User entity mo, dirediretso na nating
            // makukuha ang pangalan (Noel Cerbito man o pangalan ng Student) mula sa master table!
            result.setFullname(user.getFullname());

        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        }
        return result;
    }
}