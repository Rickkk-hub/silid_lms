package com.lms.backend.application.services;

import com.lms.backend.application.dto.EnrollmentDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.domain.entities.*;
import com.lms.backend.domain.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final IEnrollmentRepository enrollmentRepository;
    private final IStudentRepository studentRepository;
    private final ITeacherRepository teacherRepository;
    private final ICourseRepository courseRepository;

    @Transactional
    public ResultDTO updateSection(Long id, Map<String, Object> payload) {
        try {
            Enrollment section = enrollmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Section record not found."));

            if (payload.containsKey("section")) section.setSection(payload.get("section").toString());
            if (payload.containsKey("room")) section.setRoom(payload.get("room").toString());
            if (payload.containsKey("schedule")) section.setSchedule(payload.get("schedule").toString());
            if (payload.containsKey("semester")) section.setSemester(payload.get("semester").toString());
            if (payload.containsKey("schoolYear")) section.setSchoolYear(payload.get("schoolYear").toString());
            if (payload.containsKey("department")) section.setDepartment(payload.get("department").toString());

            enrollmentRepository.save(section);
            return new ResultDTO(true, "Registry record updated successfully.");
        } catch (Exception e) {
            log.error("Update failed: ", e);
            return new ResultDTO(false, "Update failed: " + e.getMessage());
        }
    }

    @Transactional
    public ResultDTO deleteSection(Long id) {
        try {
            Enrollment enrollment = enrollmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Section not found."));

            if (enrollment.getStudent() != null) {
                return new ResultDTO(false, "Cannot delete a record that is already Enrolled this student.");
            }

            enrollmentRepository.delete(enrollment);
            return new ResultDTO(true, "Section removed from registry.");
        } catch (Exception e) {
            log.error("Delete failed: ", e);
            return new ResultDTO(false, "Delete failed: " + e.getMessage());
        }
    }

    @Transactional
    public ResultDTO initializeSection(Map<String, Object> payload) {
        try {
            Long teacherId = Long.valueOf(payload.get("teacherId").toString());
            Long courseId = Long.valueOf(payload.get("courseId").toString());

            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            Enrollment section = new Enrollment();
            section.setTeacher(teacher);
            section.setCourse(course);
            section.setSection(payload.get("section").toString());
            section.setDepartment(payload.getOrDefault("department", "CCS").toString());
            section.setRoom(payload.getOrDefault("room", "TBA").toString());
            section.setSchedule(payload.getOrDefault("schedule", "TBA").toString());
            section.setSemester(payload.getOrDefault("semester", "1st Semester").toString());
            section.setSchoolYear(payload.getOrDefault("schoolYear", "2025-2026").toString());
            
            section.setStatus("OPEN");
            enrollmentRepository.save(section);
            return new ResultDTO(true, "Section created successfully for catalog.");
        } catch (Exception e) {
            log.error("Initialization Error: ", e);
            return new ResultDTO(false, "Creation Error: " + e.getMessage());
        }
    }

    @Transactional
    public ResultDTO requestEnrollment(EnrollmentDTO dto) {
        try {
            Enrollment masterSection = enrollmentRepository.findById(dto.getEnrollmentId())
                    .orElseThrow(() -> new RuntimeException("Section offering not found."));

            Student student = studentRepository.findByUser_UserId(dto.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student profile not found."));

            Optional<Enrollment> existingApplication = enrollmentRepository.findExistingApplication(
                    dto.getStudentId(), 
                    masterSection.getCourse().getId()
            );

            if (existingApplication.isPresent()) {
                String status = existingApplication.get().getStatus();
                if ("PENDING".equals(status)) {
                    return new ResultDTO(false, "You already have a pending request for this course.");
                } else if ("ACTIVE".equals(status)) {
                    return new ResultDTO(false, "You are already officially enrolled in this course.");
                }
            }

            Enrollment studentEnrollment = new Enrollment();
            studentEnrollment.setCourse(masterSection.getCourse());
            studentEnrollment.setTeacher(masterSection.getTeacher());
            studentEnrollment.setStudent(student); 
            studentEnrollment.setSection(masterSection.getSection());
            studentEnrollment.setRoom(masterSection.getRoom());
            studentEnrollment.setSchedule(masterSection.getSchedule());
            studentEnrollment.setSemester(masterSection.getSemester());
            studentEnrollment.setSchoolYear(masterSection.getSchoolYear());
            studentEnrollment.setDepartment(masterSection.getDepartment());
            
            studentEnrollment.setStatus("PENDING"); 
            studentEnrollment.setEnrollmentDate(LocalDate.now());

            enrollmentRepository.save(studentEnrollment);
            return new ResultDTO(true, "Application submitted successfully.");
        } catch (Exception e) {
            log.error("Request Error: ", e);
            return new ResultDTO(false, "Request Failed: " + e.getMessage());
        }
    }

    @Transactional
    public ResultDTO approveEnrollment(Long id) {
        try {
            Enrollment enrollment = enrollmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Record not found."));
            enrollment.setStatus("ACTIVE");
            enrollmentRepository.save(enrollment);
            return new ResultDTO(true, "Enrollment approved.");
        } catch (Exception e) {
            return new ResultDTO(false, "Error: " + e.getMessage());
        }
    }

    @Transactional
    public ResultDTO declineEnrollment(Long id) {
        try {
            Enrollment enrollment = enrollmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Record not found."));
            enrollmentRepository.delete(enrollment);
            return new ResultDTO(true, "Enrollment request declined.");
        } catch (Exception e) {
            return new ResultDTO(false, "Error: " + e.getMessage());
        }
    }

    // --- NEW RESTFUL CASCADE REGISTRY CLEANER FOR STUDENTS ---
    @Transactional
    public void purgeStudentEnrollments(Long studentId) {
        enrollmentRepository.deleteByStudentId(studentId);
    }
}