package com.lms.backend.application.dto; // Adjust package as needed

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminStatsDTO {
    private long totalCourses;
    private long activeFaculty;
    private long totalStudents;
    private long activeRoles;
    private long unassignedCount;
    private long departmentCount;
}