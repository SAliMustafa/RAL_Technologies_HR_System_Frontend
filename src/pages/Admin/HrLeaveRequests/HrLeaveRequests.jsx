import { useCallback, useEffect, useState } from "react";
import LeaveRequestTable from "../../../components/LeaveRequests/LeaveRequestTable";
import LeaveRequestDetails from "../../../components/LeaveRequests/LeaveRequestDetails";
import { getLeaveRequests } from "../../../services/leaveRequestService";
import { getAllEmployees } from "../../../services/employeeService";
import "./HrLeaveRequests.css";

const statuses = ["draft", "pending", "approved", "rejected", "cancelled"];

function getErrorMessage(error, fallback = "Unable to load leave requests.") {
  return error.response?.data?.message || error.response?.data?.err || fallback;
}

function HrLeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [employeeError, setEmployeeError] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (employeeFilter) params.employee_id = employeeFilter;
      if (statusFilter) params.status = statusFilter;
      const response = await getLeaveRequests(params);
      setRequests(Array.isArray(response?.data) ? response.data : []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [employeeFilter, statusFilter]);

  const loadEmployees = useCallback(async () => {
    setEmployeeError("");
    try {
      const users = await getAllEmployees();
      const records = (Array.isArray(users) ? users : [])
        .map((user) => user.employeeId)
        .filter(Boolean)
        .sort((first, second) => first.name_en.localeCompare(second.name_en));
      setEmployees(records);
    } catch (requestError) {
      setEmployeeError(getErrorMessage(requestError, "Unable to load the employee filter."));
    }
  }, []);

  useEffect(() => {
    const request = window.setTimeout(loadRequests, 0);
    return () => window.clearTimeout(request);
  }, [loadRequests]);

  useEffect(() => {
    const request = window.setTimeout(loadEmployees, 0);
    return () => window.clearTimeout(request);
  }, [loadEmployees]);

  function clearFilters() {
    setEmployeeFilter("");
    setStatusFilter("");
  }

  return (
    <main className="hr-requests-page">
      <div className="hr-requests-header">
        <div>
          <p className="hr-requests-eyebrow">LEAVE MANAGEMENT</p>
          <h1>Leave Requests</h1>
          <p>Review leave requests across the organization.</p>
        </div>
      </div>

      {employeeError && (
        <div className="hr-requests-notice hr-requests-error" role="alert">
          <span>{employeeError}</span>
          <button type="button" onClick={loadEmployees}>Retry</button>
        </div>
      )}
      {error && (
        <div className="hr-requests-notice hr-requests-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={loadRequests}>Retry</button>
        </div>
      )}

      <section className="hr-requests-card">
        <div className="hr-requests-toolbar">
          <div>
            <h2>Employee requests</h2>
            {!loading && !error && <span>{requests.length} {requests.length === 1 ? "request" : "requests"}</span>}
          </div>
          <div className="hr-request-filters" aria-label="Leave request filters">
            <label>
              <span>Employee</span>
              <select value={employeeFilter} onChange={(event) => setEmployeeFilter(event.target.value)} disabled={Boolean(employeeError)}>
                <option value="">All employees</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>{employee.name_en} ({employee.employee_code})</option>
                ))}
              </select>
            </label>
            <label>
              <span>Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </label>
            {(employeeFilter || statusFilter) && <button type="button" className="hr-clear-filters" onClick={clearFilters}>Clear</button>}
          </div>
        </div>

        {loading ? (
          <div className="hr-requests-state" role="status"><span className="hr-requests-spinner" />Loading leave requests...</div>
        ) : !error && requests.length === 0 ? (
          <div className="hr-requests-state"><strong>No leave requests found</strong><span>{employeeFilter || statusFilter ? "No requests match the selected filters." : "No employee leave requests are available."}</span></div>
        ) : !error && (
          <LeaveRequestTable requests={requests} onView={(request) => setSelectedRequestId(request._id)} />
        )}
      </section>

      {selectedRequestId && <LeaveRequestDetails requestId={selectedRequestId} onClose={() => setSelectedRequestId(null)} />}
    </main>
  );
}

export default HrLeaveRequests;
