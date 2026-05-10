package com.lms.backend.application.services;

import com.lms.backend.application.dto.*;
import com.lms.backend.domain.entities.*;
import com.lms.backend.domain.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final IAttendanceRepository attendanceRepo;
    private final IStudentRepository studentRepo; 
    private final ISectionRepository sectionRepo;

    @Transactional
    public AttendanceResponseDTO submitAttendance(AttendanceRequestDTO dto) {
        if (attendanceRepo.existsByStudentIdAndSectionIdAndAttendanceDate(
                dto.getStudentId(),
                dto.getSectionId(),
                LocalDate.now()
        )) {
            throw new RuntimeException("Already recorded today");
        }

        Student student = studentRepo.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student record not found"));

        Section section = sectionRepo.findById(dto.getSectionId())
                .orElseThrow(() -> new RuntimeException("Section not found"));

        Attendance attendance = Attendance.builder()
                .student(student)
                .section(section)
                .status(dto.getStatus())
                .remarks(dto.getRemarks())
                .attendanceDate(LocalDate.now())
                .build();

        return map(attendanceRepo.save(attendance));
    }

    // --- FIX: Added method called by Controller ---
    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> getTeacherAttendanceHistory(UUID teacherId) {
        return attendanceRepo.findBySection_Teacher_IdOrderByAttendanceDateDesc(teacherId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    // --- FIX: Added method called by Controller ---
    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> getRecentTeacherAttendance(UUID teacherId) {
        return attendanceRepo.findTop10BySection_Teacher_IdOrderByAttendanceDateDesc(teacherId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> getStudentAttendanceHistory(UUID studentId) {
        return attendanceRepo.findByStudentIdOrderByAttendanceDateDesc(studentId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    private AttendanceResponseDTO map(Attendance a) {
        return AttendanceResponseDTO.builder()
                .id(a.getId())
                .sectionId(a.getSection() != null ? a.getSection().getId() : null)
                .studentName(a.getStudent() != null && a.getStudent().getUser() != null 
                             ? a.getStudent().getUser().getFullname() : "Unknown Student")
                .courseCode(
                        (a.getSection() != null && a.getSection().getCourse() != null)
                                ? a.getSection().getCourse().getCode()
                                : "N/A"
                )
                .sectionName(
                        a.getSection() != null ? a.getSection().getSchedule() : "N/A"
                )
                .date(a.getAttendanceDate())
                .status(a.getStatus())
                .loggedBy("System")
                .build();
    }
}