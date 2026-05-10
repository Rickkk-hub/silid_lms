import { useState } from "react";
import AttendanceHeader from "../../Components/Dashboard/Student/AttendanceHeader";
import StudentSidebar from "../../Components/Dashboard/Student/StudentSidebar";
import StudentAttendance from "../../Components/Dashboard/Student/StudentAttendance";


export default function SAttendance(){
    const [sidebarOpen, setSidebarOpen] = useState (false);
    return(
        <div className="min-h-screen bg-gray-50 flex">
            <StudentSidebar open={sidebarOpen} setOpen={setSidebarOpen}/>

            <div className="flex-1 flex flex-col min-h-screen">
                <AttendanceHeader setSidebarOpen={setSidebarOpen}/>

                <main>
                <StudentAttendance/>
                </main>
            </div>
        </div>
    )
}