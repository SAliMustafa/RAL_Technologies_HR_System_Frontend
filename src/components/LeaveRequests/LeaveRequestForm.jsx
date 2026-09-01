import { useMemo, useState } from "react";
import "./LeaveRequests.css";

const allowedFileTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxFileSize = 5 * 1024 * 1024;

function toDateInput(value) {
  return value ? String(value).slice(0, 10) : "";
}

function LeaveRequestForm({
  title = "Create leave request",
  employee,
  leaveTypes,
  allocations,
  initialRequest = null,
  saving,
  error,
  onSubmit,
  onClose,
}) {
  const [values, setValues] = useState({
    leave_type_id: initialRequest?.leave_type_id?._id || initialRequest?.leave_type_id || "",
    is_half_day: Boolean(initialRequest?.is_half_day),
    from_date: toDateInput(initialRequest?.from_date),
    to_date: toDateInput(initialRequest?.to_date),
    half_day_date: toDateInput(initialRequest?.half_day_date),
    reason: initialRequest?.reason || "",
    document: null,
  });
  const [validationError, setValidationError] = useState("");

  const selectedLeaveType = leaveTypes.find(
    (leaveType) => leaveType._id === values.leave_type_id,
  );

  const applicableAllocation = useMemo(() => {
    const start = values.is_half_day ? values.half_day_date : values.from_date;
    const end = values.is_half_day ? values.half_day_date : values.to_date;
    if (!values.leave_type_id || !start || !end) return null;

    return allocations.find((allocation) => {
      const leaveTypeId = allocation.leave_type_id?._id || allocation.leave_type_id;
      return leaveTypeId === values.leave_type_id &&
        toDateInput(allocation.period_start) <= start &&
        toDateInput(allocation.period_end) >= end;
    }) || null;
  }, [allocations, values.from_date, values.half_day_date, values.is_half_day, values.leave_type_id, values.to_date]);

  function updateField(event) {
    const { name, type, checked, value, files } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] || null : value,
    }));
    setValidationError("");
  }

  function validate() {
    if (!values.leave_type_id) return "Leave type is required.";
    if (values.is_half_day && !values.half_day_date) return "Half-day date is required.";
    if (!values.is_half_day && (!values.from_date || !values.to_date)) return "From and to dates are required.";
    if (!values.is_half_day && values.to_date < values.from_date) return "To date cannot be before from date.";
    if (values.document && !allowedFileTypes.includes(values.document.type)) return "Only PDF, JPG, and PNG files are allowed.";
    if (values.document && values.document.size > maxFileSize) return "The supporting document must not exceed 5 MB.";
    return "";
  }

  function handleSubmit(shouldSubmit) {
    const message = validate();
    if (message) {
      setValidationError(message);
      return;
    }
    onSubmit(values, shouldSubmit);
  }

  const remaining = applicableAllocation
    ? Number(applicableAllocation.days_allocated || 0) +
      Number(applicableAllocation.days_carried_forward || 0) -
      Number(applicableAllocation.days_taken || 0)
    : null;

  return (
    <div
      className="request-modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}
    >
      <section className="request-form-modal" role="dialog" aria-modal="true" aria-labelledby="request-form-title">
        <div className="request-modal-header">
          <div>
            <p>LEAVE REQUEST</p>
            <h2 id="request-form-title">{title}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close">×</button>
        </div>

        <form onSubmit={(event) => event.preventDefault()}>
          {(validationError || error) && (
            <div className="request-form-error" role="alert">{validationError || error}</div>
          )}

          <div className="request-form-grid">
            <label>
              Employee
              <input value={employee?.name_en || "Unknown employee"} disabled readOnly />
            </label>
            <label>
              Leave type <span>*</span>
              <select name="leave_type_id" value={values.leave_type_id} onChange={updateField} required>
                <option value="">Select leave type</option>
                {leaveTypes.map((leaveType) => (
                  <option key={leaveType._id} value={leaveType._id}>{leaveType.leave_type_name}</option>
                ))}
              </select>
              {selectedLeaveType?.requires_document && <small>A supporting document is required when submitting.</small>}
            </label>
          </div>

          <label className="request-half-day-toggle">
            <input type="checkbox" name="is_half_day" checked={values.is_half_day} onChange={updateField} />
            Request a half day
          </label>

          <div className="request-form-grid">
            {values.is_half_day ? (
              <label className="request-form-full">
                Half-day date <span>*</span>
                <input type="date" name="half_day_date" value={values.half_day_date} onChange={updateField} required />
              </label>
            ) : (
              <>
                <label>
                  From date <span>*</span>
                  <input type="date" name="from_date" value={values.from_date} onChange={updateField} required />
                </label>
                <label>
                  To date <span>*</span>
                  <input type="date" name="to_date" value={values.to_date} onChange={updateField} min={values.from_date || undefined} required />
                </label>
              </>
            )}
            <label className="request-form-full">
              Reason
              <textarea name="reason" value={values.reason} onChange={updateField} maxLength="1000" rows="4" placeholder="Optional reason for the request" />
              <small>{values.reason.length}/1000 characters</small>
            </label>
            <label className="request-form-full">
              Supporting document
              <input type="file" name="document" onChange={updateField} accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" />
              <small>
                {initialRequest?.document
                  ? "A document is already attached. Choose a file only to replace it."
                  : "PDF, JPG, or PNG up to 5 MB."}
              </small>
            </label>
          </div>

          {values.leave_type_id && (
            <div className={`request-balance-note ${applicableAllocation ? "" : "request-balance-missing"}`}>
              {applicableAllocation
                ? `Available balance for this period: ${remaining} day(s).`
                : "Select dates covered by an allocation to see the available balance."}
            </div>
          )}

          <div className="request-form-actions">
            <button type="button" className="request-secondary-button" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="button" className="request-secondary-button" onClick={() => handleSubmit(false)} disabled={saving}>{saving ? "Saving..." : "Save as draft"}</button>
            <button type="button" className="request-primary-button" onClick={() => handleSubmit(true)} disabled={saving}>{saving ? "Submitting..." : "Submit now"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default LeaveRequestForm;
