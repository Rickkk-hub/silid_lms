import EnrollmentHeader from "../../Components/Dashboard/Admin/EnrollmentHeader";
import AdminSidebar from "../../Components/Dashboard/Admin/AdminSidebar";
import AdminEnrollment from "../../Components/Dashboard/Admin/AdminEnrollment";
import { useState } from "react";

export default function AdminE(){
    const [sidebarOpen, setSidebarOpen] = useState (false);
    return(
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen}/>

            <div className="flex-1 flex flex-col min-h-screen">
                <EnrollmentHeader setSidebarOpen={setSidebarOpen}/>

                <main>
                <AdminEnrollment/>
                </main>
            </div>
        </div>
    )
}