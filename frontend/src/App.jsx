import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./Services/ProtectedRoute";

// homepage import 
import Homepage from "../Pages/Home/Homepage";
// Loginpage import
import Login from "../Pages/Home/Login";
// student imports
import SDashboardLayout from "../Pages/Student/SDashboardLayout";
import SEnrollment from "../Pages/Student/Student-Enrollment";
import SGrades from "../Pages/Student/Student-Grades";
import SAttendance from "../Pages/Student/Student-Attendance";
import SLearningHub from "../Pages/Student/Student-LearningHub";
// package imports
import LenisProvider from "../Components/Layout/HomeLayout/LenisProvider";
// Teacher imports
import TDashboardLayout from "../Pages/Teacher/TDashboardLayout";
import TClasses from "../Pages/Teacher/Teacher-Classes";
import TAttendance from "../Pages/Teacher/Teacher-Attendance";
import TRecord from "../Pages/Teacher/Teacher-Record";
import TSubject from "../Pages/Teacher/Teacher-Subject";
import TGrade from "../Pages/Teacher/Teacher-Grades";
import ADashboardLayout from "../Pages/Admin/ADashboardLayout";
import AdminC from "../Pages/Admin/Admin-Course";
import AdminA from "../Pages/Admin/Admin-Assign";
import AdminSAccount from "../Pages/Admin/Admin-StudentAccount";
import AdminTAccount from "../Pages/Admin/Admin-TeacherAccount";
import AdminE from "../Pages/Admin/Admin-Enrollment";
import AdminM from "../Pages/Admin/Admin-Module";


export default function App() {
  return (
    <LenisProvider>
    <Router>
      <Routes>
        {/* --- PUBLIC ONLY (Blocked if logged in) --- */}
        <Route element={<ProtectedRoute publicOnly={true} />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/Login" element={<Login />} />
        </Route>

        {/* --- PROTECTED (Blocked if NOT logged in) --- */}
        <Route element={<ProtectedRoute />}>
          {/* Student Portal Group */}
          <Route path="/StudentDashboard" element={<SDashboardLayout />} />
          <Route path="/S-Enrollment" element={<SEnrollment />} />
          <Route path="/S-Grades" element={<SGrades />} />
          <Route path="/S-Attendance" element={<SAttendance />} />
          <Route path="/S-LearningHub" element={<SLearningHub />} />

          {/* Teacher Portal Group */}
          <Route path="/TeacherDashboard" element={<TDashboardLayout />} />
          <Route path="/T-Classes" element={<TClasses />} />
          <Route path="/T-Attendance" element={<TAttendance/>} />
          <Route path="/T-Record" element={<TRecord/>} />
          <Route path="/T-Subject" element={<TSubject/>} />
          <Route path="/T-Grades" element={<TGrade/>} />
        </Route>

        {/* Admin Dashboard */}
        <Route path="/AdminDashboard" element={<ADashboardLayout/>} />
        <Route path="/A-Course" element={<AdminC/>} />
        <Route path="/A-Assign" element={<AdminA/>} />
        <Route path="/A-StudentAccount" element={<AdminSAccount/>} />
        <Route path="/A-TeacherAccount" element={<AdminTAccount/>} />
        <Route path="/A-Enrollment" element={<AdminE/>} />
        <Route path="/A-Module" element={<AdminM/>} />

        <Route path="*" element={<Navigate to="/Login" replace />} />
      </Routes>
    </Router>
    </LenisProvider>
  );
}