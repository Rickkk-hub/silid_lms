package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.student.StudentRegisterDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.application.services.StudentService;
import com.lms.backend.domain.entities.Student;
import com.lms.backend.domain.repositories.IStudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final IStudentRepository studentRepository;

    @PostMapping("/register")
    public ResponseEntity<ResultDTO> register(@RequestBody StudentRegisterDTO dto) {
        ResultDTO result = studentService.registerStudent(dto);
        return result.isSuccess() ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll());
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<Student> getProfile(@PathVariable long userId) {
        return studentRepository.findByUserUserid(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}