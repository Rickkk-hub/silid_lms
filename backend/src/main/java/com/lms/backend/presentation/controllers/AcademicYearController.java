package com.lms.backend.presentation.controllers;

import com.lms.backend.domain.entities.AcademicYear;
import com.lms.backend.domain.repositories.IAcademicYearRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academic-years")
@RequiredArgsConstructor
public class AcademicYearController {

    private final IAcademicYearRepository academicYearRepo;

    @GetMapping
    public ResponseEntity<List<AcademicYear>> getAll() {
        // Returns all academic years so the teacher can select one in the modal
        return ResponseEntity.ok(academicYearRepo.findAll());
    }

    @PostMapping
    public ResponseEntity<AcademicYear> create(@RequestBody AcademicYear academicYear) {
        return ResponseEntity.ok(academicYearRepo.save(academicYear));
    }
}