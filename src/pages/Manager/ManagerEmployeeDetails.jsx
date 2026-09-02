import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getTeam } from "../../services/employeeService";
import "./ManagerEmployeeDetails.css";

const valueLabels = {
  active: "Active",
  on_leave: "On Leave",
  suspended: "Suspended",
  left: "Left",
  full_time: "Full Time",
  part_time: "Part Time",
  fixed_term: "Fixed Term",
  male: "Male",
  female: "Female",
};

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("en-GB") : "--";
}

function DetailItem({ label, value }) {
  return (
    <div className="manager-detail-item">
      <dt>{label}</dt>
      <dd>{value || "--"}</dd>
    </div>
  );
}

function ManagerEmployeeDetails() {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEmployee() {
      try {
        const team = await getTeam();
        const match = Array.isArray(team)
          ? team.find((item) => item._id === employeeId)
          : null;

        if (!match) {
          setError("Employee was not found in your direct reports.");
          return;
        }

        setEmployee(match);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            requestError.response?.data?.error ||
            "Unable to load employee details.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadEmployee();
  }, [employeeId]);

  if (loading) {
    return <main className="manager-employee-detail-page"><div className="manager-detail-state">Loading employee details...</div></main>;
  }

  if (!employee) {
    return (
      <main className="manager-employee-detail-page">
        <div className="manager-detail-error" role="alert">{error}</div>
        <Link className="manager-detail-back" to="/manager/employees">← Back to My Employees</Link>
      </main>
    );
  }

  return (
    <main className="manager-employee-detail-page">
      <header className="manager-detail-header">
        <div>
          <p>MY TEAM</p>
          <h1>Employee Details</h1>
          <span>View employment and contact information for your direct report.</span>
        </div>
        <Link className="manager-detail-back" to="/manager/employees">← Back to My Employees</Link>
      </header>

      {error && <div className="manager-detail-error" role="alert">{error}</div>}

      <section className="manager-detail-profile">
        <div className="manager-detail-avatar">
          {employee.name_en?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div>
          <h2>{employee.name_en || "Unnamed employee"}</h2>
          <p>{employee.name_ar || "--"}</p>
          <span>{employee.job_title || "--"}</span>
        </div>
        <span className={`manager-detail-status status-${employee.status}`}>
          {valueLabels[employee.status] || employee.status || "--"}
        </span>
      </section>

      <section className="manager-detail-section">
        <h2>Employment Information</h2>
        <dl className="manager-detail-grid">
          <DetailItem label="Employee Code" value={employee.employee_code} />
          <DetailItem label="Job Title" value={employee.job_title} />
          <DetailItem label="Employment Type" value={valueLabels[employee.employment_type]} />
          <DetailItem label="Status" value={valueLabels[employee.status]} />
          <DetailItem label="Date of Joining" value={formatDate(employee.date_of_joining)} />
          <DetailItem label="Probation End Date" value={formatDate(employee.probation_end_date)} />
        </dl>
      </section>

      <section className="manager-detail-section">
        <h2>Personal Information</h2>
        <dl className="manager-detail-grid">
          <DetailItem label="Nationality" value={employee.nationality} />
          <DetailItem label="Gender" value={valueLabels[employee.gender]} />
          <DetailItem label="Work Email" value={employee.email_work} />
          <DetailItem label="Mobile" value={employee.mobile} />
        </dl>
      </section>
    </main>
  );
}

export default ManagerEmployeeDetails;
