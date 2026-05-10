package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.GradeDTO;
import com.lms.backend.application.dto.GradeResponseDTO;
import com.lms.backend.application.services.GradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {
    private final GradeService gradeService;

    // For Teacher: Get the summary table
    @GetMapping("/section/{sectionId}/summary")
    public ResponseEntity<List<GradeResponseDTO>> getSummary(@PathVariable UUID sectionId) {
        return ResponseEntity.ok(gradeService.getSectionClassRecord(sectionId));
    }

    // For Student: Dashboard summary
    @GetMapping("/student/{userId}/summary")
    public ResponseEntity<List<GradeResponseDTO>> getStudentSummary(@PathVariable UUID userId) {
        return ResponseEntity.ok(gradeService.getStudentAcademicSummary(userId));
    }

    // FIX FOR 404: The Batch Entry Modal calls this
    @PostMapping("/batch")
    public ResponseEntity<Void> submitBatchGrades(@RequestBody List<GradeDTO> dtos) {
        gradeService.saveBatchGrades(dtos); // Make sure this method exists in GradeService
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<GradeDTO> submitGrade(@RequestBody GradeDTO dto) {
        return ResponseEntity.ok(gradeService.saveGrade(dto));
    }
}