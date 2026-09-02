import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { getAllEmployees } from "../../services/employeeService";
import { getDepartmentById } from "../../services/departmentService";
import "./DepartmentDetails.css";

function DepartmentDetails() {
  const { user } = useAuth();
  const { departmentId } = useParams();
  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDetails() {
      try {
        const [departmentData, employeeUsers] = await Promise.all([
          getDepartmentById(departmentId),
          getAllEmployees(),
        ]);
        const allEmployees = (Array.isArray(employeeUsers) ? employeeUsers : [])
          .map((record) => record.employeeId || record)
          .filter(Boolean);
        const managerId = departmentData.manager_id?._id || departmentData.manager_id;

        setDepartment({ ...departmentData, manager: allEmployees.find((employee) => employee._id === managerId) });
        setEmployees(allEmployees.filter((employee) => {
          const employeeDepartmentId = employee.department_id?._id || employee.department_id;
          return String(employeeDepartmentId) === String(departmentId);
        }));
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load department details.");
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [departmentId]);

  if (user?.role !== "hr_admin") return <Navigate to="/" replace />;

  return (
    <main className="department-details-page">
      <header className="department-details-header">
        <div>
          <p className="page-eyebrow">DEPARTMENT DETAILS</p>
          <h1>{department?.name || (loading ? "Loading department..." : "Department")}</h1>
          <p>Review the department manager and its employees.</p>
        </div>
        <Link className="department-back-link" to="/admin/departments">Back to departments</Link>
      </header>

      {error && <div className="department-details-error" role="alert">{error}</div>}

      {!error && loading ? (
        <div className="department-details-state" role="status">Loading department details...</div>
      ) : !error && (
        <>
          <section className="department-summary">
            <div><span>Department</span><strong>{department?.name || "--"}</strong></div>
            <div><span>Manager</span><strong>{department?.manager?.name_en || "No manager assigned"}</strong></div>
            <div><span>Employees</span><strong>{employees.length}</strong></div>
          </section>

          <section className="department-employees-card">
            <div className="department-employees-toolbar"><div><h2>Employees in this department</h2><span>{employees.length} {employees.length === 1 ? "employee" : "employees"}</span></div></div>
            {employees.length === 0 ? (
              <div className="department-details-state">No employees are assigned to this department.</div>
            ) : (
              <div className="department-employees-table-wrap">
                <table>
                  <thead><tr><th>Employee</th><th>Employee code</th><th>Job title</th><th>Status</th></tr></thead>
                  <tbody>{employees.map((employee) => <tr key={employee._id}><td><strong>{employee.name_en || employee.name_ar || "--"}</strong></td><td>{employee.employee_code || "--"}</td><td>{employee.job_title || "--"}</td><td><span className={`department-status status-${employee.status || "unknown"}`}>{employee.status || "--"}</span></td></tr>)}</tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default DepartmentDetails;