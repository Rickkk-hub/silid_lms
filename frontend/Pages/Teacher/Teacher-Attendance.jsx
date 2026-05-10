import { useState } from "react";
import TeacherSidebar from "../../Components/Dashboard/Teacher/TeacherSidebar";
import AttendanceHeader from "../../Components/Dashboard/Teacher/AttendanceHeader";
import TeacherAttendance from "../../Components/Dashboard/Teacher/TeacherAttendance";

export default function TAttendance() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-gray-50"> 
      <TeacherSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <AttendanceHeader setSidebarOpen={setSidebarOpen} />
        <main className="w-full">
          <TeacherAttendance />
        </main>
      </div>
    </div>
  );
}