import { useCallback, useEffect, useState } from "react";
import LeaveRequestTable from "../../components/LeaveRequests/LeaveRequestTable";
import LeaveRequestDetails from "../../components/LeaveRequests/LeaveRequestDetails";
import LeaveRequestForm from "../../components/LeaveRequests/LeaveRequestForm";
import {
  createLeaveRequest,
  getLeaveRequests,
} from "../../services/leaveRequestService";
import { getMyProfile } from "../../services/employeeService";
import { getLeaveTypes } from "../../services/leaveTypeService";
import { getLeaveAllocations } from "../../services/leaveAllocationService";
import "./EmployeeLeaveRequests.css";

const statuses = ["draft", "pending", "approved", "rejected", "cancelled"];

function getErrorMessage(error, fallback = "Unable to load your leave requests.") {
  return (
    error.response?.data?.message ||
    error.response?.data?.err ||
    fallback
  );
}

function EmployeeLeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

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

  const loadCreateOptions = useCallback(async () => {
    setOptionsLoading(true);
    setOptionsError("");
    try {
      const [profile, activeLeaveTypes, allocationResponse] = await Promise.all([
        getMyProfile(),
        getLeaveTypes(),
        getLeaveAllocations(),
      ]);
      setEmployee(profile?.employeeId || null);
      setLeaveTypes(activeLeaveTypes);
      setAllocations(Array.isArray(allocationResponse?.data) ? allocationResponse.data : []);
    } catch (requestError) {
      setOptionsError(getErrorMessage(requestError, "Unable to load request form options."));
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    const request = window.setTimeout(loadRequests, 0);
    return () => window.clearTimeout(request);
  }, [loadRequests]);

  useEffect(() => {
    const request = window.setTimeout(loadCreateOptions, 0);
    return () => window.clearTimeout(request);
  }, [loadCreateOptions]);

  async function submitCreate(values, shouldSubmit) {
    if (!employee?._id) {
      setFormError("Your user account is not linked to an employee record.");
      return;
    }

    const formData = new FormData();
    formData.append("employee_id", employee._id);
    formData.append("leave_type_id", values.leave_type_id);
    formData.append("is_half_day", String(values.is_half_day));
    formData.append("submit", String(shouldSubmit));
    if (values.is_half_day) {
      formData.append("half_day_date", values.half_day_date);
    } else {
      formData.append("from_date", values.from_date);
      formData.append("to_date", values.to_date);
    }
    if (values.reason.trim()) formData.append("reason", values.reason.trim());
    if (values.document) formData.append("document", values.document);

    setSaving(true);
    setFormError("");
    try {
      await createLeaveRequest(formData);
      setShowCreate(false);
      setSuccess(shouldSubmit ? "Leave request submitted successfully." : "Leave request saved as a draft.");
      await Promise.all([loadRequests(), loadCreateOptions()]);
    } catch (requestError) {
      setFormError(getErrorMessage(requestError, "Unable to create the leave request."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="employee-requests-page">
      <div className="employee-requests-header">
        <div>
          <p className="employee-requests-eyebrow">LEAVE MANAGEMENT</p>
          <h1>My Leave Requests</h1>
          <p>Review your submitted requests and their current status.</p>
        </div>
        <button
          type="button"
          className="employee-request-primary"
          onClick={() => {
            setFormError("");
            setShowCreate(true);
          }}
          disabled={optionsLoading || Boolean(optionsError) || !employee}
        >
          + New request
        </button>
      </div>

      {success && (
        <div className="employee-requests-notice employee-requests-success" role="status">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess("")} aria-label="Dismiss">×</button>
        </div>
      )}

      {optionsError && (
        <div className="employee-requests-notice employee-requests-error" role="alert">
          <span>{optionsError}</span>
          <button type="button" onClick={loadCreateOptions}>Retry</button>
        </div>
      )}

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

      {showCreate && employee && (
        <LeaveRequestForm
          employee={employee}
          leaveTypes={leaveTypes}
          allocations={allocations}
          saving={saving}
          error={formError}
          onSubmit={submitCreate}
          onClose={() => !saving && setShowCreate(false)}
        />
      )}
    </main>
  );
}

export default EmployeeLeaveRequests;
