import { useState } from "react";
import { Route, Routes } from "react-router";
import Navbar from "./components/Navbar";
import SignupPage from "./pages/SignupPage";
import Homepage from "./pages/Homepage";
import SignInPage from "./pages/SigninPage";

//// employee page
import EmployeeDashboard from "./pages/Employee/Dashboard";
import MyProfile from "./pages/Employee/MyProfile";
import MyDocuments from "./pages/Employee/MyDocuments";
import UploadDocument from "./pages/Employee/UploadDocument";
import DocumentDetails from "./pages/Employee/DocumentDetails";
import MyCheckins from "./pages/Employee/MyCheckins";
import MyAttendance from "./pages/Employee/MyAttendance";
import EmployeeLeaveRequests from "./pages/EmployeeLeaveRequests/EmployeeLeaveRequests";
// manager page
import ManagerDashboard from "./pages/Manager/Dashboard";


// Hr-Admin page
import AdminDashboard from "./pages/Admin/Dashboard";
import LeaveTypes from "./pages/Admin/LeaveTypes";
import LeaveAllocations from "./pages/LeaveAllocations/LeaveAllocations";
import AttendanceManagement from "./pages/Admin/AttendanceManagement";
import Departments from "./pages/Admin/Department";
import Holidays from "./pages/Admin/Holidays";



// MyAttendance page
// import MyAttendance from "./pages/Attendance/MyAttendance";

import { useEffect } from "react";
import { getCurrentUser, logout } from "./services/authService";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
function App() {
  return (
    <div>
      <Navbar/>
       <div className="app-content">


      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/sign-up" element={<SignupPage />} />
        <Route path="/sign-in" element={<SignInPage />} />

        {/* //// employee page */}
        <Route path="dashboard-employee" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="MyProfile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
        <Route path="mydocuments" element={<ProtectedRoute><MyDocuments /></ProtectedRoute>} />
        <Route path="/documents/upload" element={<ProtectedRoute><UploadDocument /></ProtectedRoute>} />
        <Route path="/documents/:documentId" element={<ProtectedRoute><DocumentDetails /></ProtectedRoute>} />
        <Route path="/my-checkins" element={<ProtectedRoute><MyCheckins /></ProtectedRoute>} />
        <Route path="/my-attendance" element={<ProtectedRoute><MyAttendance /></ProtectedRoute>} />
        <Route path="/employee/leave-requests"element={<ProtectedRoute allowedRoles={["employee"]}><EmployeeLeaveRequests /></ProtectedRoute>}/>

        {/* // Hr-Admin page */}

        <Route path="/dashboard-Admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route
          path="/admin/leave-types"
          element={
            <ProtectedRoute allowedRoles={["hr_admin"]}>
              <LeaveTypes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-allocations"
          element={
            <ProtectedRoute allowedRoles={["hr_admin", "manager", "employee"]}>
              <LeaveAllocations />
            </ProtectedRoute>
          }
        />

        <Route
  path="/admin/attendance"
  element={
    <ProtectedRoute allowedRoles={["hr_admin"]}>
      <AttendanceManagement />
    </ProtectedRoute>
  }
/>

<Route path="/admin/departments" element={
  <ProtectedRoute allowedRoles={["hr_admin"]}><Departments /></ProtectedRoute>
} />


<Route path="/admin/holidays" element={
  <ProtectedRoute allowedRoles={["hr_admin"]}><Holidays /></ProtectedRoute>
} />


        {/* // manager page */}

        <Route path="/dashboard-manager" element={<ProtectedRoute><ManagerDashboard /></ProtectedRoute>} />

        {/* // MyAttendance page */}

        {/* <Route path="/attendance" element={<ProtectedRoute><MyAttendance /></ProtectedRoute>} /> */}

      </Routes>
       </div>
    </div>
  );
}

export default App;
