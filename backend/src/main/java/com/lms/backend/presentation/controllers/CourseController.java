package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.CourseDTO;
import com.lms.backend.application.services.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses") // Updated to match Admin Dashboard routing
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    // 1. GET ALL COURSES
    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAll() {
        return ResponseEntity.ok(courseService.findAll());
    }

    // 2. CREATE NEW COURSE
    @PostMapping
    public ResponseEntity<CourseDTO> create(@RequestBody CourseDTO courseDTO) {
        return ResponseEntity.ok(courseService.save(courseDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseDTO> update(@PathVariable UUID id, @RequestBody CourseDTO courseDTO) {
        // We pass the ID from the URL to ensure we update the correct record
        return ResponseEntity.ok(courseService.update(id, courseDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        courseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}