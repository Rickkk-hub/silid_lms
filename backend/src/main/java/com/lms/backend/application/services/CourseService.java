package com.lms.backend.application.services;

import com.lms.backend.application.dto.course.CourseDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.domain.entities.Course;
import com.lms.backend.domain.repositories.ICourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Para sa logging
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseService {

    private final ICourseRepository courseRepository;

    @Transactional
    public ResultDTO saveOrUpdate(CourseDTO dto) {
        try {
            Course course;

            if (dto.getId() != null) {
                // UPDATE LOGIC
                course = courseRepository.findById(dto.getId())
                        .orElseThrow(() -> new Exception("Course not found with ID: " + dto.getId()));
                
                // Duplicate Code Check (Ignoring itself)
                boolean exists = courseRepository.findByCode(dto.getCode())
                        .map(c -> !c.getId().equals(dto.getId()))
                        .orElse(false);

                if (exists) {
                    return new ResultDTO(false, "Course code '" + dto.getCode() + "' is already in use.");
                }
            } else {
                // CREATE LOGIC
                if (courseRepository.existsByCode(dto.getCode())) {
                    return new ResultDTO(false, "Course code '" + dto.getCode() + "' already exists.");
                }
                course = new Course();
            }

            // Mapping DTO to Entity
            course.setCode(dto.getCode());
            course.setTitle(dto.getTitle());
            course.setDepartment(dto.getDepartment());
            course.setDescription(dto.getDescription());
            course.setUnits(dto.getUnits());

            courseRepository.save(course);

            String action = (dto.getId() != null) ? "updated" : "created";
            return new ResultDTO(true, "Course " + dto.getCode() + " successfully " + action + ".");

        } catch (Exception e) {
            log.error("Failed to save/update course: ", e); // Handled the exception properly
            return new ResultDTO(false, "System Error: " + e.getMessage());
        }
    }

    @Transactional
    public ResultDTO delete(Long id) {
        try {
            if (!courseRepository.existsById(id)) {
                return new ResultDTO(false, "Cannot delete: Record does not exist.");
            }

            courseRepository.deleteById(id);
            return new ResultDTO(true, "Course has been successfully removed.");
        } catch (Exception e) {
            log.error("Course deletion failed for ID {}: ", id, e); // Handled the exception
            return new ResultDTO(false, "Deletion failed. Ensure no other records are linked to this course.");
        }
    }
}