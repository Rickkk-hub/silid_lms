package com.lms.backend.application.services;

import com.lms.backend.application.dto.teacher.TeacherRegisterDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.domain.entities.Teacher;
import com.lms.backend.domain.entities.User;
import com.lms.backend.domain.repositories.ITeacherRepository;
import com.lms.backend.domain.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TeacherService {
    private final ITeacherRepository teacherRepository;
    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ResultDTO registerTeacher(TeacherRegisterDTO dto) {
        ResultDTO result = new ResultDTO();
        try {
            if (!dto.getPassword().equals(dto.getConfirmPassword())) {
                throw new Exception("Passwords do not match!");
            }

            User user = new User();
            user.setEmail(dto.getEmail());
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            user.setRole("TEACHER");
            user.setActive(true);
            user.setFullname(dto.getFullname());

            User savedUser = userRepository.save(user);

            Teacher teacher = new Teacher();
            teacher.setFullname(dto.getFullname());
            teacher.setEmail(dto.getEmail());
            teacher.setDepartment(dto.getDepartment());
            teacher.setPhone_number(dto.getPhone_number());
            teacher.setAddress(dto.getAddress());
            teacher.setRole("TEACHER");
            teacher.setUser(savedUser);

            teacherRepository.save(teacher);

            result.setSuccess(true);
            result.setMessage("Teacher account created successfully!");
            result.setFullname(teacher.getFullname());
            
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        }
        return result;
    }

    // --- NEW: UPDATE TEACHER PROFILE AND MASTER ACCOUNT ---
    @Transactional
    public ResultDTO updateTeacher(Long id, TeacherRegisterDTO dto) {
        ResultDTO result = new ResultDTO();
        try {
            Teacher teacher = teacherRepository.findById(id)
                    .orElseThrow(() -> new Exception("Teacher record not found!"));

            teacher.setFullname(dto.getFullname());
            teacher.setEmail(dto.getEmail());
            teacher.setDepartment(dto.getDepartment());
            teacher.setPhone_number(dto.getPhone_number());
            teacher.setAddress(dto.getAddress());
            teacherRepository.save(teacher);

            User user = teacher.getUser();
            if (user != null) {
                user.setFullname(dto.getFullname());
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
            result.setMessage("Teacher account updated successfully!");
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        }
        return result;
    }

    // --- NEW: PURGE TEACHER PROFILE AND SECURITY CREDENTIALS ---
    @Transactional
    public ResultDTO deleteTeacher(Long id) {
        ResultDTO result = new ResultDTO();
        try {
            Teacher teacher = teacherRepository.findById(id)
                    .orElseThrow(() -> new Exception("Teacher record not found!"));

            User user = teacher.getUser();

            teacherRepository.delete(teacher);

            if (user != null) {
                userRepository.delete(user);
            }

            result.setSuccess(true);
            result.setMessage("Teacher account successfully purged from registry.");
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        }
        return result;
    }
}