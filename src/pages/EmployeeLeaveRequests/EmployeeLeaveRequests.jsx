import { useCallback, useEffect, useState } from "react";
import LeaveRequestTable from "../../components/LeaveRequests/LeaveRequestTable";
import LeaveRequestDetails from "../../components/LeaveRequests/LeaveRequestDetails";
import { getLeaveRequests } from "../../services/leaveRequestService";
import "./EmployeeLeaveRequests.css";

const statuses = ["draft", "pending", "approved", "rejected", "cancelled"];

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.err ||
    "Unable to load your leave requests."
  );
}

function EmployeeLeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await getLeaveRequests(params);
      setRequests(Array.isArray(response?.data) ? response.data : []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const request = window.setTimeout(loadRequests, 0);
    return () => window.clearTimeout(request);
  }, [loadRequests]);

  return (
    <main className="employee-requests-page">
      <div className="employee-requests-header">
        <div>
          <p className="employee-requests-eyebrow">LEAVE MANAGEMENT</p>
          <h1>My Leave Requests</h1>
          <p>Review your submitted requests and their current status.</p>
        </div>
      </div>

      {error && (
        <div className="employee-requests-notice employee-requests-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={loadRequests}>Retry</button>
        </div>
      )}

      <section className="employee-requests-card">
        <div className="employee-requests-toolbar">
          <div>
            <h2>Requests</h2>
            {!loading && !error && (
              <span>{requests.length} {requests.length === 1 ? "request" : "requests"}</span>
            )}
          </div>
          <label className="employee-status-filter">
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="employee-requests-state" role="status">
            <span className="employee-requests-spinner" />
            Loading your leave requests...
          </div>
        ) : !error && requests.length === 0 ? (
          <div className="employee-requests-state">
            <strong>No leave requests found</strong>
            <span>
              {statusFilter
                ? "No requests match the selected status."
                : "You have not created any leave requests yet."}
            </span>
          </div>
        ) : !error && (
          <LeaveRequestTable
            requests={requests}
            onView={(request) => setSelectedRequestId(request._id)}
          />
        )}
      </section>

      {selectedRequestId && (
        <LeaveRequestDetails
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
        />
      )}
    </main>
  );
}

export default EmployeeLeaveRequests;
