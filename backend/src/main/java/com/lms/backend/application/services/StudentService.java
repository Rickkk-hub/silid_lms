package com.lms.backend.application.services;

import com.lms.backend.application.dto.student.StudentRegisterDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.domain.entities.Enrollment;
import com.lms.backend.domain.entities.Student;
import com.lms.backend.domain.entities.User;
import com.lms.backend.domain.repositories.IStudentRepository;
import com.lms.backend.domain.repositories.IUserRepository;
import com.lms.backend.domain.repositories.IEnrollmentRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final IStudentRepository studentRepository;
    private final IUserRepository userRepository;
    private final IEnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ResultDTO registerStudent(StudentRegisterDTO dto) {
        ResultDTO result = new ResultDTO();
        try {
            if (!dto.getPassword().equals(dto.getConfirmPassword())) {
                throw new Exception("Passwords do not match!");
            }
            if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
                throw new Exception("Email already exists!");
            }

            User user = new User();
            user.setEmail(dto.getEmail());
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            user.setRole("STUDENT");
            user.setActive(true);
            User savedUser = userRepository.save(user);

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

    // --- NEW: UPDATE STUDENT WITH DYNAMIC SECURITY SYNC ---
    @Transactional
    public ResultDTO updateStudent(Long id, StudentRegisterDTO dto) {
        ResultDTO result = new ResultDTO();
        try {
            Student student = studentRepository.findById(id)
                    .orElseThrow(() -> new Exception("Student record not found!"));

            // Validation Guard para sa pag-check ng email duplicates sa ibang accounts
            var dynamicUserCheck = userRepository.findByEmail(dto.getEmail());
            if (dynamicUserCheck.isPresent() && !dynamicUserCheck.get().getEmail().equals(student.getEmail())) {
                throw new Exception("Email is already taken by another user!");
            }

            student.setFullname(dto.getFullname());
            student.setEmail(dto.getEmail());
            student.setCourse(dto.getCourse());
            student.setYear_level(dto.getYear_level());
            student.setGender(dto.getGender());
            student.setBirth_date(dto.getBirth_date());
            student.setAddress(dto.getAddress());
            student.setPhone_number(dto.getPhone_number());
            studentRepository.save(student);

            User user = student.getUser();
            if (user != null) {
                user.setEmail(dto.getEmail());
                if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
                    if (!dto.getPassword().equals(dto.getConfirmPassword())) {
                        throw new Exception("Passwords do not match!");
                    }
                    user.setPassword(passwordEncoder.encode(dto.getPassword()));
                }
                userRepository.save(user);
            }

            result.setSuccess(true);
            result.setMessage("Student account configurations saved.");
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        }
        return result;
    }

    // --- NEW: DELETE STUDENT WITH CASCADE REGISTRY PURGE ---
    @Transactional
public ResultDTO deleteStudent(Long id) {
    ResultDTO result = new ResultDTO();
    try {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new Exception("Student record not found!"));
        List<Enrollment> studentActiveRecords = enrollmentRepository.findByStudent_User_UserId(student.getUser().getUserId());
        
        if (!studentActiveRecords.isEmpty()) {
            throw new Exception("Cannot delete student! This student is currently officially linked/enrolled in active sections.");
        }

        User user = student.getUser();
        studentRepository.delete(student);

        if (user != null) {
            userRepository.delete(user);
        }

        result.setSuccess(true);
        result.setMessage("Student master profile successfully destroyed.");
    } catch (Exception e) {
        result.setSuccess(false);
        result.setMessage(e.getMessage());
    }
    return result;
}
}