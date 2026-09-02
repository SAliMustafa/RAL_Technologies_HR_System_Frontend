import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import "../components/css/Navbar.css";

function Navbar() {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Hide navbar if user is not logged in
  if (!user) {
    return <></>;
  }

  return (
    <aside className="sidebar">
      {/* LOGO */}
      <div className="sidebar-header">
        <div className="sidebar-logo">R</div>

        <div>
          <h2>RAL HR</h2>
          <span>HR Management</span>
        </div>
      </div>

      {/* USER */}
      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.username?.charAt(0)?.toUpperCase()}
        </div>

        <div>
          <strong>{user?.username}</strong>
          <span>{user?.role?.replaceAll("_", " ")}</span>
        </div>
      </div>

      {/* MENU */}
      <div className="sidebar-menu">
        <p className="sidebar-section-title">MENU</p>

        {/* =========================
            EMPLOYEE
        ========================== */}

        {user?.role === "employee" && (
          <>
            <Link
              to="/dashboard-employee"
              className={isActive("/dashboard-employee") ? "active" : ""}
            >
              <span className="menu-icon">▦</span>
              Dashboard
            </Link>

            <Link
              to="/MyProfile"
              className={isActive("/MyProfile") ? "active" : ""}
            >
              <span className="menu-icon">♙</span>
              My Profile
            </Link>

            <Link
              to="/mydocuments"
              className={isActive("/mydocuments") ? "active" : ""}
            >
              <span className="menu-icon">▤</span>
              My Documents
            </Link>

            <Link
              to="/my-attendance"
              className={isActive("/my-attendance") ? "active" : ""}
            >
              <span className="menu-icon">◷</span>
              My Attendance
            </Link>

            <Link
              to="/my-checkins"
              className={isActive("/my-checkins") ? "active" : ""}
            >
              <span className="menu-icon">◷</span>
              My Checkins
            </Link>

            <Link
              to="/leave"
              className={isActive("/leave") ? "active" : ""}
            >
              <span className="menu-icon">▣</span>
              My Leave
            </Link>

            <Link
              to="/leave-allocations"
              className={isActive("/leave-allocations") ? "active" : ""}
            >
              <span className="menu-icon">▤</span>
              My Leave Balances
            </Link>

            <Link
              to="/employee/leave-requests"
              className={
                isActive("/employee/leave-requests") ? "active" : ""
              }
            >
              <span className="menu-icon">▣</span>
              My Leave Requests
            </Link>
          </>
        )}

        {/* =========================
            MANAGER
        ========================== */}

        {user?.role === "manager" && (
          <>
            <p className="sidebar-section-title">MY ACCOUNT</p>

            <Link
              to="/dashboard-manager"
              className={isActive("/dashboard-manager") ? "active" : ""}
            >
              <span className="menu-icon">▦</span>
              Dashboard
            </Link>

            <Link
              to="/MyProfile"
              className={isActive("/MyProfile") ? "active" : ""}
            >
              <span className="menu-icon">♙</span>
              My Profile
            </Link>

            <Link
              to="/my-attendance"
              className={isActive("/my-attendance") ? "active" : ""}
            >
              <span className="menu-icon">◷</span>
              My Attendance
            </Link>

            <Link
              to="/my-checkins"
              className={isActive("/my-checkins") ? "active" : ""}
            >
              <span className="menu-icon">◷</span>
              My Checkins
            </Link>

            <Link
              to="/leave-allocations"
              className={isActive("/leave-allocations") ? "active" : ""}
            >
              <span className="menu-icon">▤</span>
              My Leave Balances
            </Link>

            <Link
              to="/employee/leave-requests"
              className={
                isActive("/employee/leave-requests") ? "active" : ""
              }
            >
              <span className="menu-icon">▣</span>
              My Leave Requests
            </Link>

            <p className="sidebar-section-title">MY TEAM</p>

            <Link
              to="/manager/leave-requests"
              className={
                isActive("/manager/leave-requests") ? "active" : ""
              }
            >
              <span className="menu-icon">▣</span>
              Leave Requests
            </Link>

            <Link
              to="/manager/employees"
              className={isActive("/manager/employees") ? "active" : ""}
            >
              <span className="menu-icon">♟</span>
              My Employees
            </Link>

            <Link
              to="/manager/attendance"
              className={isActive("/manager/attendance") ? "active" : ""}
            >
              <span className="menu-icon">◷</span>
              Team Attendance
            </Link>
          </>
        )}

        {/* =========================
            HR ADMIN
        ========================== */}

        {user?.role === "hr_admin" && (
          <>
            <p className="sidebar-section-title">ADMINISTRATION</p>

            <Link
              to="/dashboard-Admin"
              className={isActive("/dashboard-Admin") ? "active" : ""}
            >
              <span className="menu-icon">▦</span>
              Dashboard
            </Link>

            <Link
              to="/employees"
              className={isActive("/employees") ? "active" : ""}
            >
              <span className="menu-icon">♟</span>
              Employees
            </Link>

            <Link
              to="/admin/departments"
              className={isActive("/admin/departments") ? "active" : ""}
            >
              <span className="menu-icon">▦</span>
              Departments
            </Link>

            <Link
              to="/admin/documents"
              className={isActive("/admin/documents") ? "active" : ""}
            >
              <span className="menu-icon">▦</span>
              Documents List
            </Link>

            <Link
              to="/admin/attendance"
              className={isActive("/admin/attendance") ? "active" : ""}
            >
              <span className="menu-icon">◷</span>
              Attendance
            </Link>

            <Link
              to="/admin/checkins"
              className={isActive("/admin/checkins") ? "active" : ""}
            >
              <span className="menu-icon">✓</span>
              Check-ins
            </Link>

            <Link
              to="/admin/leave-corrections"
              className={
                isActive("/admin/leave-corrections") ? "active" : ""
              }
            >
              <span className="menu-icon">✎</span>
              Leave Correction Requests
            </Link>

            <Link
              to="/admin/holidays"
              className={isActive("/admin/holidays") ? "active" : ""}
            >
              <span className="menu-icon">▣</span>
              Holidays
            </Link>

            <Link
              to="/admin/leave-types"
              className={isActive("/admin/leave-types") ? "active" : ""}
            >
              <span className="menu-icon">▤</span>
              Leave Types
            </Link>

            <Link
              to="/leave-allocations"
              className={isActive("/leave-allocations") ? "active" : ""}
            >
              <span className="menu-icon">▦</span>
              Leave Allocations
            </Link>

            <Link
              to="/admin/audit-logs"
              className={isActive("/admin/audit-logs") ? "active" : ""}
            >
              <span className="menu-icon">▦</span>
              Audit Logs
            </Link>

            <Link
              to="/admin/leave-requests"
              className={isActive("/admin/leave-requests") ? "active" : ""}
            >
              <span className="menu-icon">▣</span>
              Leave Requests
            </Link>
          </>
        )}
      </div>

      {/* LOGOUT */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <span>↪</span>
          {t("nav.signOut")}
        </button>
      </div>
    </aside>
  );
}

export default Navbar;
