import { useEffect, useMemo, useState } from "react";
import { getTeamAttendance } from "../../services/attendanceService";
import "./TeamAttendance.css";

const statusLabels = {
  pending: "Pending",
  present: "Present",
  absent: "Absent",
  half_day: "Half Day",
  on_leave: "On Leave",
  holiday: "Holiday",
  weekly_off: "Weekly Off",
};

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("en-GB") : "--";
}

function formatTime(value) {
  return value
    ? new Date(value).toLocaleTimeString("en-BH", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--";
}

function employeeName(employee) {
  if (!employee || typeof employee === "string") return "Unknown employee";
  return employee.name_en || employee.name_ar || "Unknown employee";
}

function TeamAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");

  useEffect(() => {
    async function loadTeamAttendance() {
      try {
        setRecords(await getTeamAttendance());
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            requestError.response?.data?.error ||
            "Unable to load team attendance.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTeamAttendance();
  }, []);

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    return records.filter((record) => {
      const employee = record.employee_id;
      const matchesSearch =
        !term ||
        employee?.name_en?.toLowerCase().includes(term) ||
        employee?.name_ar?.toLowerCase().includes(term) ||
        employee?.employee_code?.toLowerCase().includes(term);
      const matchesStatus = status === "all" || record.status === status;
      const matchesDate = !date || record.date?.slice(0, 10) === date;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [date, records, search, status]);

  const summary = useMemo(
    () => ({
      records: records.length,
      employees: new Set(
        records.map((record) => record.employee_id?._id).filter(Boolean),
      ).size,
      present: records.filter((record) => record.status === "present").length,
      attention: records.filter(
        (record) =>
          record.is_late_entry ||
          record.is_early_exit ||
          record.is_incomplete,
      ).length,
    }),
    [records],
  );

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setDate("");
  }

  return (
    <main className="team-attendance-page">
      <header className="team-attendance-header">
        <p>MY TEAM</p>
        <h1>Team Attendance</h1>
        <span>Review your direct reports' attendance and working hours.</span>
      </header>

      {error && <div className="team-attendance-error" role="alert">{error}</div>}

      <section className="team-attendance-summary">
        <SummaryCard label="Total Records" value={summary.records} />
        <SummaryCard label="Team Members" value={summary.employees} />
        <SummaryCard label="Present Records" value={summary.present} tone="green" />
        <SummaryCard label="Needs Attention" value={summary.attention} tone="amber" />
      </section>

      <section className="team-attendance-card">
        <div className="team-attendance-toolbar">
          <div>
            <h2>Attendance Records</h2>
            <span>{filteredRecords.length} records</span>
          </div>

          <div className="team-attendance-filters">
            <input
              type="search"
              placeholder="Search employee or code"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            <button type="button" onClick={clearFilters}>Clear</button>
          </div>
        </div>

        {loading ? (
          <div className="team-attendance-state">Loading team attendance...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="team-attendance-state">No attendance records match the selected filters.</div>
        ) : (
          <div className="team-attendance-table-wrap">
            <table className="team-attendance-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Worked Hours</th>
                  <th>Flags</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record._id}>
                    <td>
                      <strong>{employeeName(record.employee_id)}</strong>
                      <span>{record.employee_id?.employee_code || "--"}</span>
                    </td>
                    <td>{formatDate(record.date)}</td>
                    <td><span className={`team-status status-${record.status}`}>{statusLabels[record.status] || record.status || "--"}</span></td>
                    <td>{formatTime(record.in_time)}</td>
                    <td>{formatTime(record.out_time)}</td>
                    <td>{Number(record.worked_hours || 0).toFixed(2)}</td>
                    <td className="attendance-flags">
                      {record.is_late_entry && <span>Late</span>}
                      {record.is_early_exit && <span>Early exit</span>}
                      {record.is_incomplete && <span>Incomplete</span>}
                      {!record.is_late_entry && !record.is_early_exit && !record.is_incomplete && "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function SummaryCard({ label, value, tone = "" }) {
  return (
    <article className={`team-summary-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export default TeamAttendance;
