package com.lms.backend.application.services;

import com.lms.backend.application.dto.AttendanceDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.domain.entities.*;
import com.lms.backend.domain.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final IAttendanceRepository attendanceRepository;
    private final IStudentRepository studentRepository;
    private final ITeacherRepository teacherRepository;
    private final ICourseRepository courseRepository;

    @Transactional
    public ResultDTO markAttendance(AttendanceDTO dto) {
        try {
            Optional<Attendance> existingAttendance = attendanceRepository
                .findByStudent_IdAndCourse_IdAndDate(dto.getStudentId(), dto.getCourseId(), dto.getDate());

            if (existingAttendance.isPresent()) {
                System.out.printf("\n[SECURITY BLOCK] Rejected duplicate log attempt for Student ID: %d on Date: %s\n", 
                    dto.getStudentId(), dto.getDate());
                return new ResultDTO(false, "Already logged for today. Duplication restricted by server.");
            }

            Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student profile not found for ID: " + dto.getStudentId()));
            
            // DYNAMIC FIX: Gagamit ng primary key (.findById) para sa teachers table
            Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher profile configuration not found for Teacher ID: " + dto.getTeacherId()));
            
            Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course entity record not found for ID: " + dto.getCourseId()));

            Attendance attendance = new Attendance();
            attendance.setStudent(student);
            attendance.setTeacher(teacher);
            attendance.setCourse(course);
            attendance.setSection(dto.getSection()); 
            attendance.setDate(dto.getDate());
            attendance.setStatus(dto.getStatus());
            attendance.setRemarks(dto.getRemarks());

            attendanceRepository.save(attendance);

            System.out.println("\n>>> [ATTENDANCE LOG SAVED]");
            System.out.printf("    DATE    : %s\n", attendance.getDate());
            System.out.printf("    STUDENT : ID %-2d | %s\n", student.getId(), student.getUser() != null ? student.getUser().getFullname() : "N/A");
            System.out.printf("    TEACHER : ID %-2d | %s\n", teacher.getId(), teacher.getFullname());
            System.out.printf("    SUBJECT : ID %-2d | %s (%s)\n", course.getId(), course.getCode(), course.getTitle());
            System.out.printf("    STATUS  : %s\n", attendance.getStatus());
            System.out.println("-----------------------------------");
            
            return new ResultDTO(true, "Attendance logged successfully");
        } catch (Exception e) {
            System.err.printf("\n[ERROR] Attendance insertion failed: %s\n", e.getMessage());
            return new ResultDTO(false, "Error context failure: " + e.getMessage());
        }
    }
}