import CourseHeader from "../../Components/Dashboard/Admin/CourseHeader";
import AdminSidebar from "../../Components/Dashboard/Admin/AdminSidebar";
import AdminCourse from "../../Components/Dashboard/Admin/AdminCourse";
import { useState } from "react";

export default function AdminC(){
    const [sidebarOpen, setSidebarOpen] = useState (false);
    return(
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen}/>

            <div className="flex-1 flex flex-col min-h-screen">
                <CourseHeader setSidebarOpen={setSidebarOpen}/>

                <main>
                <AdminCourse/>
                </main>
            </div>
        </div>
    )
}