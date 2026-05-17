package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.grade.GradeDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.application.services.GradeService;
import com.lms.backend.domain.entities.Grade;
import com.lms.backend.domain.repositories.IGradeRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;
    private final IGradeRepository gradeRepository;

    @PostMapping("/submit")
    public ResponseEntity<ResultDTO> submitGrade(@Valid @RequestBody GradeDTO dto) {
        try {
            ResultDTO result = gradeService.saveOrUpdateGrade(dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResultDTO(false, "Error processing grade: " + e.getMessage()));
        }
    }

    @GetMapping("/teacher/{userId}/section/{section}")
    public ResponseEntity<List<Grade>> getSectionGrades(
            @PathVariable Long userId, 
            @PathVariable String section) {
        List<Grade> grades = gradeRepository.findByTeacher_User_UserIdAndSection(userId, section);
        System.out.println(">>> Fetching grades for Teacher User ID: " + userId + " | Section: " + section + " | Found: " + grades.size());
        return ResponseEntity.ok(grades);
    }

    // --- THE FIX: REAL-TIME STUDENT PORTAL TRACKER ---
    @GetMapping("/student/{userId}")
    public ResponseEntity<List<Grade>> getStudentGrades(@PathVariable Long userId) {
        System.out.println(">>> Fetching grades for Student User ID: " + userId);
        return ResponseEntity.ok(gradeRepository.findByStudent_User_UserId(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResultDTO> deleteGrade(@PathVariable Long id) {
        try {
            gradeRepository.deleteById(id);
            return ResponseEntity.ok(new ResultDTO(true, "Grade record deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResultDTO(false, "Grade record not found"));
        }
    }
}