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
          <p className="welcome-small">Team workspace</p>
          <h1>Good Morning, {user?.username} 👋</h1>
          <p className="employee-position">Manager <span>•</span> Your team</p>
        </div>
      </section>

      <section className="quick-actions-section">
        <div className="section-heading"><div><h2>Quick Actions</h2><p>Stay close to your team’s day-to-day work.</p></div></div>
        <div className="quick-actions">
          <button className="check-action check-in-btn" onClick={() => navigate("/manager/employees")}><span className="action-icon">♟</span><div><strong>View My Employees</strong><small>Open your team directory</small></div></button>
          <button className="check-action check-out-btn" onClick={() => navigate("/manager/leave-requests")}><span className="action-icon">▣</span><div><strong>Review Leave</strong><small>Respond to team requests</small></div></button>
        </div>
      </section>

      <section className="dashboard-main-grid">
        <article className="dashboard-card attendance-card"><div className="dashboard-card-header"><div><span className="card-label">MY TEAM</span><h2>Team Directory</h2></div><span className="attendance-icon">♟</span></div><div className="attendance-status"><span className="status-dot"></span><span><strong>Team overview</strong></span></div><div className="attendance-times"><div className="time-box"><span>Members</span><strong>—</strong></div><div className="time-divider"></div><div className="time-box"><span>Active</span><strong>—</strong></div></div><button className="card-link-btn" onClick={() => navigate("/manager/employees")}>View Employees <span>→</span></button></article>
        <article className="dashboard-card leave-card"><div className="dashboard-card-header"><div><span className="card-label">LEAVE</span><h2>Team Requests</h2></div><span className="leave-dashboard-icon">◫</span></div><div className="leave-balance-list"><div className="leave-balance-item"><div className="leave-type"><span className="leave-dot annual-dot"></span><div><strong>Pending review</strong><span>Requests from your team</span></div></div><div className="leave-days"><strong>—</strong><span>items</span></div></div><div className="leave-balance-item"><div className="leave-type"><span className="leave-dot sick-dot"></span><div><strong>Team balances</strong><span>Check allocated leave</span></div></div><div className="leave-days"><strong>→</strong><span>view</span></div></div></div><button className="card-link-btn" onClick={() => navigate("/manager/leave-requests")}>Review Requests <span>→</span></button></article>
        <article className="dashboard-card documents-dashboard-card"><div className="dashboard-card-header"><div><span className="card-label">ATTENDANCE</span><h2>Team Attendance</h2></div><span className="document-dashboard-icon">◷</span></div><div className="document-dashboard-stats"><div className="document-stat verified-stat"><div className="stat-icon">◷</div><div><strong>Today</strong><span>Team attendance</span></div></div><div className="document-stat expiring-stat"><div className="stat-icon">▤</div><div><strong>History</strong><span>Review records</span></div></div></div><button className="card-link-btn" onClick={() => navigate("/manager/attendance")}>Open Attendance <span>→</span></button></article>
      </section>
    </main>
  );
}

export default Dashboard