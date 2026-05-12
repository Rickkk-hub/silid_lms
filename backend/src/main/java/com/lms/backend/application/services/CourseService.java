package com.lms.backend.application.services;

import com.lms.backend.application.dto.course.CourseDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.domain.entities.Course;
import com.lms.backend.domain.repositories.ICourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final ICourseRepository courseRepository;

    public ResultDTO saveOrUpdate(CourseDTO dto) {
        try {
            Course course;

            if (dto.getId() != null) {
                // UPDATE LOGIC: Fetch the existing course
                course = courseRepository.findById(dto.getId())
                        .orElseThrow(() -> new Exception("Course with ID " + dto.getId() + " not found."));
            } else {
                // CREATE LOGIC: Check for duplicate course codes before saving
                if (courseRepository.existsByCode(dto.getCode())) {
                    return new ResultDTO(false, "Course code '" + dto.getCode() + "' already exists.");
                }
                course = new Course();
            }

            course.setCode(dto.getCode());
            course.setTitle(dto.getTitle());
            course.setDescription(dto.getDescription());
            course.setUnits(dto.getUnits());

            courseRepository.save(course);

            String action = (dto.getId() != null) ? "updated" : "saved";
            return new ResultDTO(true, "Course " + dto.getCode() + " " + action + " successfully.");

        } catch (Exception e) {
            // SonarQube fix: Ensure the exception is logged or handled properly
            return new ResultDTO(false, "Error: " + e.getMessage());
        }
    }

    public ResultDTO delete(Long id) {
        try {
            // Check if it exists before trying to delete to avoid empty result exceptions
            if (!courseRepository.existsById(id)) {
                return new ResultDTO(false, "Cannot delete: Course not found.");
            }

            courseRepository.deleteById(id);
            return new ResultDTO(true, "Course removed successfully.");
        } catch (Exception e) {
            return new ResultDTO(false, "Delete failed: " + e.getMessage());
        }
    }
}