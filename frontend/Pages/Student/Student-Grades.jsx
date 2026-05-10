import { useState } from "react";
import GradesHeader from "../../Components/Dashboard/Student/GradesHeader";
import StudentSidebar from "../../Components/Dashboard/Student/StudentSidebar";
import StudentGrades from "../../Components/Dashboard/Student/StudentGrades";


export default function SGrade(){
    const[sidebarOpen, setSidebarOpen] = useState(false);
    return(
        <div className="min-h-screen bg-gray-50 flex">
            <StudentSidebar open={sidebarOpen} setOpen={setSidebarOpen}/>
         <div className="flex-1 flex flex-col min-h-screen">
            <GradesHeader setSidebarOpen={setSidebarOpen}/>
            <main>
            <StudentGrades/>
            </main>
         </div>
        </div>
    )
}