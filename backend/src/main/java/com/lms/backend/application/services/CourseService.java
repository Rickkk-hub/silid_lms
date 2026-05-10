package com.lms.backend.application.services;

import com.lms.backend.application.dto.CourseDTO;
import com.lms.backend.domain.entities.Course;
import com.lms.backend.domain.repositories.ICourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID; // <--- The most important fix
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final ICourseRepository courseRepository;

    public List<CourseDTO> findAll() {
        return courseRepository.findAll().stream()
                .map(this::mapToDTO) // Calls the helper below
                .collect(Collectors.toList());
    }

    public CourseDTO save(CourseDTO dto) {
        // Check if code already exists to avoid the 500 error
        if (courseRepository.findByCode(dto.getCode()).isPresent()) {
            throw new RuntimeException("Course code " + dto.getCode() + " already exists!");
        }

        Course course = new Course();
        course.setCode(dto.getCode());
        course.setTitle(dto.getTitle());
        course.setDepartment(dto.getDepartment());
        course.setUnits(dto.getUnits());

        Course saved = courseRepository.save(course);
        return mapToDTO(saved);
    }

    // FIX: Added the update method
    public CourseDTO update(UUID id, CourseDTO dto) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        course.setCode(dto.getCode());
        course.setTitle(dto.getTitle());
        course.setDepartment(dto.getDepartment());
        course.setUnits(dto.getUnits());

        return mapToDTO(courseRepository.save(course));
    }

    // FIX: Added the delete method
    public void delete(UUID id) {
        courseRepository.deleteById(id);
    }

    // FIX: The missing helper method
    private CourseDTO mapToDTO(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setCode(course.getCode());
        dto.setTitle(course.getTitle());
        dto.setDepartment(course.getDepartment());
        dto.setUnits(course.getUnits());
        dto.setActive(course.isActive());
        return dto;
    }
}