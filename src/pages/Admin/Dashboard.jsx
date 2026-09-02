import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import "../../components/css/Employee/Dashboard.css";
import { getAllEmployees } from "../../services/employeeService";
import { getDepartments } from "../../services/departmentService";
import { getLeaveRequests } from "../../services/leaveRequestService";
import { getAllAuditLogs } from "../../services/auditLogService";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      const results = await Promise.allSettled([
        getAllEmployees(),
        getDepartments(),
        getLeaveRequests({ status: "pending" }),
        getAllAuditLogs(),
      ]);

      const [employeeResult, departmentResult, leaveResult, auditResult] = results;
      if (employeeResult.status === "fulfilled") {
        setEmployees(
          (Array.isArray(employeeResult.value) ? employeeResult.value : [])
            .map((record) => record.employeeId)
            .filter(Boolean),
        );
      }
      if (departmentResult.status === "fulfilled") {
        setDepartments(Array.isArray(departmentResult.value) ? departmentResult.value : []);
      }
      if (leaveResult.status === "fulfilled") {
        setPendingReviews(Array.isArray(leaveResult.value?.data) ? leaveResult.value.data : []);
      }
      if (auditResult.status === "fulfilled") {
        setAuditLogs(Array.isArray(auditResult.value?.data) ? auditResult.value.data : auditResult.value);
      }
    }

    loadDashboard();
  }, []);

  return (
    <main className="employee-dashboard">
      <section className="employee-welcome">
        <div>
          <p className="welcome-small">Administration workspace</p>
          <h1>Good Morning, {user?.username} 👋</h1>
          <p className="employee-position">HR Administration <span>•</span> RAL HR</p>
        </div>
      </section>

      <section className="quick-actions-section">
        <div className="section-heading">
          <div>
            <h2>Quick Actions</h2>
            <p>Keep the organization running smoothly.</p>
          </div>
        </div>
        <div className="quick-actions">
          <button className="check-action check-in-btn" onClick={() => navigate("/employees")}>
            <span className="action-icon">♟</span>
            <div><strong>Manage Employees</strong><small>View your people directory</small></div>
          </button>
          <button className="check-action check-out-btn" onClick={() => navigate("/admin/leave-requests")}>
            <span className="action-icon">▣</span>
            <div><strong>Review Leave</strong><small>Approve pending requests</small></div>
          </button>
        </div>
      </section>

      <section className="dashboard-main-grid">
        <article className="dashboard-card attendance-card">
          <div className="dashboard-card-header"><div><span className="card-label">PEOPLE</span><h2>Employee Directory</h2></div><span className="attendance-icon">♟</span></div>
          <div className="attendance-status"><span className="status-dot"></span><span><strong>Team records</strong></span></div>
          <div className="attendance-times"><div className="time-box"><span>Employees</span><strong>{employees.length}</strong></div><div className="time-divider"></div><div className="time-box"><span>Departments</span><strong>{departments.length}</strong></div></div>
          <button className="card-link-btn" onClick={() => navigate("/employees")}>View Employees <span>→</span></button>
        </article>
        <article className="dashboard-card leave-card">
          <div className="dashboard-card-header"><div><span className="card-label">REQUESTS</span><h2>Leave Requests</h2></div><span className="leave-dashboard-icon">◫</span></div>
          <div className="leave-balance-list"><button type="button" className="leave-balance-item leave-balance-action" onClick={() => navigate("/admin/leave-requests")}><span className="leave-type"><span className="leave-dot annual-dot"></span><span><strong>Pending review</strong><span>Requests from employees</span></span></span><span className="leave-days"><strong>{pendingReviews.length}</strong><span>items</span></span></button><button type="button" className="leave-balance-item leave-balance-action" onClick={() => navigate("/leave-allocations")}><span className="leave-type"><span className="leave-dot sick-dot"></span><span><strong>Leave setup</strong><span>Types and allocations</span></span></span><span className="leave-days"><strong>→</strong><span>manage</span></span></button></div>
          <button className="card-link-btn" onClick={() => navigate("/admin/leave-requests")}>Review Requests <span>→</span></button>
        </article>
        <article className="dashboard-card documents-dashboard-card">
          <div className="dashboard-card-header"><div><span className="card-label">OPERATIONS</span><h2>Attendance & Logs</h2></div><span className="document-dashboard-icon">◷</span></div>
          <div className="document-dashboard-stats"><button type="button" className="document-stat document-action-stat verified-stat" onClick={() => navigate("/admin/attendance")}><span className="stat-icon">◷</span><span><strong>Attendance</strong><span>Review daily records</span></span></button><button type="button" className="document-stat document-action-stat expiring-stat" onClick={() => navigate("/admin/audit-logs")}><span className="stat-icon">▤</span><span><strong>Audit logs</strong><span>{auditLogs.length} recorded activities</span></span></button></div>
          <button className="card-link-btn" onClick={() => navigate("/admin/attendance")}>Open Attendance <span>→</span></button>
        </article>
      </section>
    </main>
  );
}

export default Dashboard