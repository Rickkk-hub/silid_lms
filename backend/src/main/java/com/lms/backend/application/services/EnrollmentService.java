package com.lms.backend.application.services;

import com.lms.backend.application.dto.EnrollmentDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.domain.entities.*;
import com.lms.backend.domain.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final IEnrollmentRepository enrollmentRepository;
    private final IStudentRepository studentRepository;
    private final ITeacherRepository teacherRepository;
    private final ICourseRepository courseRepository;

    /**
     * PROCESS ENROLLMENT: Used when a student joins a class.
     * This is what populates the Student Portal dropdown.
     */
    @Transactional
    public ResultDTO processEnrollment(EnrollmentDTO dto) {
        try {
            // 1. Validation
            Student student = studentRepository.findById(dto.getStudentId())
                    .orElseThrow(() -> new Exception("Student not found!"));
            Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                    .orElseThrow(() -> new Exception("Teacher not found!"));
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new Exception("Course not found!"));

            // 2. PREVENT DUPLICATES: Check if student is already in this section
            // This prevents the "Ghosting" of multiple identical records
            Optional<Enrollment> existing = enrollmentRepository
                .findByStudentIdAndCourseIdAndSection(dto.getStudentId(), dto.getCourseId(), dto.getSection());
            
            if (existing.isPresent()) {
                return new ResultDTO(false, "You are already enrolled in this section.");
            }

            // 3. Map Entity
            Enrollment enrollment = new Enrollment();
            enrollment.setStudent(student);
            enrollment.setTeacher(teacher);
            enrollment.setCourse(course); 
            
            enrollment.setSection(dto.getSection());
            enrollment.setSemester(dto.getSemester() != null ? dto.getSemester() : "2nd Semester");
            enrollment.setSchoolYear(dto.getSchoolYear() != null ? dto.getSchoolYear() : "2025-2026");
            enrollment.setDepartment(course.getDepartment()); // Auto-inherit from Course
            enrollment.setStatus("Active");
            enrollment.setEnrollmentDate(LocalDate.now());

            enrollmentRepository.save(enrollment);
            return new ResultDTO(true, "Successfully joined " + course.getCode() + " - " + dto.getSection());
        } catch (Exception e) {
            return new ResultDTO(false, "Join Error: " + e.getMessage());
        }
    }

    /**
     * INITIALIZE SECTION: Used by Teacher to open a class.
     */
    @Transactional
    public ResultDTO initializeSection(Map<String, Object> payload) {
        try {
            Long teacherId = Long.valueOf(payload.get("teacherId").toString());
            Long courseId = Long.valueOf(payload.get("courseId").toString());
            String sectionName = payload.get("section").toString();

            Teacher teacher = teacherRepository.findById(teacherId).orElseThrow();
            Course course = courseRepository.findById(courseId).orElseThrow();

            Enrollment sectionSkeleton = new Enrollment();
            sectionSkeleton.setTeacher(teacher);
            sectionSkeleton.setCourse(course);
            sectionSkeleton.setSection(sectionName);
            sectionSkeleton.setDepartment(course.getDepartment());
            
            sectionSkeleton.setRoom(payload.getOrDefault("room", "TBA").toString());
            sectionSkeleton.setSchedule(payload.getOrDefault("schedule", "TBA").toString());
            sectionSkeleton.setSemester("2nd Semester");
            sectionSkeleton.setSchoolYear("2025-2026");
            sectionSkeleton.setStatus("Template"); // Mark as Template until students join
            sectionSkeleton.setEnrollmentDate(LocalDate.now());

            enrollmentRepository.save(sectionSkeleton);
            return new ResultDTO(true, "Section " + sectionName + " initialized successfully.");
        } catch (Exception e) {
            return new ResultDTO(false, "Creation Error: " + e.getMessage());
        }
    }
}