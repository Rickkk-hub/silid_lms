package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.EnrollmentDTO;
import com.lms.backend.application.services.EnrollmentService;
import com.lms.backend.domain.entities.Enrollment;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    @PostMapping
    public ResponseEntity<EnrollmentDTO> enroll(@RequestBody EnrollmentDTO dto) {
        return ResponseEntity.ok(enrollmentService.enroll(dto));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<EnrollmentDTO>> getMyClasses(@PathVariable UUID studentId) {
        return ResponseEntity.ok(enrollmentService.getStudentEnrollments(studentId));
    }

    @GetMapping("/section/{sectionId}")
    public ResponseEntity<List<EnrollmentDTO>> getBySection(@PathVariable UUID sectionId) {
        return ResponseEntity.ok(enrollmentService.getBySection(sectionId));
    }

}