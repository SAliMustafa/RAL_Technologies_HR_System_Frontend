import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "../../components/css/Employee/Dashboard.css";
import { getMyProfile } from "../../services/employeeService";
import { getTodayAttendance } from "../../services/attendanceService";
import { checkIn, checkOut } from "../../services/checkInService";
import {
  getMyDocuments,
  getExpiryAlerts,
} from "../../services/documentsService";
import { getLeaveAllocations } from "../../services/leaveAllocationService";
import { getDepartmentById } from "../../services/departmentService";

const DashboardEmployee = () => {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  async function handleCheckIn() {
    try {
      setError("");
      setActionMessage("");
      setActionLoading(true);

      const response = await checkIn();
      setAttendance(response.attendance || response);
      setActionMessage(response.message || "Checked in successfully.");
    } catch (err) {
      setActionMessage(err?.response?.data?.message || err?.response?.data?.error || "Check in failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckOut() {
    try {
      setError("");
      setActionMessage("");
      setActionLoading(true);

      const response = await checkOut();
      setAttendance(response.attendance || response);
      setActionMessage(response.message || "Checked out successfully.");
    } catch (err) {
      setActionMessage(err?.response?.data?.message || err?.response?.data?.error || "Check out failed");
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const profileData = await getMyProfile();
        const employee = profileData.employeeId;
        setProfile(employee);

        const results = await Promise.allSettled([
          getExpiryAlerts(),
          getMyDocuments(),
          getLeaveAllocations(),
          getTodayAttendance(),
          employee?.department_id?._id || employee?.department_id
            ? getDepartmentById(employee.department_id?._id || employee.department_id)
            : Promise.resolve(null),
        ]);

        const [alertsResult, documentsResult, balancesResult, attendanceResult, departmentResult] = results;
        if (alertsResult.status === "fulfilled") setExpiryAlerts(Array.isArray(alertsResult.value) ? alertsResult.value : []);
        if (documentsResult.status === "fulfilled") setDocuments(Array.isArray(documentsResult.value) ? documentsResult.value : []);
        if (balancesResult.status === "fulfilled") setLeaveBalances(Array.isArray(balancesResult.value?.data) ? balancesResult.value.data : []);
        if (attendanceResult.status === "fulfilled") setAttendance(attendanceResult.value);
        if (departmentResult.status === "fulfilled") setDepartmentName(departmentResult.value?.name || "");
      } catch (err) {
        console.log(err);

        setError(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  function formatTime(date) {
    if (!date) return "--";

    return new Date(date).toLocaleTimeString("en-BH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const leaveBalanceByType = leaveBalances.reduce((balances, allocation) => {
    const name = allocation.leave_type_id?.leave_type_name?.toLowerCase() || "";
    const remaining = Number(allocation.days_allocated || 0) +
      Number(allocation.days_carried_forward || 0) - Number(allocation.days_taken || 0);
    if (name.includes("annual")) balances.annual += remaining;
    if (name.includes("sick")) balances.sick += remaining;
    return balances;
  }, { annual: 0, sick: 0 });

  const verifiedDocuments = documents.filter((document) => document.status === "verified").length;

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <main className="employee-dashboard">
      {/* WELCOME */}
      <section className="employee-welcome">
        <div>
          <p className="welcome-small">Welcome back</p>

          <h1>Good Morning, {profile?.name_en} 👋</h1>

          <p className="employee-position">
            {profile?.job_title || "—"}
            <span>•</span>
            {departmentName || "—"}{" "}
          </p>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="quick-actions-section">
        <div className="section-heading">
          <div>
            <h2>Quick Actions</h2>
            <p>Record today's attendance.</p>
          </div>
        </div>

        <div className="quick-actions">
          <button className="check-action check-in-btn" onClick={handleCheckIn} disabled={actionLoading || Boolean(attendance?.in_time)}>
            <span className="action-icon">→</span>

            <div>
              <strong>Check In</strong>
              <small>Start your work day</small>
            </div>
          </button>

          <button
            className="check-action check-out-btn"
            onClick={handleCheckOut}
            disabled={actionLoading || !attendance?.in_time || Boolean(attendance?.out_time)}
          >
            <span className="action-icon">←</span>

            <div>
              <strong>Check Out</strong>
              <small>End your work day</small>
            </div>
          </button>
        </div>
        {actionMessage && <p className="dashboard-action-message" role="status">{actionMessage}</p>}
      </section>
           {/* Expiry Alerts  */}
        {expiryAlerts.length > 0 && (
        <section className="expiry-alerts">
          <div className="expiry-alerts-header">
            <div>
              <h2>Document Alerts</h2>
              <p>Documents that need your attention soon.</p>
            </div>

            <span className="expiry-alert-count">{expiryAlerts.length}</span>
          </div>

          <div className="expiry-alert-list">
            {expiryAlerts.map((alert, index) => (
              <div key={index} className="expiry-alert">
                <div className="expiry-alert-icon">⚠</div>

                <div className="expiry-alert-content">
                  <div className="expiry-alert-top">
                    <strong>
                      {alert.document_type
                        .replaceAll("_", " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </strong>

                    <span className="expiry-days-badge">
                      {alert.daysRemaining} days
                    </span>
                  </div>

                  <p>{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* DASHBOARD CARDS */}
      <section className="dashboard-main-grid">
        {/* ATTENDANCE */}
        <article className="dashboard-card attendance-card">
          <div className="dashboard-card-header">
            <div>
              <span className="card-label">TODAY</span>

              <h2>Today's Attendance</h2>
            </div>

            <span className="attendance-icon">◷</span>
          </div>

          <div className="attendance-status">
            <span className="status-dot"></span>

            <span><strong>{attendance?.status || "--"}</strong></span>
          </div>

          <div className="attendance-times">
            <div className="time-box">
              <span>Check In</span>

              <strong>{formatTime(attendance?.in_time)}</strong>
            </div>

            <div className="time-divider"></div>

            <div className="time-box">
              <span>Check Out</span>

              <strong>{formatTime(attendance?.out_time)}</strong>
            </div>
          </div>

          <button
            className="card-link-btn"
            onClick={() => navigate("/my-attendance")}
          >
            View Attendance
            <span>→</span>
          </button>
        </article>
        {/* LEAVE BALANCE */}
        <article className="dashboard-card leave-card">
          <div className="dashboard-card-header">
            <div>
              <span className="card-label">LEAVE</span>

              <h2>Leave Balance</h2>
            </div>

            <span className="leave-dashboard-icon">◫</span>
          </div>

          <div className="leave-balance-list">
            <div className="leave-balance-item">
              <div className="leave-type">
                <span className="leave-dot annual-dot"></span>

                <div>
                  <strong>Annual Leave</strong>
                  <span>Remaining balance</span>
                </div>
              </div>

              <div className="leave-days">
                <strong>{leaveBalanceByType.annual}</strong>
                <span>days</span>
              </div>
            </div>

            <div className="leave-balance-item">
              <div className="leave-type">
                <span className="leave-dot sick-dot"></span>

                <div>
                  <strong>Sick Leave</strong>
                  <span>Remaining balance</span>
                </div>
              </div>

              <div className="leave-days">
                <strong>{leaveBalanceByType.sick}</strong>
                <span>days</span>
              </div>
            </div>
          </div>

          <button className="card-link-btn" onClick={() => navigate("/leave")}>
            View Leave
            <span>→</span>
          </button>
        </article>

        {/* DOCUMENTS */}
        <article className="dashboard-card documents-dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <span className="card-label">DOCUMENTS</span>

              <h2>My Documents</h2>
            </div>

            <span className="document-dashboard-icon">▤</span>
          </div>

          <div className="document-dashboard-stats">
            <div className="document-stat verified-stat">
              <div className="stat-icon">✓</div>

              <div>
                <strong>{verifiedDocuments}</strong>

                <span>Verified</span>
              </div>
            </div>

            <div className="document-stat expiring-stat">
              <div className="stat-icon">⚠</div>

              <div>
                <strong>{expiryAlerts.length}</strong>

                <span>Expiring Soon</span>
              </div>
            </div>
          </div>

          {expiryAlerts.length > 0 && (
            <div className="document-warning">
              <span>⚠</span>

              <p>
                You have {expiryAlerts.length} document(s) that need your
                attention.
              </p>
            </div>
          )}

          <button
            className="card-link-btn"
            onClick={() => navigate("/mydocuments")}
          >
            View Documents
            <span>→</span>
          </button>
        </article>
      </section>
    </main>
  );
};

export default DashboardEmployee;
