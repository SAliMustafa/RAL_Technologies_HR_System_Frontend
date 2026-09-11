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

const DashboardEmployee = () => {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [leaveAllocations, setLeaveAllocations] = useState([]);

  async function handleCheckIn() {
    try {
      setError("");

      await checkIn();
      setAttendance(await getTodayAttendance());
    } catch (err) {
      console.log(err);
      setError(err?.response?.data?.message || "Check in failed");
    }
  }

  async function handleCheckOut() {
    try {
      setError("");

      await checkOut();
      setAttendance(await getTodayAttendance());
    } catch (err) {
      console.log(err);

      setError(err?.response?.data?.message || "Check out failed");
    }
  }

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const profileData = await getMyProfile();
        const employeeId = profileData?.employeeId?._id;
        if (!employeeId) {
          throw new Error("Your account is not linked to an employee record.");
        }

        const [alertsData, documentsData, allocationsResponse] =
          await Promise.all([
            getExpiryAlerts(),
            getMyDocuments(),
            getLeaveAllocations({ employee_id: employeeId }),
          ]);
        setProfile(profileData.employeeId);
        setExpiryAlerts(Array.isArray(alertsData) ? alertsData : []);
        setDocuments(Array.isArray(documentsData) ? documentsData : []);
        setLeaveAllocations(
          Array.isArray(allocationsResponse?.data)
            ? allocationsResponse.data.filter(
                (allocation) => allocation.employee_id?._id === employeeId,
              )
            : [],
        );
        try {
          const attendanceData = await getTodayAttendance();

          setAttendance(attendanceData);
        } catch (err) {
          // No attendance today
          if (err.response?.status === 404) {
            setAttendance(null);
          } else {
            throw err;
          }
        }
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

  function remainingDays(allocation) {
    return (
      Number(allocation.days_allocated || 0) +
      Number(allocation.days_carried_forward || 0) -
      Number(allocation.days_taken || 0)
    );
  }

  const verifiedDocuments = documents.filter(
    (document) => document.status === "verified",
  ).length;
  const visibleLeaveAllocations = leaveAllocations.slice(0, 2);

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
            {profile?.employee_code || "—"}
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
          <button className="check-action check-in-btn" onClick={handleCheckIn}>
            <span className="action-icon">→</span>

            <div>
              <strong>Check In</strong>
              <small>Start your work day</small>
            </div>
          </button>

          <button
            className="check-action check-out-btn"
            onClick={handleCheckOut}
          >
            <span className="action-icon">←</span>

            <div>
              <strong>Check Out</strong>
              <small>End your work day</small>
            </div>
          </button>
        </div>
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

            <span><strong>{attendance?.status || "Not recorded"}</strong></span>
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
            {visibleLeaveAllocations.length === 0 ? (
              <div className="leave-balance-item">
                <div className="leave-type"><div><strong>No allocations</strong><span>No leave balance is available.</span></div></div>
              </div>
            ) : visibleLeaveAllocations.map((allocation, index) => (
              <div className="leave-balance-item" key={allocation._id}>
                <div className="leave-type">
                  <span className={`leave-dot ${index === 0 ? "annual-dot" : "sick-dot"}`}></span>
                  <div>
                    <strong>{allocation.leave_type_id?.leave_type_name || "Leave"}</strong>
                    <span>Remaining balance</span>
                  </div>
                </div>
                <div className="leave-days">
                  <strong>{remainingDays(allocation)}</strong>
                  <span>days</span>
                </div>
              </div>
            ))}
          </div>

          <button className="card-link-btn" onClick={() => navigate("/leave-allocations")}>
            View Leave Balances
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
                You have {expiryAlerts.length} {expiryAlerts.length === 1 ? "document" : "documents"} that need your
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
