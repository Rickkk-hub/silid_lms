package com.lms.backend.application.services;

import com.lms.backend.application.dto.StudentDTO;
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
    private final IStudentRepository studentRepo;
    private final IUserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public StudentDTO registerStudent(StudentDTO dto) {
        // 1. Create the User Identity
        User user = new User();
        user.setFullname(dto.getFullname());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole("STUDENT"); // Matches your User.java default
        User savedUser = userRepo.save(user);

        // 2. Create the Student Profile linked to that User
        Student student = new Student();
        student.setUser(savedUser);
        student.setStudentNumber(dto.getStudentNumber());
        student.setProgram(dto.getProgram());
        student.setYearLevel(dto.getYearLevel());

        Student savedStudent = studentRepo.save(student);
        return mapToDTO(savedStudent);
    }

    private StudentDTO mapToDTO(Student s) {
        StudentDTO dto = new StudentDTO();
        dto.setId(s.getId());
        dto.setUserId(s.getUser().getId());
        dto.setFullname(s.getUser().getFullname());
        dto.setEmail(s.getUser().getEmail());
        dto.setStudentNumber(s.getStudentNumber());
        dto.setProgram(s.getProgram());
        dto.setYearLevel(s.getYearLevel());
        return dto;
    }
}