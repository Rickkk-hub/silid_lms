package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.grade.GradeDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.application.services.GradeService;
import com.lms.backend.domain.entities.Grade;
import com.lms.backend.domain.repositories.IGradeRepository;
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
    public ResponseEntity<ResultDTO> submitGrade(@RequestBody GradeDTO dto) {
        try {
            ResultDTO result = gradeService.saveOrUpdateGrade(dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResultDTO(false, "Error processing grade: " + e.getMessage()));
        }
    }

    // Aligned for Teacher Dashboard: Fetches all grades for a specific section
    @GetMapping("/teacher/{teacherId}/section/{section}")
    public ResponseEntity<List<Grade>> getSectionGrades(
            @PathVariable Long teacherId, 
            @PathVariable String section) {
        
        // This ensures the teacher only sees grades they personally gave to that section
        List<Grade> grades = gradeRepository.findByTeacherIdAndSection(teacherId, section);
        
        // LOGGING (Visible in your Spring Console) to verify data is reaching the controller
        System.out.println(">>> Fetching grades for Section: " + section + " | Count: " + grades.size());
        
        return ResponseEntity.ok(grades);
    }

    // Aligned for Student Portal
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Grade>> getStudentGrades(@PathVariable Long studentId) {
        return ResponseEntity.ok(gradeRepository.findByStudentId(studentId));
    }

    // Delete Grade (Useful for the Admin or Teacher cleanup)
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