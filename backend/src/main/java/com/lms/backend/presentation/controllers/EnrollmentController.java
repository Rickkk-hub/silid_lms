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
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final IEnrollmentRepository enrollmentRepository;

    @PostMapping("/create-section")
    public ResponseEntity<ResultDTO> createSection(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(enrollmentService.initializeSection(payload));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ResultDTO> update(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(enrollmentService.updateSection(id, payload));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResultDTO> delete(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.deleteSection(id));
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<ResultDTO> approve(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.approveEnrollment(id));
    }

    @PutMapping("/decline/{id}")
    public ResponseEntity<ResultDTO> decline(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.declineEnrollment(id));
    }

    // --- NEW API ENDPOINT FOR STUDENT RESCUE OPERATIONS ---
    @DeleteMapping("/purge-student/{studentId}")
    public ResponseEntity<Void> purgeStudentRecords(@PathVariable Long studentId) {
        enrollmentService.purgeStudentEnrollments(studentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/open")
    public ResponseEntity<List<Enrollment>> getOpenEnrollments() {
        return ResponseEntity.ok(enrollmentRepository.findByStatusAndStudentIsNull("OPEN"));
    }

    @PostMapping("/enroll")
    public ResponseEntity<ResultDTO> enroll(@RequestBody EnrollmentDTO dto) {
        ResultDTO result = enrollmentService.requestEnrollment(dto);
        return result.isSuccess() ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    @GetMapping("/student/{userId}")
    public ResponseEntity<List<Enrollment>> getStudentEnrollments(@PathVariable Long userId) {
        return ResponseEntity.ok(enrollmentRepository.findByStudent_User_UserId(userId));
    }

    @GetMapping("/teacher/{userId}")
    public ResponseEntity<List<Enrollment>> getTeacherEnrollments(@PathVariable Long userId) {
        return ResponseEntity.ok(enrollmentRepository.findByTeacher_User_UserId(userId));
    }

    @GetMapping
    public ResponseEntity<List<Enrollment>> listAll() {
        return ResponseEntity.ok(enrollmentRepository.findAll());
    }
}