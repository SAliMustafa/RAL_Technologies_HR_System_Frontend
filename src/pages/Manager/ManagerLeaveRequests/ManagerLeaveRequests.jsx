import { useCallback, useEffect, useState } from "react";
import LeaveRequestTable from "../../../components/LeaveRequests/LeaveRequestTable";
import LeaveRequestDetails from "../../../components/LeaveRequests/LeaveRequestDetails";
import LeaveRequestForm from "../../../components/LeaveRequests/LeaveRequestForm";
import LeaveRequestConfirmDialog from "../../../components/LeaveRequests/LeaveRequestConfirmDialog";
import LeaveRequestDecisionDialog from "../../../components/LeaveRequests/LeaveRequestDecisionDialog";
import {
  approveLeaveRequest,
  cancelLeaveRequest,
  createLeaveRequest,
  deleteLeaveRequest,
  getLeaveRequests,
  rejectLeaveRequest,
  submitLeaveRequest,
  updateLeaveRequest,
} from "../../../services/leaveRequestService";
import { getMyProfile } from "../../../services/employeeService";
import { getLeaveTypes } from "../../../services/leaveTypeService";
import { getLeaveAllocations } from "../../../services/leaveAllocationService";
import "./ManagerLeaveRequests.css";

const statuses = ["draft", "pending", "approved", "rejected", "cancelled"];

function getErrorMessage(error, fallback = "Unable to load leave requests.") {
  return error.response?.data?.message || error.response?.data?.err || fallback;
}

function requestEmployeeId(request) {
  return request.employee_id?._id || request.employee_id;
}

function requestApproverId(request) {
  return request.approver_id?._id || request.approver_id;
}

function ManagerLeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [managerEmployee, setManagerEmployee] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getLeaveRequests(statusFilter ? { status: statusFilter } : {});
      setRequests(Array.isArray(response?.data) ? response.data : []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true);
    setOptionsError("");
    try {
      const [profile, activeLeaveTypes, allocationResponse] = await Promise.all([
        getMyProfile(),
        getLeaveTypes(),
        getLeaveAllocations(),
      ]);
      const employee = profile?.employeeId || null;
      setManagerEmployee(employee);
      setLeaveTypes(activeLeaveTypes);
      setAllocations(
        (Array.isArray(allocationResponse?.data) ? allocationResponse.data : [])
          .filter((allocation) => String(requestEmployeeId(allocation)) === String(employee?._id)),
      );
    } catch (requestError) {
      setOptionsError(getErrorMessage(requestError, "Unable to load manager request options."));
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    const request = window.setTimeout(loadRequests, 0);
    return () => window.clearTimeout(request);
  }, [loadRequests]);

  useEffect(() => {
    const request = window.setTimeout(loadOptions, 0);
    return () => window.clearTimeout(request);
  }, [loadOptions]);

  const ownRequests = requests.filter(
    (request) => String(requestEmployeeId(request)) === String(managerEmployee?._id),
  );
  const assignedRequests = requests.filter(
    (request) => String(requestEmployeeId(request)) !== String(managerEmployee?._id),
  );

  function buildCreateFormData(values, shouldSubmit) {
    const formData = new FormData();
    formData.append("employee_id", managerEmployee._id);
    formData.append("leave_type_id", values.leave_type_id);
    formData.append("is_half_day", String(values.is_half_day));
    formData.append("submit", String(shouldSubmit));
    if (values.is_half_day) formData.append("half_day_date", values.half_day_date);
    else {
      formData.append("from_date", values.from_date);
      formData.append("to_date", values.to_date);
    }
    if (values.reason.trim()) formData.append("reason", values.reason.trim());
    if (values.document) formData.append("document", values.document);
    return formData;
  }

  async function submitCreate(values, shouldSubmit) {
    if (!managerEmployee?._id) {
      setFormError("Your user account is not linked to an employee record.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await createLeaveRequest(buildCreateFormData(values, shouldSubmit));
      setShowCreate(false);
      setSuccess(shouldSubmit ? "Leave request submitted successfully." : "Leave request saved as a draft.");
      await Promise.all([loadRequests(), loadOptions()]);
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
    if (values.is_half_day) formData.append("half_day_date", values.half_day_date);
    else {
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
      await Promise.all([loadRequests(), loadOptions()]);
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
      if (type === "approve") await approveLeaveRequest(request._id);
      if (type === "reject") await rejectLeaveRequest(request._id, note);
      setPendingAction(null);
      setSuccess({
        submit: "Draft submitted successfully.",
        delete: "Draft deleted successfully.",
        cancel: "Leave request cancelled successfully.",
        approve: "Leave request approved successfully.",
        reject: "Leave request rejected successfully.",
      }[type]);
      await Promise.all([loadRequests(), loadOptions()]);
    } catch (requestError) {
      setActionError(getErrorMessage(requestError, "Unable to update the leave request."));
    } finally {
      setSaving(false);
    }
  }

  function renderOwnActions(request) {
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

  function renderAssignedActions(request) {
    const isAssigned = String(requestApproverId(request)) === String(managerEmployee?._id);
    if (!isAssigned || request.status !== "pending") return null;

    return (
      <>
        <button type="button" onClick={() => openAction("approve", request)}>Approve</button>
        <button type="button" className="request-danger-link" onClick={() => openAction("reject", request)}>Reject</button>
      </>
    );
  }

  const renderSection = (title, description, sectionRequests, actions) => (
    <section className="manager-requests-card">
      <div className="manager-requests-section-header">
        <div><h2>{title}</h2><p>{description}</p></div>
        {!loading && !error && <span>{sectionRequests.length} {sectionRequests.length === 1 ? "request" : "requests"}</span>}
      </div>
      {loading ? (
        <div className="manager-requests-state" role="status"><span className="manager-requests-spinner" />Loading leave requests...</div>
      ) : !error && sectionRequests.length === 0 ? (
        <div className="manager-requests-state"><strong>No requests found</strong><span>There are no requests in this section for the selected status.</span></div>
      ) : !error && (
        <LeaveRequestTable requests={sectionRequests} onView={(request) => setSelectedRequestId(request._id)} renderActions={actions} />
      )}
    </section>
  );

  return (
    <main className="manager-requests-page">
      <div className="manager-requests-header">
        <div><p className="manager-requests-eyebrow">LEAVE MANAGEMENT</p><h1>Leave Requests</h1><p>Manage your requests and review requests assigned to you.</p></div>
        <button type="button" className="manager-request-primary" onClick={() => { setFormError(""); setShowCreate(true); }} disabled={optionsLoading || Boolean(optionsError) || !managerEmployee}>+ New request</button>
      </div>

      {success && <div className="manager-requests-notice manager-requests-success" role="status"><span>{success}</span><button type="button" onClick={() => setSuccess("")} aria-label="Dismiss">×</button></div>}
      {optionsError && <div className="manager-requests-notice manager-requests-error" role="alert"><span>{optionsError}</span><button type="button" onClick={loadOptions}>Retry</button></div>}
      {error && <div className="manager-requests-notice manager-requests-error" role="alert"><span>{error}</span><button type="button" onClick={loadRequests}>Retry</button></div>}

      <div className="manager-requests-filter-row">
        <label><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}</select></label>
      </div>

      {renderSection("My requests", "Requests you created for your own leave.", ownRequests, renderOwnActions)}
      {renderSection("Assigned to me", "Team requests waiting for or recording your decision.", assignedRequests, renderAssignedActions)}

      {selectedRequestId && <LeaveRequestDetails requestId={selectedRequestId} onClose={() => setSelectedRequestId(null)} />}
      {showCreate && managerEmployee && <LeaveRequestForm employee={managerEmployee} leaveTypes={leaveTypes} allocations={allocations} saving={saving} error={formError} onSubmit={submitCreate} onClose={() => !saving && setShowCreate(false)} />}
      {editingRequest && managerEmployee && <LeaveRequestForm title="Edit draft request" employee={managerEmployee} leaveTypes={leaveTypes.some((item) => item._id === (editingRequest.leave_type_id?._id || editingRequest.leave_type_id)) ? leaveTypes : [...leaveTypes, editingRequest.leave_type_id]} allocations={allocations} initialRequest={editingRequest} saving={saving} error={formError} onSubmit={submitEdit} onClose={() => !saving && setEditingRequest(null)} />}

      {pendingAction?.type === "submit" && <LeaveRequestConfirmDialog title="Submit leave request?" message="The draft will be sent to your assigned manager and can no longer be edited." confirmLabel="Submit request" saving={saving} error={actionError} onConfirm={runConfirmedAction} onClose={() => !saving && setPendingAction(null)} />}
      {pendingAction?.type === "delete" && <LeaveRequestConfirmDialog title="Delete draft request?" message="This draft will be permanently deleted. This action cannot be undone." confirmLabel="Delete draft" danger saving={saving} error={actionError} onConfirm={runConfirmedAction} onClose={() => !saving && setPendingAction(null)} />}
      {pendingAction?.type === "cancel" && pendingAction.request.status === "pending" && <LeaveRequestConfirmDialog title="Cancel leave request?" message="This pending request will be cancelled and cannot be submitted again." confirmLabel="Cancel request" danger saving={saving} error={actionError} onConfirm={runConfirmedAction} onClose={() => !saving && setPendingAction(null)} />}
      {pendingAction?.type === "cancel" && pendingAction.request.status === "approved" && <LeaveRequestDecisionDialog title="Cancel approved request" message="A reason is required. Cancelling this approved request will restore the deducted days to your matching allocation." confirmLabel="Cancel request" saving={saving} error={actionError} onConfirm={runConfirmedAction} onClose={() => !saving && setPendingAction(null)} />}
      {pendingAction?.type === "approve" && <LeaveRequestConfirmDialog title="Approve leave request?" message="Approving this request will deduct its total days from the employee's matching leave allocation." confirmLabel="Approve request" saving={saving} error={actionError} onConfirm={runConfirmedAction} onClose={() => !saving && setPendingAction(null)} />}
      {pendingAction?.type === "reject" && <LeaveRequestDecisionDialog title="Reject leave request" message="Provide a decision note explaining why this request is being rejected." confirmLabel="Reject request" saving={saving} error={actionError} onConfirm={runConfirmedAction} onClose={() => !saving && setPendingAction(null)} />}
    </main>
  );
}

export default ManagerLeaveRequests;
