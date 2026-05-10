import { useState } from "react";
import StudentHeader from "../../Components/Dashboard/Student/StudentHeader";
import StudentOverview from "../../Components/Dashboard/Student/StudentOverview";
import StudentSidebar from "../../Components/Dashboard/Student/StudentSidebar";

export default function SDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <StudentSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">

        <StudentHeader setSidebarOpen={setSidebarOpen} />

        <main className="">
          <StudentOverview />
        </main>

      </div>
    </div>
  );
}