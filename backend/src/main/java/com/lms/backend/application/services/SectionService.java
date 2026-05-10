package com.lms.backend.application.services;

import com.lms.backend.application.dto.SectionDTO;
import com.lms.backend.domain.entities.Section;
import com.lms.backend.domain.entities.User;
import com.lms.backend.domain.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SectionService {

    private final ISectionRepository sectionRepo;
    private final ICourseRepository courseRepo;
    private final IUserRepository userRepository;
    private final IAcademicYearRepository yearRepo;

    @Transactional
    public SectionDTO createSection(SectionDTO dto) {
        Section section = new Section();

        section.setName(dto.getName()); 
        section.setSchedule(dto.getSchedule());
        section.setRoom(dto.getRoom());
        section.setMaxSlots(dto.getMaxSlots() > 0 ? dto.getMaxSlots() : 40);

        section.setCourse(courseRepo.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + dto.getCourseId())));

        section.setTeacher(userRepository.findById(dto.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Instructor not found in 'users' table. ID: " + dto.getTeacherId())));

        section.setAcademicYear(yearRepo.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Academic Year not found. ID: " + dto.getAcademicYearId())));

        Section saved = sectionRepo.save(section);
        return mapToDTO(saved);
    }

    public List<SectionDTO> getSectionsByTeacher(UUID teacherId) {
        return sectionRepo.findByTeacher_Id(teacherId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<SectionDTO> getAllSections() {
        return sectionRepo.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * UPDATED Mapping: Aligned specifically with TeacherSubject.jsx
     */
    private SectionDTO mapToDTO(Section s) {
        SectionDTO dto = new SectionDTO();
        dto.setId(s.getId());
        dto.setName(s.getName()); // This is your Section Name (e.g., "Section A")

        // 1. Map Course Data (Crucial for the Card Header)
        if (s.getCourse() != null) {
            dto.setCourseId(s.getCourse().getId());
            dto.setCourseCode(s.getCourse().getCode());
            dto.setCourseName(s.getCourse().getTitle());
            // Passing the whole course object ensures 'course?.units' works in React
            dto.setCourse(s.getCourse()); 
        }

        // 2. Map Teacher Data (Crucial for "Unassigned Instructor" fix)
        if (s.getTeacher() != null) {
            dto.setTeacherId(s.getTeacher().getId());
            // This is the field your React code calls: {section.teacherName}
            dto.setTeacherName(s.getTeacher().getFullname()); 
        }

        // 3. Map Academic Year Data
        if (s.getAcademicYear() != null) {
            dto.setAcademicYearId(s.getAcademicYear().getId());
            String label = s.getAcademicYear().getYearLabel() != null ? s.getAcademicYear().getYearLabel() : "";
            String sem = s.getAcademicYear().getSemester() != null ? s.getAcademicYear().getSemester() : "";
            dto.setAcademicYearName(label + " - " + sem);
        }

        dto.setSchedule(s.getSchedule());
        dto.setRoom(s.getRoom());
        dto.setMaxSlots(s.getMaxSlots());
        
        return dto;
    }
}