package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.course.CourseDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.application.services.CourseService;
import com.lms.backend.domain.entities.Course;
import com.lms.backend.domain.repositories.ICourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final ICourseRepository courseRepository;

    @GetMapping
    public List<Course> getAll() {
        return courseRepository.findAll();
    }

    @PostMapping("/upsert")
    public ResponseEntity<ResultDTO> upsert(@RequestBody CourseDTO dto) {
        return ResponseEntity.ok(courseService.saveOrUpdate(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResultDTO> delete(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.delete(id));
    }
}