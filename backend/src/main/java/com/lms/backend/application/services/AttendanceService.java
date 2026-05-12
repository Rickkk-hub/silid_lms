package com.lms.backend.application.services;

import com.lms.backend.application.dto.AttendanceDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.domain.entities.*;
import com.lms.backend.domain.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
            // Upsert Logic: Find existing or create new
            Attendance attendance = attendanceRepository
                .findByStudentIdAndCourseIdAndDate(dto.getStudentId(), dto.getCourseId(), dto.getDate())
                .orElse(new Attendance());

            // Map Foreign Keys
            attendance.setStudent(studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found")));
            attendance.setTeacher(teacherRepository.findById(dto.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found")));
            attendance.setCourse(courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found")));

            // Map Data
            attendance.setSection(dto.getSection());
            attendance.setDate(dto.getDate());
            attendance.setStatus(dto.getStatus());
            attendance.setRemarks(dto.getRemarks());

            attendanceRepository.save(attendance);
            return new ResultDTO(true, "Attendance logged for student: " + dto.getStudentId());
        } catch (Exception e) {
            return new ResultDTO(false, "System Failure: " + e.getMessage());
        }
    }
}