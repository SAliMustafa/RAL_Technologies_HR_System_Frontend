import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import {
  createLeaveType,
  deactivateLeaveType,
  getLeaveTypes,
  updateLeaveType,
} from "../../services/leaveTypeService";
import "./LeaveTypes.css";

const emptyForm = {
  leave_type_name: "",
  max_days_per_year: "",
  pay_fraction: "1",
  requires_service_months: "0",
  requires_document: false,
  carry_forward: false,
  max_carry_forward: "",
  counts_toward_service: true,
  once_per_lifetime: false,
  gender_restriction: "",
  next_leave_type_id: "",
};

function errorMessage(error, fallback) {
  return error.response?.data?.message || error.response?.data?.err || fallback;
}

function LeaveTypes() {
  const { user } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(null);

  const loadLeaveTypes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setLeaveTypes(await getLeaveTypes(includeInactive));
    } catch (requestError) {
      setError(errorMessage(requestError, "Unable to load leave types."));
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    const request = window.setTimeout(loadLeaveTypes, 0);
    return () => window.clearTimeout(request);
  }, [loadLeaveTypes]);

  if (user?.role !== "hr_admin") return <Navigate to="/" replace />;

  function openCreate() {
    setEditing({});
    setForm(emptyForm);
    setFormError("");
  }

  function openEdit(leaveType) {
    setEditing(leaveType);
    setForm({
      leave_type_name: leaveType.leave_type_name ?? "",
      max_days_per_year: String(leaveType.max_days_per_year ?? ""),
      pay_fraction: String(leaveType.pay_fraction ?? ""),
      requires_service_months: String(leaveType.requires_service_months ?? 0),
      requires_document: Boolean(leaveType.requires_document),
      carry_forward: Boolean(leaveType.carry_forward),
      max_carry_forward: leaveType.max_carry_forward == null ? "" : String(leaveType.max_carry_forward),
      counts_toward_service: Boolean(leaveType.counts_toward_service),
      once_per_lifetime: Boolean(leaveType.once_per_lifetime),
      gender_restriction: leaveType.gender_restriction ?? "",
      next_leave_type_id: leaveType.next_leave_type_id?._id ?? leaveType.next_leave_type_id ?? "",
    });
    setFormError("");
  }

  function updateField(event) {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  function validate() {
    if (!form.leave_type_name.trim()) return "Leave type name is required.";
    if (form.max_days_per_year === "" || Number(form.max_days_per_year) < 0) return "Maximum days must be zero or greater.";
    if (form.pay_fraction === "" || Number(form.pay_fraction) < 0 || Number(form.pay_fraction) > 1) return "Pay fraction must be between 0 and 1.";
    if (form.requires_service_months === "" || Number(form.requires_service_months) < 0) return "Required service months must be zero or greater.";
    if (form.max_carry_forward !== "" && Number(form.max_carry_forward) < 0) return "Maximum carry forward must be zero or greater.";
    return "";
  }

  async function submit(event) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = {
      ...form,
      leave_type_name: form.leave_type_name.trim(),
      max_days_per_year: Number(form.max_days_per_year),
      pay_fraction: Number(form.pay_fraction),
      requires_service_months: Number(form.requires_service_months),
      max_carry_forward: form.max_carry_forward === "" ? null : Number(form.max_carry_forward),
      gender_restriction: form.gender_restriction || null,
      next_leave_type_id: form.next_leave_type_id || null,
    };

    setSaving(true);
    setFormError("");
    try {
      if (editing._id) {
        await updateLeaveType(editing._id, payload);
        setSuccess("Leave type updated successfully.");
      } else {
        await createLeaveType(payload);
        setSuccess("Leave type created successfully.");
      }
      setEditing(null);
      await loadLeaveTypes();
    } catch (requestError) {
      setFormError(errorMessage(requestError, "Unable to save the leave type."));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeactivate() {
    setSaving(true);
    setError("");
    try {
      await deactivateLeaveType(deactivating._id);
      setSuccess("Leave type deactivated successfully.");
      setDeactivating(null);
      await loadLeaveTypes();
    } catch (requestError) {
      setDeactivating(null);
      setError(errorMessage(requestError, "Unable to deactivate the leave type."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="leave-types-page">
      <div className="leave-types-header">
        <div>
          <p className="page-eyebrow">LEAVE MANAGEMENT</p>
          <h1>Leave Types</h1>
          <p>Configure leave rules and eligibility for employees.</p>
        </div>
        <button className="primary-button" onClick={openCreate}>+ Add leave type</button>
      </div>

      {success && <div className="notice success-notice" role="status">{success}<button onClick={() => setSuccess("")} aria-label="Dismiss">×</button></div>}
      {error && <div className="notice error-notice" role="alert">{error}<button onClick={loadLeaveTypes}>Retry</button></div>}

      <section className="leave-types-card">
        <div className="table-toolbar">
          <div>
            <h2>Available leave types</h2>
            <span>{leaveTypes.length} {leaveTypes.length === 1 ? "type" : "types"}</span>
          </div>
          <label className="filter-toggle">
            <input type="checkbox" checked={includeInactive} onChange={(event) => setIncludeInactive(event.target.checked)} />
            Include inactive
          </label>
        </div>

        {loading ? (
          <div className="table-state" role="status"><span className="spinner" />Loading leave types...</div>
        ) : !error && leaveTypes.length === 0 ? (
          <div className="table-state"><strong>No leave types found</strong><span>Create the first leave type to get started.</span></div>
        ) : !error && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Annual allowance</th><th>Pay</th><th>Eligibility & rules</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {leaveTypes.map((leaveType) => (
                  <tr key={leaveType._id}>
                    <td><strong>{leaveType.leave_type_name}</strong>{leaveType.next_leave_type_id && <small>Then: {leaveType.next_leave_type_id.leave_type_name}</small>}</td>
                    <td>{leaveType.max_days_per_year} days</td>
                    <td>{Math.round(leaveType.pay_fraction * 100)}%</td>
                    <td><div className="rule-tags">
                      {leaveType.requires_document && <span>Document</span>}
                      {leaveType.carry_forward && <span>Carry forward{leaveType.max_carry_forward != null ? `: ${leaveType.max_carry_forward}` : ""}</span>}
                      {leaveType.requires_service_months > 0 && <span>{leaveType.requires_service_months} mo. service</span>}
                      {leaveType.gender_restriction && <span className="capitalize">{leaveType.gender_restriction}</span>}
                      {leaveType.once_per_lifetime && <span>Once only</span>}
                      {!leaveType.requires_document && !leaveType.carry_forward && !leaveType.requires_service_months && !leaveType.gender_restriction && !leaveType.once_per_lifetime && <span className="muted-tag">Standard</span>}
                    </div></td>
                    <td><span className={`status-badge ${leaveType.is_active ? "active" : "inactive"}`}>{leaveType.is_active ? "Active" : "Inactive"}</span></td>
                    <td><div className="row-actions"><button onClick={() => openEdit(leaveType)}>Edit</button>{leaveType.is_active && <button className="danger-link" onClick={() => setDeactivating(leaveType)}>Deactivate</button>}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !saving && setEditing(null)}>
        <section className="leave-modal" role="dialog" aria-modal="true" aria-labelledby="leave-form-title">
          <div className="modal-header"><div><p className="page-eyebrow">{editing._id ? "EDIT" : "NEW"}</p><h2 id="leave-form-title">{editing._id ? "Edit leave type" : "Create leave type"}</h2></div><button className="close-button" onClick={() => setEditing(null)} disabled={saving} aria-label="Close">×</button></div>
          <form onSubmit={submit}>
            {formError && <div className="form-error" role="alert">{formError}</div>}
            <div className="form-grid">
              <label className="full-field">Leave type name <span>*</span><input name="leave_type_name" value={form.leave_type_name} onChange={updateField} maxLength="100" required /></label>
              <label>Maximum days per year <span>*</span><input type="number" name="max_days_per_year" value={form.max_days_per_year} onChange={updateField} min="0" step="0.5" required /></label>
              <label>Pay fraction <span>*</span><input type="number" name="pay_fraction" value={form.pay_fraction} onChange={updateField} min="0" max="1" step="0.01" required /><small>0 = unpaid, 1 = fully paid</small></label>
              <label>Required service (months)<input type="number" name="requires_service_months" value={form.requires_service_months} onChange={updateField} min="0" step="1" /></label>
              <label>Maximum carry forward<input type="number" name="max_carry_forward" value={form.max_carry_forward} onChange={updateField} min="0" step="0.5" disabled={!form.carry_forward} placeholder="No maximum" /></label>
              <label>Gender restriction<select name="gender_restriction" value={form.gender_restriction} onChange={updateField}><option value="">None</option><option value="maternity">Maternity</option><option value="paternity">Paternity</option></select></label>
              <label>Next leave type<select name="next_leave_type_id" value={form.next_leave_type_id} onChange={updateField}><option value="">None</option>{leaveTypes.filter((item) => item._id !== editing._id && item.is_active).map((item) => <option key={item._id} value={item._id}>{item.leave_type_name}</option>)}</select></label>
            </div>
            <fieldset className="checkbox-grid"><legend>Leave rules</legend>
              <label><input type="checkbox" name="requires_document" checked={form.requires_document} onChange={updateField} /> Requires document</label>
              <label><input type="checkbox" name="carry_forward" checked={form.carry_forward} onChange={updateField} /> Allow carry forward</label>
              <label><input type="checkbox" name="counts_toward_service" checked={form.counts_toward_service} onChange={updateField} /> Counts toward service</label>
              <label><input type="checkbox" name="once_per_lifetime" checked={form.once_per_lifetime} onChange={updateField} /> Once per lifetime</label>
            </fieldset>
            <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setEditing(null)} disabled={saving}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving..." : editing._id ? "Save changes" : "Create leave type"}</button></div>
          </form>
        </section>
      </div>}

      {deactivating && <div className="modal-backdrop"><section className="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="deactivate-title"><div className="warning-icon">!</div><h2 id="deactivate-title">Deactivate leave type?</h2><p><strong>{deactivating.leave_type_name}</strong> will no longer be available for new leave activity. Existing records are not deleted.</p><div className="modal-actions"><button className="secondary-button" onClick={() => setDeactivating(null)} disabled={saving}>Cancel</button><button className="danger-button" onClick={confirmDeactivate} disabled={saving}>{saving ? "Deactivating..." : "Deactivate"}</button></div></section></div>}
    </main>
  );
}

export default LeaveTypes;
