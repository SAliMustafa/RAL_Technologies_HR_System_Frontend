import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import "../../components/css/Employee/Dashboard.css";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
          <div className="attendance-times"><div className="time-box"><span>Employees</span><strong>—</strong></div><div className="time-divider"></div><div className="time-box"><span>Departments</span><strong>—</strong></div></div>
          <button className="card-link-btn" onClick={() => navigate("/employees")}>View Employees <span>→</span></button>
        </article>
        <article className="dashboard-card leave-card">
          <div className="dashboard-card-header"><div><span className="card-label">REQUESTS</span><h2>Leave Requests</h2></div><span className="leave-dashboard-icon">◫</span></div>
          <div className="leave-balance-list"><div className="leave-balance-item"><div className="leave-type"><span className="leave-dot annual-dot"></span><div><strong>Pending review</strong><span>Requests from employees</span></div></div><div className="leave-days"><strong>—</strong><span>items</span></div></div><div className="leave-balance-item"><div className="leave-type"><span className="leave-dot sick-dot"></span><div><strong>Leave setup</strong><span>Types and allocations</span></div></div><div className="leave-days"><strong>→</strong><span>manage</span></div></div></div>
          <button className="card-link-btn" onClick={() => navigate("/admin/leave-requests")}>Review Requests <span>→</span></button>
        </article>
        <article className="dashboard-card documents-dashboard-card">
          <div className="dashboard-card-header"><div><span className="card-label">OPERATIONS</span><h2>Attendance & Logs</h2></div><span className="document-dashboard-icon">◷</span></div>
          <div className="document-dashboard-stats"><div className="document-stat verified-stat"><div className="stat-icon">◷</div><div><strong>Attendance</strong><span>Review daily records</span></div></div><div className="document-stat expiring-stat"><div className="stat-icon">▤</div><div><strong>Audit logs</strong><span>Track system activity</span></div></div></div>
          <button className="card-link-btn" onClick={() => navigate("/admin/attendance")}>Open Attendance <span>→</span></button>
        </article>
      </section>
    </main>
  );
}

export default Dashboard