import TeacherSidebar from "../../Components/Dashboard/Teacher/TeacherSidebar";
import GradesHeader from "../../Components/Dashboard/Teacher/GradesHeader";
import TeacherGrades from "../../Components/Dashboard/Teacher/TeacherGrades";
import { useState } from "react";

export default function TGrade(){
    const[sidebarOpen, setSidebarOpen] = useState(false);
    return(
        <div className="flex min-h-screen bg-gray-50">
           <TeacherSidebar open={sidebarOpen} setOpen={setSidebarOpen}/>
           <div className="flex-1 flex flex-col min-w-0">
            <GradesHeader setSidebarOpen={setSidebarOpen}/>
            <main className="w-full">
                <TeacherGrades/>
            </main>
            </div> 
        </div>
    )
}