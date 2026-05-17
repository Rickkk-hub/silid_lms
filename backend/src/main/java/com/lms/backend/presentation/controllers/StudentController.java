package com.lms.backend.presentation.controllers;

import com.lms.backend.application.dto.EnrollmentDTO;
import com.lms.backend.application.dto.student.StudentRegisterDTO;
import com.lms.backend.application.dto.users.ResultDTO;
import com.lms.backend.application.services.EnrollmentService;
import com.lms.backend.application.services.StudentService;
import com.lms.backend.domain.entities.Enrollment;
import com.lms.backend.domain.entities.Student;
import com.lms.backend.domain.repositories.ICourseRepository;
import com.lms.backend.domain.repositories.IEnrollmentRepository;
import com.lms.backend.domain.repositories.IStudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor 
public class StudentController {

    private final EnrollmentService enrollmentService;
    private final StudentService studentService;
    private final IStudentRepository studentRepository;
    private final ICourseRepository courseRepository;
    private final IEnrollmentRepository enrollmentRepository;

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll());
    }

    @PostMapping("/register")
    public ResponseEntity<ResultDTO> register(@RequestBody StudentRegisterDTO dto) {
        ResultDTO result = studentService.registerStudent(dto);
        return result.isSuccess() ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    // --- NEW: UPDATE ROUTE ---
    @PutMapping("/update/{id}")
    public ResponseEntity<ResultDTO> update(@PathVariable Long id, @RequestBody StudentRegisterDTO dto) {
        ResultDTO result = studentService.updateStudent(id, dto);
        return result.isSuccess() ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    // --- NEW: DELETE ROUTE ---
    @DeleteMapping("/{id}")
    public ResponseEntity<ResultDTO> delete(@PathVariable Long id) {
        ResultDTO result = studentService.deleteStudent(id);
        return result.isSuccess() ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<Student> getProfile(@PathVariable long userId) {
        return studentRepository.findByUser_UserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/offers/{userId}")
    public ResponseEntity<List<Enrollment>> getAvailableOffers(@PathVariable Long userId) {
        return ResponseEntity.ok(enrollmentRepository.findAvailableOffersForStudent(userId));
    }

    @PostMapping("/enroll")
    public ResponseEntity<ResultDTO> enroll(@RequestBody EnrollmentDTO dto) {
        return ResponseEntity.ok(enrollmentService.requestEnrollment(dto));
    }

    @GetMapping("/my-courses/{userId}")
    public ResponseEntity<List<Enrollment>> getMyCourses(@PathVariable Long userId) {
        return ResponseEntity.ok(enrollmentRepository.findByStudent_User_UserIdAndStatus(userId, "ACTIVE"));
    }
}