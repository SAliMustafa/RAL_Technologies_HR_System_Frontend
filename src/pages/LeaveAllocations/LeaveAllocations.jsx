import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getLeaveAllocations } from "../../services/leaveAllocationService";
import "./LeaveAllocations.css";

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.err ||
    "Unable to load leave allocations."
  );
}

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function calculateRemaining(allocation) {
  return (
    Number(allocation.days_allocated || 0) +
    Number(allocation.days_carried_forward || 0) -
    Number(allocation.days_taken || 0)
  );
}

function LeaveAllocations() {
  const { user } = useAuth();
  const role = user?.role;
  const [allocations, setAllocations] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAllocations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (employeeFilter && role !== "employee") {
        params.employee_id = employeeFilter;
      }
      if (leaveTypeFilter) params.leave_type_id = leaveTypeFilter;

      const response = await getLeaveAllocations(params);
      const records = Array.isArray(response?.data) ? response.data : [];
      setAllocations(records);

      if (!employeeFilter && !leaveTypeFilter) {
        const employees = new Map();
        const leaveTypes = new Map();

        records.forEach((allocation) => {
          if (allocation.employee_id?._id) {
            employees.set(allocation.employee_id._id, allocation.employee_id);
          }
          if (allocation.leave_type_id?._id) {
            leaveTypes.set(allocation.leave_type_id._id, allocation.leave_type_id);
          }
        });

        setEmployeeOptions(
          [...employees.values()].sort((first, second) =>
            first.name_en.localeCompare(second.name_en),
          ),
        );
        setLeaveTypeOptions(
          [...leaveTypes.values()].sort((first, second) =>
            first.leave_type_name.localeCompare(second.leave_type_name),
          ),
        );
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [employeeFilter, leaveTypeFilter, role]);

  useEffect(() => {
    const request = window.setTimeout(loadAllocations, 0);
    return () => window.clearTimeout(request);
  }, [loadAllocations]);

  return (
    <main className="allocations-page">
      <div className="allocations-header">
        <div>
          <p className="allocations-eyebrow">LEAVE MANAGEMENT</p>
          <h1>Leave Allocations</h1>
          <p>View allocated leave and remaining balances.</p>
        </div>
      </div>

      {error && (
        <div className="allocations-notice allocations-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={loadAllocations}>Retry</button>
        </div>
      )}

      <section className="allocations-card">
        <div className="allocations-toolbar">
          <div>
            <h2>Leave balances</h2>
            {!loading && !error && (
              <span>
                {allocations.length} {allocations.length === 1 ? "allocation" : "allocations"}
              </span>
            )}
          </div>
          <div className="allocation-filters" aria-label="Allocation filters">
            {role !== "employee" && (
              <label>
                <span>Employee</span>
                <select
                  value={employeeFilter}
                  onChange={(event) => setEmployeeFilter(event.target.value)}
                >
                  <option value="">All employees</option>
                  {employeeOptions.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name_en}{employee.employee_code ? ` (${employee.employee_code})` : ""}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              <span>Leave type</span>
              <select
                value={leaveTypeFilter}
                onChange={(event) => setLeaveTypeFilter(event.target.value)}
              >
                <option value="">All leave types</option>
                {leaveTypeOptions.map((leaveType) => (
                  <option key={leaveType._id} value={leaveType._id}>
                    {leaveType.leave_type_name}
                  </option>
                ))}
              </select>
            </label>
            {(employeeFilter || leaveTypeFilter) && (
              <button
                type="button"
                className="clear-filters"
                onClick={() => {
                  setEmployeeFilter("");
                  setLeaveTypeFilter("");
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="allocations-state" role="status">
            <span className="allocations-spinner" />
            Loading leave allocations...
          </div>
        ) : !error && allocations.length === 0 ? (
          <div className="allocations-state">
            <strong>No leave allocations found</strong>
            <span>There are no leave balances available to display.</span>
          </div>
        ) : !error && (
          <div className="allocations-table-wrap">
            <table className="allocations-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave type</th>
                  <th>Allocation period</th>
                  <th className="number-column">Allocated</th>
                  <th className="number-column">Carried forward</th>
                  <th className="number-column">Taken</th>
                  <th className="number-column">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((allocation) => {
                  const remaining = calculateRemaining(allocation);

                  return (
                    <tr key={allocation._id}>
                      <td>
                        <strong>{allocation.employee_id?.name_en || "Unknown employee"}</strong>
                        {allocation.employee_id?.employee_code && (
                          <small>{allocation.employee_id.employee_code}</small>
                        )}
                      </td>
                      <td>{allocation.leave_type_id?.leave_type_name || "Unknown leave type"}</td>
                      <td>
                        <span className="allocation-period">
                          {formatDate(allocation.period_start)}
                          <small>to {formatDate(allocation.period_end)}</small>
                        </span>
                      </td>
                      <td className="number-column">{allocation.days_allocated}</td>
                      <td className="number-column">{allocation.days_carried_forward}</td>
                      <td className="number-column">{allocation.days_taken}</td>
                      <td className="number-column">
                        <strong className={`remaining-balance ${remaining <= 0 ? "depleted" : ""}`}>
                          {remaining}
                        </strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default LeaveAllocations;
