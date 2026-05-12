package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.AttendanceDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.application.services.AttendanceService;
import com.lms.backend.domain.entities.Attendance;
import com.lms.backend.domain.repositories.IAttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService attendanceService;
    private final IAttendanceRepository attendanceRepository;

    @PostMapping("/mark")
    public ResponseEntity<ResultDTO> mark(@RequestBody AttendanceDTO dto) {
        return ResponseEntity.ok(attendanceService.markAttendance(dto));
    }

    // FIX: Provides data for the "Live Logs" card (Resolves 404)
    @GetMapping("/teacher/{teacherId}/recent")
    public ResponseEntity<List<Attendance>> getRecentLogs(@PathVariable Long teacherId) {
        return ResponseEntity.ok(attendanceRepository.findTop5ByTeacherIdOrderByDateDesc(teacherId));
    }

    // FIX: Provides data for the "Audit Logs" table (Resolves 404)
    @GetMapping("/teacher/{teacherId}/history")
    public ResponseEntity<List<Attendance>> getFullHistory(@PathVariable Long teacherId) {
        return ResponseEntity.ok(attendanceRepository.findByTeacherIdOrderByDateDesc(teacherId));
    }

    @GetMapping("/section/{section}/date/{date}")
    public ResponseEntity<List<Attendance>> getBySectionAndDate(
            @PathVariable String section,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceRepository.findBySectionAndDate(section, date));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Attendance>> getStudentHistory(@PathVariable Long studentId) {
    return ResponseEntity.ok(attendanceRepository.findByStudentId(studentId));
 }
}