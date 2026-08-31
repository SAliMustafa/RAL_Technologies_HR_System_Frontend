import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "../../components/css/Employee/Dashboard.css";
import {  getMyProfile} from "../../services/employeeService";
import {  getTodayAttendance} from "../../services/attendanceService";
import {checkIn,checkOut} from "../../services/checkInService";
import { getMyDocuments,getExpiryAlerts} from "../../services/documentsService"

const DashboardEmployee = () => {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // مؤقتاً بيانات تجريبية
  const employee = {
    name: "Qasem",
    job_title: "Software Developer",
    department: "IT",
  };

  // const attendance = {
  //   status: "Present",
  //   in_time: "08:04",
  //   out_time: "--",
  // };

  const documents = {
    verified: 5,
    expiring: 1,
  };

  async function handleCheckIn() {
    try {
      setError("");

      const data = await checkIn();

      console.log("Check in:", data);

      setAttendance(data);
    } catch (err) {
      console.log(err);
      console.log("Status:", error.response?.status);
      console.log("Backend message:", error.response?.data);
      setError(err?.response?.data?.message || "Check in failed");
    }
  }

  async function handleCheckOut() {
    try {
      setError("");

      const data = await checkOut();

      console.log("Check out:", data);

      setAttendance(data);
    } catch (err) {
      console.log(err);

      setError(err?.response?.data?.message || "Check out failed");
    }
  }

  const leaveBalance = {
    annual: 23,
    sick: 15,
  };

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const profileData = await getMyProfile();
        const attendanceData = await getTodayAttendance();

        console.log("Profile:", profileData);
        console.log("Today's attendance:", attendanceData);

        setProfile(profileData.employeeId);

        setAttendance(attendanceData);
      } catch (err) {
        console.log(err);

        setError(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  // console.log(attendance);

  function formatTime(date) {
    if (!date) return "--";

    return new Date(date).toLocaleTimeString("en-BH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
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
            {employee.job_title}
            <span>•</span>
            {profile?.department || "—"}{" "}
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

            <span>
              {<strong>{attendance?.status}</strong> || "--"}
            </span>
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
            onClick={() => navigate("/attendance")}
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
                <strong>{leaveBalance.annual}</strong>
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
                <strong>{leaveBalance.sick}</strong>
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
                <strong>{documents.verified}</strong>

                <span>Verified</span>
              </div>
            </div>

            <div className="document-stat expiring-stat">
              <div className="stat-icon">⚠</div>

              <div>
                <strong>{documents.expiring}</strong>

                <span>Expiring Soon</span>
              </div>
            </div>
          </div>

          {documents.expiring > 0 && (
            <div className="document-warning">
              <span>⚠</span>

              <p>
                You have {documents.expiring} document that needs your
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
