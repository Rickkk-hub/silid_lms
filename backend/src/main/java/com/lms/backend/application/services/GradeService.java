package com.lms.backend.application.services;

import com.lms.backend.application.dto.GradeDTO;
import com.lms.backend.application.dto.GradeResponseDTO;
import com.lms.backend.domain.entities.Enrollment;
import com.lms.backend.domain.entities.Grade;
import com.lms.backend.domain.entities.User;
import com.lms.backend.domain.repositories.IEnrollmentRepository;
import com.lms.backend.domain.repositories.IGradeRepository;
import com.lms.backend.domain.repositories.ITaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GradeService {
    private final IGradeRepository gradeRepo;
    private final IEnrollmentRepository enrollmentRepo;
    private final ITaskRepository taskRepo;

    @Transactional(readOnly = true)
    public List<GradeResponseDTO> getSectionClassRecord(UUID sectionId) {
        List<Enrollment> enrollments = enrollmentRepo.findBySection_Id(sectionId);
        List<Grade> allGrades = gradeRepo.findBySectionWithStudentAndTask(sectionId);

        return enrollments.stream().map(enrollment -> {
            List<Grade> studentGrades = allGrades.stream()
                    .filter(g -> g.getEnrollment().getId().equals(enrollment.getId()))
                    .toList();

            double prelim = calculateComponent(studentGrades, "PRELIM");
            double midterm = calculateComponent(studentGrades, "MIDTERM");
            double finals = calculateComponent(studentGrades, "FINAL");

            // Basic Average Calculation
            double average = (prelim + midterm + finals) / 3;

            return GradeResponseDTO.builder()
                    .studentName(enrollment.getStudent().getUser().getFullname())
                    .prelim(prelim)
                    .midterm(midterm)
                    .finals(finals)
                    .standing(average)
                    .status(studentGrades.isEmpty() ? "Ongoing" : (average >= 75 ? "Passed" : "Failed"))
                    .build();
        }).collect(Collectors.toList());
    }

    private double calculateComponent(List<Grade> grades, String period) {
        return grades.stream()
                .filter(g -> g.getTask() != null && g.getTask().getGradingPeriod() != null)
                // FIX: Match against the gradingPeriod field, not the type field
                .filter(g -> g.getTask().getGradingPeriod().equalsIgnoreCase(period))
                .mapToDouble(Grade::getScore)
                .average()
                .orElse(0.0);
    }

    @Transactional(readOnly = true)
    public List<GradeResponseDTO> getStudentAcademicSummary(UUID userId) {
        List<Grade> studentGrades = gradeRepo.findByStudentUserId(userId);

        return studentGrades.stream()
                .collect(Collectors.groupingBy(g -> g.getEnrollment().getSection()))
                .entrySet().stream()
                .map(entry -> {
                    var section = entry.getKey();
                    var grades = entry.getValue();

                    double prelim = calculateComponent(grades, "PRELIM");
                    double midterm = calculateComponent(grades, "MIDTERM");
                    double finals = calculateComponent(grades, "FINAL");
                    double average = (prelim + midterm + finals) / 3;

                    return GradeResponseDTO.builder()
                            .courseCode(section.getCourse().getCode())
                            .courseName(section.getCourse().getTitle())
                            .prelim(prelim)
                            .midterm(midterm)
                            .finals(finals)
                            .standing(average)
                            .status(average >= 75 ? "Passed" : "Failed")
                            .build();
                }).collect(Collectors.toList());
    }

    @Transactional
    public void saveBatchGrades(List<GradeDTO> dtos) {
        for (GradeDTO dto : dtos) {
            saveGrade(dto);
        }
    }

    @Transactional
    public GradeDTO saveGrade(GradeDTO dto) {
        // Important: check if grade exists for this specific student and task
        Grade grade = gradeRepo.findByEnrollmentIdAndTaskId(dto.getEnrollmentId(), dto.getTaskId())
                .orElse(new Grade());

        if (grade.getId() == null) {
            grade.setEnrollment(enrollmentRepo.findById(dto.getEnrollmentId())
                    .orElseThrow(() -> new RuntimeException("Enrollment not found")));
            grade.setTask(taskRepo.findById(dto.getTaskId())
                    .orElseThrow(() -> new RuntimeException("Task not found")));
        }

        grade.setScore(dto.getScore());
        gradeRepo.save(grade);
        return dto;
    }
}