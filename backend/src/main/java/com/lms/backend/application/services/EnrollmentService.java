package com.lms.backend.application.services;

import com.lms.backend.application.dto.EnrollmentDTO;
import com.lms.backend.domain.entities.*;
import com.lms.backend.domain.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    private final IEnrollmentRepository enrollmentRepo;
    private final IStudentRepository studentRepo;
    private final ISectionRepository sectionRepo;

    // FIX: Changed return type from List<Enrollment> to List<EnrollmentDTO>
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getBySection(UUID sectionId) {
        return enrollmentRepo.findBySection_Id(sectionId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EnrollmentDTO enroll(EnrollmentDTO dto) {
        if(enrollmentRepo.existsByStudentIdAndSectionId(dto.getStudentId(), dto.getSectionId())) {
            throw new RuntimeException("Student is already enrolled in this section");
        }

        Enrollment enrollment = new Enrollment();
        // Added .orElseThrow with message for easier debugging
        enrollment.setStudent(studentRepo.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found")));
        enrollment.setSection(sectionRepo.findById(dto.getSectionId())
                .orElseThrow(() -> new RuntimeException("Section not found")));
        
        enrollment.setStatus("ENROLLED");

        Enrollment saved = enrollmentRepo.save(enrollment);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getStudentEnrollments(UUID studentId) {
        return enrollmentRepo.findByStudentId(studentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private EnrollmentDTO mapToDTO(Enrollment e) {
        EnrollmentDTO dto = new EnrollmentDTO();
        dto.setId(e.getId());
        dto.setStudentId(e.getStudent().getId());
        dto.setSectionId(e.getSection().getId());
        dto.setStatus(e.getStatus());
        dto.setEnrolledAt(e.getEnrolledAt());
        
        // FIX: Using getFullname() to match your User entity field
        if (e.getStudent() != null && e.getStudent().getUser() != null) {
            dto.setStudentName(e.getStudent().getUser().getFullname());
        }
        
        if (e.getSection() != null && e.getSection().getCourse() != null) {
            dto.setCourseTitle(e.getSection().getCourse().getTitle());
        }
        
        return dto;
    }
}