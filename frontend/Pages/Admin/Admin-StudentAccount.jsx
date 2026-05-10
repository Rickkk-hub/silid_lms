import { useState } from "react";
import AdminSidebar from "../../Components/Dashboard/Admin/AdminSidebar";
import AdminStudentAccount from "../../Components/Dashboard/Admin/AdminStudentAccount";
import StudentHeader from "../../Components/Dashboard/Admin/StudentHeader";



export default function AdminSAccount(){
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return(
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen}/>

            <div className="flex-1 flex flex-col">
                <StudentHeader setSidebarOpen={setSidebarOpen}/>

                <main>
                    <AdminStudentAccount/>
                </main>
            </div>
        </div>
    )
}