package com.lms.backend.application.services;

import com.lms.backend.application.dto.grade.GradeDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.domain.entities.Grade;
import com.lms.backend.domain.entities.Student;
import com.lms.backend.domain.entities.Teacher;
import com.lms.backend.domain.repositories.IGradeRepository;
import com.lms.backend.domain.repositories.IStudentRepository;
import com.lms.backend.domain.repositories.ITeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GradeService {

    private final IGradeRepository gradeRepository;
    private final IStudentRepository studentRepository;
    private final ITeacherRepository teacherRepository;

    public ResultDTO saveOrUpdateGrade(GradeDTO dto) {
        ResultDTO result = new ResultDTO();
        try {
            // 1. Hanapin ang Student gamit ang kanilang Student ID (Primary Key)
            Student student = studentRepository.findById(dto.getStudentId())
                    .orElseThrow(() -> new Exception("Student ID " + dto.getStudentId() + " not found"));

            // 2. Hanapin ang Teacher gamit ang USER ID (Ronald ID = 2) 
            // Ito ang alignment para sa React frontend mo
            Teacher teacher = teacherRepository.findByUser_UserId(dto.getTeacherId())
                    .orElseThrow(() -> new Exception("Teacher not found for User ID: " + dto.getTeacherId()));

            // 3. I-check kung may record na gamit ang bagong queries natin
            Optional<Grade> existingGrade = gradeRepository.findByStudentIdAndTeacher_IdAndSection(
                    student.getId(), teacher.getId(), dto.getSection());
            
            Grade grade = existingGrade.orElse(new Grade());

            // 4. Set the Data
            grade.setStudent(student);
            grade.setTeacher(teacher);
            grade.setSection(dto.getSection());
            grade.setPrelims(dto.getPrelims());
            grade.setMidterms(dto.getMidterms());
            grade.setFinals(dto.getFinals());

            // 5. Automatic Average Calculation (Para hindi 0 sa DB)
            double average = (dto.getPrelims() + dto.getMidterms() + dto.getFinals()) / 3.0;
            grade.setAverage(average);
            
            // Optional: Remarks
            grade.setRemarks(average >= 75 ? "PASSED" : "FAILED");

            gradeRepository.save(grade);

            result.setSuccess(true);
            result.setMessage("Grade successfully " + (existingGrade.isPresent() ? "updated" : "recorded") + " for " + student.getFullname());
            
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("Save Error: " + e.getMessage());
            System.err.println(">>> GRADE SAVE ERROR: " + e.getMessage());
        }
        
        return result; 
    }
}