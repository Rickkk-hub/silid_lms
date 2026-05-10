import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ publicOnly = false }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // Case 1: User is logged in but tries to access a "Public Only" page (like Login)
  if (publicOnly && user) {
    return <Navigate to="/StudentDashboard" replace />;
  }

  // Case 2: User is NOT logged in but tries to access a "Protected" page
  if (!publicOnly && !user) {
    return <Navigate to="/Login" replace />;
  }

  // Otherwise, allow access
  return <Outlet />;
}