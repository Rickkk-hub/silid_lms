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
    public ResponseEntity<List<Course>> getAll() {
        List<Course> list = courseRepository.findAllWithTeacher();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/upsert")
    public ResponseEntity<ResultDTO> upsert(@RequestBody CourseDTO dto) {
        ResultDTO result = courseService.saveOrUpdate(dto);

        if (!result.isSuccess()) {
            return ResponseEntity.badRequest().body(result);
        }

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResultDTO> delete(@PathVariable Long id) {
        ResultDTO result = courseService.delete(id);

        if (!result.isSuccess()) {
            return ResponseEntity.badRequest().body(result);
        }

        return ResponseEntity.ok(result);
    }
}