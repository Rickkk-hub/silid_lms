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
            // 1. Validate that Student and Teacher exist
            Student student = studentRepository.findById(dto.getStudentId())
                    .orElseThrow(() -> new Exception("Student not found"));
            Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                    .orElseThrow(() -> new Exception("Teacher not found"));

            // 2. Check if a grade record already exists for this specific combination
            Optional<Grade> existingGrade = gradeRepository.findByStudentIdAndTeacherIdAndSection(
                    dto.getStudentId(), dto.getTeacherId(), dto.getSection());

            // 3. Use the existing record if found, otherwise create a new one
            Grade grade = existingGrade.orElse(new Grade());

            // 4. Set/Update the values
            grade.setStudent(student);
            grade.setTeacher(teacher);
            grade.setSection(dto.getSection());
            grade.setPrelims(dto.getPrelims());
            grade.setMidterms(dto.getMidterms());
            grade.setFinals(dto.getFinals());

            // 5. Save (Hibernate handles the "Update" if ID is present, "Insert" if not)
            gradeRepository.save(grade);

            result.setSuccess(true);
            result.setMessage("Grade successfully " + (existingGrade.isPresent() ? "updated" : "recorded") + " for " + student.getFullname());
            
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        }
        
        return result; // Return statement must be at the very end
    }
}