import { useState } from "react";
import TeacherSidebar from "../../Components/Dashboard/Teacher/TeacherSidebar";
import ClassesHeader from "../../Components/Dashboard/Teacher/ClassesHeader";
import TeacherClasses from "../../Components/Dashboard/Teacher/TeacherClasses";

export default function TClasses() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <TeacherSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">

        <ClassesHeader setSidebarOpen={setSidebarOpen} />

        <main>
          <TeacherClasses/>
        </main>

      </div>
    </div>
  );
}