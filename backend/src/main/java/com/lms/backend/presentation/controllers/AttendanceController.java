package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.*;
import com.lms.backend.application.services.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService service;

    /**
     * Fetches attendance history for a specific student.
     * The ID here is the Student UUID (from the students table).
     */
    @GetMapping("/student/{id}/history")
    public ResponseEntity<List<AttendanceResponseDTO>> getStudentHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getStudentAttendanceHistory(id));
    }

    /**
     * Fetches attendance records for all students in a specific teacher's sections.
     * The ID here is the Teacher UUID.
     */
    @GetMapping("/teacher/{id}/history")
    public ResponseEntity<List<AttendanceResponseDTO>> getTeacherHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getTeacherAttendanceHistory(id));
    }

    /**
     * Fetches the 10 most recent attendance logs for a teacher's dashboard.
     */
    @GetMapping("/teacher/{id}/recent")
    public ResponseEntity<List<AttendanceResponseDTO>> getRecent(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getRecentTeacherAttendance(id));
    }

    /**
     * Submits a new attendance record.
     * Expects studentId (Student UUID) and sectionId in the request body.
     */
    @PostMapping("/submit")
    public ResponseEntity<AttendanceResponseDTO> submit(
            @RequestBody AttendanceRequestDTO dto
    ) {
        // service.submitAttendance now uses IStudentRepository to find the student
        return ResponseEntity.ok(service.submitAttendance(dto));
    }
}