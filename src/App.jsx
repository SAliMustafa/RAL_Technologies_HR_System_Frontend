import { useState } from "react";
import { Route, Routes } from "react-router";
import Navbar from "./components/Navbar";
import SignupPage from "./pages/SignupPage";
import Homepage from "./pages/Homepage";
import SignInPage from "./pages/SigninPage";

//// employee page
import EmployeeDashboard from "./pages/Employee/Dashboard";
import MyProfile from "./pages/Employee/MyProfile";

// manager page
import ManagerDashboard from "./pages/Manager/Dashboard";


// Hr-Admin page
import AdminDashboard from "./pages/Admin/Dashboard";

import { useEffect } from "react";
import { getCurrentUser, logout } from "./services/authService";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
function App() {
  return (
    <div>
      {/* <Navbar/> */}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/sign-up" element={<SignupPage />} />
        <Route path="/sign-in" element={<SignInPage />} />

        {/* //// employee page */}
        <Route path="dashboard-employee" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="MyProfile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />

        {/* // Hr-Admin page */}

        <Route path="/dashboard-Admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        {/* // manager page */}

        <Route path="/dashboard-manager" element={<ProtectedRoute><ManagerDashboard /></ProtectedRoute>} />

      </Routes>
    </div>
  );
}

export default App;
