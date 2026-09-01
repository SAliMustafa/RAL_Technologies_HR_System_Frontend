import { useCallback, useEffect, useState } from "react";
import LeaveRequestTable from "../../../components/LeaveRequests/LeaveRequestTable";
import LeaveRequestDetails from "../../../components/LeaveRequests/LeaveRequestDetails";
import LeaveRequestForm from "../../../components/LeaveRequests/LeaveRequestForm";
import LeaveRequestConfirmDialog from "../../../components/LeaveRequests/LeaveRequestConfirmDialog";
import LeaveRequestDecisionDialog from "../../../components/LeaveRequests/LeaveRequestDecisionDialog";
import { approveLeaveRequest, cancelLeaveRequest, createLeaveRequest, deleteLeaveRequest, getLeaveRequests, rejectLeaveRequest, submitLeaveRequest, updateLeaveRequest } from "../../../services/leaveRequestService";
import { getAllEmployees } from "../../../services/employeeService";
import { getLeaveTypes } from "../../../services/leaveTypeService";
import { getLeaveAllocations } from "../../../services/leaveAllocationService";
import "./HrLeaveRequests.css";

const statuses = ["draft", "pending", "approved", "rejected", "cancelled"];
const errorMessage = (error, fallback) => error.response?.data?.message || error.response?.data?.err || fallback;

function HrLeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    setLoading(true); setError("");
    try {
      const params = {};
      if (employeeFilter) params.employee_id = employeeFilter;
      if (statusFilter) params.status = statusFilter;
      const response = await getLeaveRequests(params);
      setRequests(Array.isArray(response?.data) ? response.data : []);
    } catch (requestError) { setError(errorMessage(requestError, "Unable to load leave requests.")); }
    finally { setLoading(false); }
  }, [employeeFilter, statusFilter]);

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true); setOptionsError("");
    try {
      const [users, types, allocationResponse] = await Promise.all([getAllEmployees(), getLeaveTypes(), getLeaveAllocations()]);
      setEmployees((Array.isArray(users) ? users : []).map((user) => user.employeeId).filter(Boolean).sort((a, b) => a.name_en.localeCompare(b.name_en)));
      setLeaveTypes(types);
      setAllocations(Array.isArray(allocationResponse?.data) ? allocationResponse.data : []);
    } catch (requestError) { setOptionsError(errorMessage(requestError, "Unable to load employees, leave types, and balances.")); }
    finally { setOptionsLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(loadRequests, 0); return () => window.clearTimeout(timer); }, [loadRequests]);
  useEffect(() => { const timer = window.setTimeout(loadOptions, 0); return () => window.clearTimeout(timer); }, [loadOptions]);

  function buildFormData(values, includeEmployee = false, shouldSubmit = false) {
    const data = new FormData();
    if (includeEmployee) { data.append("employee_id", values.employee_id); data.append("submit", String(shouldSubmit)); }
    data.append("leave_type_id", values.leave_type_id);
    data.append("is_half_day", String(values.is_half_day));
    if (values.is_half_day) data.append("half_day_date", values.half_day_date);
    else { data.append("from_date", values.from_date); data.append("to_date", values.to_date); }
    data.append("reason", values.reason.trim());
    if (values.document) data.append("document", values.document);
    return data;
  }

  async function submitCreate(values, shouldSubmit) {
    setSaving(true); setFormError("");
    try {
      await createLeaveRequest(buildFormData(values, true, shouldSubmit));
      setShowCreate(false); setSuccess(shouldSubmit ? "Leave request submitted successfully." : "Leave request saved as a draft.");
      await Promise.all([loadRequests(), loadOptions()]);
    } catch (requestError) { setFormError(errorMessage(requestError, "Unable to create the leave request.")); }
    finally { setSaving(false); }
  }

  async function submitEdit(values, shouldSubmit) {
    const currentType = editingRequest.leave_type_id?._id || editingRequest.leave_type_id;
    const data = buildFormData(values);
    if (values.leave_type_id === currentType) data.delete("leave_type_id");
    setSaving(true); setFormError("");
    try {
      await updateLeaveRequest(editingRequest._id, data);
      if (shouldSubmit) await submitLeaveRequest(editingRequest._id);
      setEditingRequest(null); setSuccess(shouldSubmit ? "Draft updated and submitted successfully." : "Draft updated successfully.");
      await Promise.all([loadRequests(), loadOptions()]);
    } catch (requestError) { setFormError(errorMessage(requestError, "Unable to update the leave request.")); }
    finally { setSaving(false); }
  }

  function openAction(type, request) { setPendingAction({ type, request }); setActionError(""); }

  async function runAction(note = "") {
    const { type, request } = pendingAction;
    setSaving(true); setActionError("");
    try {
      if (type === "submit") await submitLeaveRequest(request._id);
      if (type === "delete") await deleteLeaveRequest(request._id);
      if (type === "approve") await approveLeaveRequest(request._id);
      if (type === "reject") await rejectLeaveRequest(request._id, note);
      if (type === "cancel") await cancelLeaveRequest(request._id, note);
      setPendingAction(null);
      setSuccess({ submit: "Draft submitted successfully.", delete: "Draft deleted successfully.", approve: "Leave request approved successfully.", reject: "Leave request rejected successfully.", cancel: "Leave request cancelled successfully." }[type]);
      await Promise.all([loadRequests(), loadOptions()]);
    } catch (requestError) { setActionError(errorMessage(requestError, "Unable to update the leave request.")); }
    finally { setSaving(false); }
  }

  function renderActions(request) {
    if (request.status === "draft") return <><button type="button" onClick={() => { setFormError(""); setEditingRequest(request); }}>Edit</button><button type="button" onClick={() => openAction("submit", request)}>Submit</button><button type="button" className="request-danger-link" onClick={() => openAction("delete", request)}>Delete</button></>;
    if (request.status === "pending") return <><button type="button" onClick={() => openAction("approve", request)}>Approve</button><button type="button" className="request-danger-link" onClick={() => openAction("reject", request)}>Reject</button><button type="button" className="request-danger-link" onClick={() => openAction("cancel", request)}>Cancel</button></>;
    if (request.status === "approved") return <button type="button" className="request-danger-link" onClick={() => openAction("cancel", request)}>Cancel</button>;
    return null;
  }

  return <main className="hr-requests-page">
    <div className="hr-requests-header"><div><p className="hr-requests-eyebrow">LEAVE MANAGEMENT</p><h1>Leave Requests</h1><p>Review and manage leave requests across the organization.</p></div><button type="button" className="hr-request-primary" onClick={() => { setFormError(""); setShowCreate(true); }} disabled={optionsLoading || Boolean(optionsError)}>+ New request</button></div>
    {success && <div className="hr-requests-notice hr-requests-success" role="status"><span>{success}</span><button type="button" onClick={() => setSuccess("")} aria-label="Dismiss">×</button></div>}
    {optionsError && <div className="hr-requests-notice hr-requests-error" role="alert"><span>{optionsError}</span><button type="button" onClick={loadOptions}>Retry</button></div>}
    {error && <div className="hr-requests-notice hr-requests-error" role="alert"><span>{error}</span><button type="button" onClick={loadRequests}>Retry</button></div>}
    <section className="hr-requests-card">
      <div className="hr-requests-toolbar"><div><h2>Employee requests</h2>{!loading && !error && <span>{requests.length} {requests.length === 1 ? "request" : "requests"}</span>}</div><div className="hr-request-filters" aria-label="Leave request filters"><label><span>Employee</span><select value={employeeFilter} onChange={(event) => setEmployeeFilter(event.target.value)} disabled={Boolean(optionsError)}><option value="">All employees</option>{employees.map((item) => <option key={item._id} value={item._id}>{item.name_en} ({item.employee_code})</option>)}</select></label><label><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}</select></label>{(employeeFilter || statusFilter) && <button type="button" className="hr-clear-filters" onClick={() => { setEmployeeFilter(""); setStatusFilter(""); }}>Clear</button>}</div></div>
      {loading ? <div className="hr-requests-state" role="status"><span className="hr-requests-spinner" />Loading leave requests...</div> : !error && requests.length === 0 ? <div className="hr-requests-state"><strong>No leave requests found</strong><span>{employeeFilter || statusFilter ? "No requests match the selected filters." : "No employee leave requests are available."}</span></div> : !error && <LeaveRequestTable requests={requests} onView={(request) => setSelectedRequestId(request._id)} renderActions={renderActions} />}
    </section>
    {selectedRequestId && <LeaveRequestDetails requestId={selectedRequestId} onClose={() => setSelectedRequestId(null)} />}
    {showCreate && <LeaveRequestForm employees={employees} leaveTypes={leaveTypes} allocations={allocations} saving={saving} error={formError} onSubmit={submitCreate} onClose={() => !saving && setShowCreate(false)} />}
    {editingRequest && <LeaveRequestForm title="Edit draft request" employee={editingRequest.employee_id} leaveTypes={leaveTypes.some((item) => item._id === (editingRequest.leave_type_id?._id || editingRequest.leave_type_id)) ? leaveTypes : [...leaveTypes, editingRequest.leave_type_id]} allocations={allocations} initialRequest={editingRequest} saving={saving} error={formError} onSubmit={submitEdit} onClose={() => !saving && setEditingRequest(null)} />}
    {pendingAction?.type === "submit" && <LeaveRequestConfirmDialog title="Submit leave request?" message="This draft will be submitted to its assigned manager and can no longer be edited." confirmLabel="Submit request" saving={saving} error={actionError} onConfirm={runAction} onClose={() => !saving && setPendingAction(null)} />}
    {pendingAction?.type === "delete" && <LeaveRequestConfirmDialog title="Delete draft request?" message="This draft will be permanently deleted. This action cannot be undone." confirmLabel="Delete draft" danger saving={saving} error={actionError} onConfirm={runAction} onClose={() => !saving && setPendingAction(null)} />}
    {pendingAction?.type === "approve" && <LeaveRequestConfirmDialog title="Approve leave request?" message="Approving this request will deduct its total days from the employee's matching allocation." confirmLabel="Approve request" saving={saving} error={actionError} onConfirm={runAction} onClose={() => !saving && setPendingAction(null)} />}
    {pendingAction?.type === "reject" && <LeaveRequestDecisionDialog title="Reject leave request" message="Provide a decision note explaining why this request is being rejected." confirmLabel="Reject request" saving={saving} error={actionError} onConfirm={runAction} onClose={() => !saving && setPendingAction(null)} />}
    {pendingAction?.type === "cancel" && pendingAction.request.status === "pending" && <LeaveRequestConfirmDialog title="Cancel leave request?" message="This pending request will be cancelled and cannot be submitted again." confirmLabel="Cancel request" danger saving={saving} error={actionError} onConfirm={runAction} onClose={() => !saving && setPendingAction(null)} />}
    {pendingAction?.type === "cancel" && pendingAction.request.status === "approved" && <LeaveRequestDecisionDialog title="Cancel approved request" message="A reason is required. Cancelling this approved request will restore the deducted days to the employee's matching allocation." confirmLabel="Cancel request" saving={saving} error={actionError} onConfirm={runAction} onClose={() => !saving && setPendingAction(null)} />}
  </main>;
}

export default HrLeaveRequests;
