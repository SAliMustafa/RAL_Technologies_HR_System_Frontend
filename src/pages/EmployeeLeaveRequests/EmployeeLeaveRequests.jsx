import { useCallback, useEffect, useState } from "react";
import LeaveRequestTable from "../../components/LeaveRequests/LeaveRequestTable";
import LeaveRequestDetails from "../../components/LeaveRequests/LeaveRequestDetails";
import LeaveRequestForm from "../../components/LeaveRequests/LeaveRequestForm";
import LeaveRequestConfirmDialog from "../../components/LeaveRequests/LeaveRequestConfirmDialog";
import LeaveRequestDecisionDialog from "../../components/LeaveRequests/LeaveRequestDecisionDialog";
import {
  cancelLeaveRequest,
  createLeaveRequest,
  deleteLeaveRequest,
  getLeaveRequests,
  submitLeaveRequest,
  updateLeaveRequest,
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
  const [editingRequest, setEditingRequest] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionError, setActionError] = useState("");

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

  async function submitEdit(values, shouldSubmit) {
    const currentLeaveTypeId = editingRequest.leave_type_id?._id || editingRequest.leave_type_id;
    const formData = new FormData();
    if (values.leave_type_id !== currentLeaveTypeId) formData.append("leave_type_id", values.leave_type_id);
    formData.append("is_half_day", String(values.is_half_day));
    if (values.is_half_day) {
      formData.append("half_day_date", values.half_day_date);
    } else {
      formData.append("from_date", values.from_date);
      formData.append("to_date", values.to_date);
    }
    formData.append("reason", values.reason.trim());
    if (values.document) formData.append("document", values.document);

    setSaving(true);
    setFormError("");
    try {
      await updateLeaveRequest(editingRequest._id, formData);
      if (shouldSubmit) await submitLeaveRequest(editingRequest._id);
      setEditingRequest(null);
      setSuccess(shouldSubmit ? "Draft updated and submitted successfully." : "Draft updated successfully.");
      await Promise.all([loadRequests(), loadCreateOptions()]);
    } catch (requestError) {
      setFormError(getErrorMessage(requestError, "Unable to update the leave request."));
    } finally {
      setSaving(false);
    }
  }

  function openAction(type, request) {
    setPendingAction({ type, request });
    setActionError("");
  }

  async function runConfirmedAction(note = "") {
    const { type, request } = pendingAction;
    setSaving(true);
    setActionError("");
    try {
      if (type === "submit") await submitLeaveRequest(request._id);
      if (type === "delete") await deleteLeaveRequest(request._id);
      if (type === "cancel") await cancelLeaveRequest(request._id, note);

      const messages = {
        submit: "Draft submitted successfully.",
        delete: "Draft deleted successfully.",
        cancel: "Leave request cancelled successfully.",
      };
      setPendingAction(null);
      setSuccess(messages[type]);
      await Promise.all([loadRequests(), loadCreateOptions()]);
    } catch (requestError) {
      setActionError(getErrorMessage(requestError, "Unable to update the leave request."));
    } finally {
      setSaving(false);
    }
  }

  function renderRequestActions(request) {
    if (request.status === "draft") {
      return (
        <>
          <button type="button" onClick={() => { setFormError(""); setEditingRequest(request); }}>Edit</button>
          <button type="button" onClick={() => openAction("submit", request)}>Submit</button>
          <button type="button" className="request-danger-link" onClick={() => openAction("delete", request)}>Delete</button>
        </>
      );
    }
    if (request.status === "pending" || request.status === "approved") {
      return <button type="button" className="request-danger-link" onClick={() => openAction("cancel", request)}>Cancel</button>;
    }
    return null;
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
            renderActions={renderRequestActions}
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

      {editingRequest && employee && (
        <LeaveRequestForm
          title="Edit draft request"
          employee={employee}
          leaveTypes={
            leaveTypes.some((item) => item._id === (editingRequest.leave_type_id?._id || editingRequest.leave_type_id))
              ? leaveTypes
              : [...leaveTypes, editingRequest.leave_type_id]
          }
          allocations={allocations}
          initialRequest={editingRequest}
          saving={saving}
          error={formError}
          onSubmit={submitEdit}
          onClose={() => !saving && setEditingRequest(null)}
        />
      )}

      {pendingAction?.type === "submit" && (
        <LeaveRequestConfirmDialog
          title="Submit leave request?"
          message="The draft will be sent to your assigned manager and can no longer be edited."
          confirmLabel="Submit request"
          saving={saving}
          error={actionError}
          onConfirm={runConfirmedAction}
          onClose={() => !saving && setPendingAction(null)}
        />
      )}

      {pendingAction?.type === "delete" && (
        <LeaveRequestConfirmDialog
          title="Delete draft request?"
          message="This draft will be permanently deleted. This action cannot be undone."
          confirmLabel="Delete draft"
          danger
          saving={saving}
          error={actionError}
          onConfirm={runConfirmedAction}
          onClose={() => !saving && setPendingAction(null)}
        />
      )}

      {pendingAction?.type === "cancel" && pendingAction.request.status === "pending" && (
        <LeaveRequestConfirmDialog
          title="Cancel leave request?"
          message="This pending request will be cancelled and cannot be submitted again."
          confirmLabel="Cancel request"
          danger
          saving={saving}
          error={actionError}
          onConfirm={runConfirmedAction}
          onClose={() => !saving && setPendingAction(null)}
        />
      )}

      {pendingAction?.type === "cancel" && pendingAction.request.status === "approved" && (
        <LeaveRequestDecisionDialog
          title="Cancel approved request"
          message="A reason is required. Cancelling this approved request will restore the deducted days to your matching allocation."
          confirmLabel="Cancel request"
          saving={saving}
          error={actionError}
          onConfirm={runConfirmedAction}
          onClose={() => !saving && setPendingAction(null)}
        />
      )}
    </main>
  );
}

export default EmployeeLeaveRequests;
