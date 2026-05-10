package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.StudentDTO;
import com.lms.backend.application.services.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService studentService;

    @PostMapping("/register")
    public ResponseEntity<StudentDTO> register(@RequestBody StudentDTO dto) {
        return ResponseEntity.ok(studentService.registerStudent(dto));
    }
}