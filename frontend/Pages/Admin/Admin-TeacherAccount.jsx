import TeacherHeader from "../../Components/Dashboard/Admin/TeacherHeader";
import AdminSidebar from "../../Components/Dashboard/Admin/AdminSidebar";
import AdminTeacherAccount from "../../Components/Dashboard/Admin/AdminTeacherAccount";
import { useState } from "react";


export default function AdminTAccount(){
    const[sidebarOpen, setSidebarOpen] = useState(false);
    return(
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen}/>
            
            <div className="flex-1 flex flex-col">
                <TeacherHeader setSidebarOpen={setSidebarOpen}/>

                <main>
                    <AdminTeacherAccount/>
                </main>
            </div>
        </div>
    )
}