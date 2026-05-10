import TeacherSidebar from "../../Components/Dashboard/Teacher/TeacherSidebar";
import SubjectHeader from "../../Components/Dashboard/Teacher/SubjectHeader";
import TeacherSubject from "../../Components/Dashboard/Teacher/TeacherSubject";
import { useState } from "react";


export default function TSubject(){
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return(
        <div className="min-h-screen bg-gray-50 flex">
            <TeacherSidebar open={sidebarOpen} setOpen={setSidebarOpen}/>

            <div className="flex-1 flex flex-col min-h-screen">
                <SubjectHeader setSidebarOpen={setSidebarOpen}/>

                <main>
                    <TeacherSubject/>
                </main>
            </div>
        </div>
    )
}