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

    // UPDATED: Now uses the UserID bridge
    @GetMapping("/teacher/{userId}/recent")
    public ResponseEntity<List<Attendance>> getRecentLogs(@PathVariable Long userId) {
        return ResponseEntity.ok(attendanceRepository.findTop5ByTeacher_User_UserIdOrderByDateDesc(userId));
    }

    // UPDATED: Now uses the UserID bridge
    @GetMapping("/teacher/{userId}/history")
    public ResponseEntity<List<Attendance>> getFullHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(attendanceRepository.findByTeacher_User_UserIdOrderByDateDesc(userId));
    }

    // UPDATED: Student Portal View
    @GetMapping("/student/{userId}")
    public ResponseEntity<List<Attendance>> getStudentHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(attendanceRepository.findByStudent_User_UserId(userId));
    }

    @GetMapping("/section/{section}/date/{date}")
    public ResponseEntity<List<Attendance>> getBySectionAndDate(
            @PathVariable String section,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceRepository.findBySectionAndDate(section, date));
    }
}