import React, { useState } from "react";
import CourseHeader from "../../Components/Dashboard/Admin/CourseHeader";
import AdminSidebar from "../../Components/Dashboard/Admin/AdminSidebar";
import AdminCourse from "../../Components/Dashboard/Admin/AdminCourse";

export default function AdminC(){
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return(
    <div className="min-h-screen bg-[#F1F5F0] flex overflow-hidden w-full fixed inset-0">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen}/>

      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative">
        <CourseHeader setSidebarOpen={setSidebarOpen}/>

        <main className="w-full h-[calc(100vh-80px)] overflow-y-auto px-4 md:px-10 pb-12 block clear-both content-start">
          <AdminCourse/>
        </main>
      </div>
    </div>
  )
}