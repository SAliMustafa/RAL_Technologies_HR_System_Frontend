import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { getTeam } from "../../services/employeeService";
import "./MyEmployees.css";

const statusLabels = {
  active: "Active",
  on_leave: "On Leave",
  suspended: "Suspended",
  left: "Left",
};

const employmentLabels = {
  full_time: "Full Time",
  part_time: "Part Time",
  fixed_term: "Fixed Term",
};

function MyEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    async function loadTeam() {
      try {
        const data = await getTeam();
        setEmployees(Array.isArray(data) ? data : []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            requestError.response?.data?.error ||
            "Unable to load your employees.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, []);

  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !term ||
        employee.name_en?.toLowerCase().includes(term) ||
        employee.name_ar?.toLowerCase().includes(term) ||
        employee.employee_code?.toLowerCase().includes(term) ||
        employee.job_title?.toLowerCase().includes(term);
      const matchesStatus = status === "all" || employee.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [employees, search, status]);

  const activeCount = employees.filter(
    (employee) => employee.status === "active",
  ).length;
  const onLeaveCount = employees.filter(
    (employee) => employee.status === "on_leave",
  ).length;

  return (
    <main className="manager-employees-page">
      <header className="manager-employees-header">
        <div>
          <p>MY TEAM</p>
          <h1>My Employees</h1>
          <span>View the employees who report directly to you.</span>
        </div>
      </header>

      {error && (
        <div className="manager-employees-error" role="alert">
          {error}
        </div>
      )}

      <section className="manager-employees-summary">
        <SummaryCard label="Team Members" value={employees.length} />
        <SummaryCard label="Active" value={activeCount} tone="green" />
        <SummaryCard label="On Leave" value={onLeaveCount} tone="amber" />
      </section>

      <section className="manager-employees-card">
        <div className="manager-employees-toolbar">
          <div>
            <h2>Direct Reports</h2>
            <span>{filteredEmployees.length} employees</span>
          </div>

          <div className="manager-employees-filters">
            <input
              type="search"
              placeholder="Search name, code, or job title"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">All statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="manager-employees-state">Loading your team...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="manager-employees-state">
            No direct reports match the selected filters.
          </div>
        ) : (
          <div className="manager-employee-grid">
            {filteredEmployees.map((employee) => (
              <article className="manager-employee-card" key={employee._id}>
                <div className="manager-employee-card-top">
                  <div className="manager-employee-avatar">
                    {employee.name_en?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <h3>{employee.name_en || "Unnamed employee"}</h3>
                    <p>{employee.name_ar || "--"}</p>
                  </div>
                  <span className={`manager-employee-status status-${employee.status}`}>
                    {statusLabels[employee.status] || employee.status || "--"}
                  </span>
                </div>

                <dl className="manager-employee-details">
                  <div>
                    <dt>Employee Code</dt>
                    <dd>{employee.employee_code || "--"}</dd>
                  </div>
                  <div>
                    <dt>Job Title</dt>
                    <dd>{employee.job_title || "--"}</dd>
                  </div>
                  <div>
                    <dt>Employment</dt>
                    <dd>{employmentLabels[employee.employment_type] || "--"}</dd>
                  </div>
                  <div>
                    <dt>Work Email</dt>
                    <dd>{employee.email_work || "--"}</dd>
                  </div>
                </dl>

                <Link
                  className="manager-employee-details-button"
                  to={`/manager/employees/${employee._id}`}
                >
                  View Details
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function SummaryCard({ label, value, tone = "" }) {
  return (
    <article className={`manager-employees-summary-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export default MyEmployees;
