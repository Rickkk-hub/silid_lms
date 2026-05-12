package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.teacher.TeacherRegisterDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.application.services.TeacherService;
import com.lms.backend.domain.entities.Teacher;
import com.lms.backend.domain.repositories.ITeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;
    private final ITeacherRepository teacherRepository;

    @PostMapping("/register")
    public ResponseEntity<ResultDTO> register(@RequestBody TeacherRegisterDTO dto) {
        ResultDTO result = teacherService.registerTeacher(dto);
        return result.isSuccess() ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    @GetMapping
    public ResponseEntity<List<Teacher>> getAllTeachers() {
        return ResponseEntity.ok(teacherRepository.findAll());
    }
}