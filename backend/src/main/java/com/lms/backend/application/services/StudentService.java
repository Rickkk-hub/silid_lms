package com.lms.backend.application.services;

import com.lms.backend.application.dto.student.StudentRegisterDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.domain.entities.Student;
import com.lms.backend.domain.entities.User;
import com.lms.backend.domain.repositories.IStudentRepository;
import com.lms.backend.domain.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final IStudentRepository studentRepository;
    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ResultDTO registerStudent(StudentRegisterDTO dto) {
        ResultDTO result = new ResultDTO();
        try {
            // 1. Validations
            if (!dto.getPassword().equals(dto.getConfirmPassword())) {
                throw new Exception("Passwords do not match!");
            }
            if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
                throw new Exception("Email already exists!");
            }

            // 2. Create Security User
            User user = new User();
            user.setEmail(dto.getEmail());
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            user.setRole("STUDENT");
            user.setActive(true);
            User savedUser = userRepository.save(user);

            // 3. Create Student Profile
            Student student = new Student();
            student.setFullname(dto.getFullname());
            student.setEmail(dto.getEmail());
            student.setCourse(dto.getCourse());
            student.setYear_level(dto.getYear_level());
            student.setGender(dto.getGender());
            student.setBirth_date(dto.getBirth_date());
            student.setAddress(dto.getAddress());
            student.setPhone_number(dto.getPhone_number());
            student.setRole("STUDENT");
            student.setUser(savedUser);

            studentRepository.save(student);

            result.setSuccess(true);
            result.setMessage("Student " + student.getFullname() + " registered successfully!");
            result.setFullname(student.getFullname());
            result.populateFromUser(savedUser);

        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        }
        return result;
    }
}