package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.EnrollmentDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.application.services.EnrollmentService;
import com.lms.backend.domain.entities.Enrollment;
import com.lms.backend.domain.repositories.IEnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final IEnrollmentRepository enrollmentRepository;

    @PostMapping("/enroll")
    public ResponseEntity<ResultDTO> enroll(@RequestBody EnrollmentDTO dto) {
        ResultDTO result = enrollmentService.processEnrollment(dto);
        return result.isSuccess() ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    @PostMapping("/create-section")
    public ResponseEntity<ResultDTO> createSection(@RequestBody Map<String, Object> payload) {
        ResultDTO result = enrollmentService.initializeSection(payload);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Enrollment>> getStudentEnrollments(@PathVariable Long studentId) {
        List<Enrollment> list = enrollmentRepository.findByStudentId(studentId);
        // This log will confirm if Student 4 has data in the DB
        System.out.println(">>> Request for Student " + studentId + " | Records found: " + list.size());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Enrollment>> listByTeacher(@PathVariable Long teacherId) {
        return ResponseEntity.ok(enrollmentRepository.findByTeacherId(teacherId));
    }

    @GetMapping
    public ResponseEntity<List<Enrollment>> listAll() {
        return ResponseEntity.ok(enrollmentRepository.findAll());
    }
}