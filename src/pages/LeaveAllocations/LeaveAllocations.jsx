import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  createLeaveAllocation,
  getLeaveAllocations,
} from "../../services/leaveAllocationService";
import { getAllEmployees } from "../../services/employeeService";
import { getLeaveTypes } from "../../services/leaveTypeService";
import "./LeaveAllocations.css";

const emptyCreateForm = {
  employee_id: "",
  leave_type_id: "",
  period_start: "",
  period_end: "",
  days_allocated: "",
  days_carried_forward: "0",
};

function getErrorMessage(error, fallback = "Unable to load leave allocations.") {
  return (
    error.response?.data?.message ||
    error.response?.data?.err ||
    fallback
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
  const [success, setSuccess] = useState("");
  const [createEmployees, setCreateEmployees] = useState([]);
  const [activeLeaveTypes, setActiveLeaveTypes] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

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

  const loadCreateOptions = useCallback(async () => {
    if (role !== "hr_admin") return;

    setOptionsLoading(true);
    setOptionsError("");
    try {
      const [users, leaveTypes] = await Promise.all([
        getAllEmployees(),
        getLeaveTypes(),
      ]);
      const employees = (Array.isArray(users) ? users : [])
        .map((record) => record.employeeId)
        .filter(Boolean)
        .sort((first, second) => first.name_en.localeCompare(second.name_en));

      setCreateEmployees(employees);
      setActiveLeaveTypes(leaveTypes);
    } catch (requestError) {
      setOptionsError(
        getErrorMessage(requestError, "Unable to load employees and leave types."),
      );
    } finally {
      setOptionsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    const request = window.setTimeout(loadAllocations, 0);
    return () => window.clearTimeout(request);
  }, [loadAllocations]);

  useEffect(() => {
    if (role !== "hr_admin") return undefined;
    const request = window.setTimeout(loadCreateOptions, 0);
    return () => window.clearTimeout(request);
  }, [loadCreateOptions, role]);

  const selectedLeaveType = activeLeaveTypes.find(
    (leaveType) => leaveType._id === createForm.leave_type_id,
  );

  function openCreateModal() {
    setCreateForm(emptyCreateForm);
    setFormError("");
    setShowCreate(true);
  }

  function updateCreateField(event) {
    const { name, value } = event.target;
    setCreateForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "leave_type_id" ? { days_carried_forward: "0" } : {}),
    }));
  }

  function validateCreateForm() {
    if (!createForm.employee_id) return "Employee is required.";
    if (!createForm.leave_type_id) return "Leave type is required.";
    if (!createForm.period_start || !createForm.period_end) return "Allocation start and end dates are required.";
    if (createForm.period_end <= createForm.period_start) return "Period end must be after period start.";
    if (createForm.days_allocated === "" || Number(createForm.days_allocated) < 0) return "Days allocated must be zero or greater.";
    if (createForm.days_carried_forward === "" || Number(createForm.days_carried_forward) < 0) return "Days carried forward must be zero or greater.";
    if (selectedLeaveType && Number(createForm.days_allocated) > selectedLeaveType.max_days_per_year) return `Days allocated cannot exceed ${selectedLeaveType.max_days_per_year}.`;
    if (selectedLeaveType && !selectedLeaveType.carry_forward && Number(createForm.days_carried_forward) > 0) return "This leave type does not allow carried-forward days.";
    if (selectedLeaveType?.max_carry_forward != null && Number(createForm.days_carried_forward) > selectedLeaveType.max_carry_forward) return `Carried-forward days cannot exceed ${selectedLeaveType.max_carry_forward}.`;
    return "";
  }

  async function submitCreate(event) {
    event.preventDefault();
    const validationError = validateCreateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      await createLeaveAllocation({
        ...createForm,
        days_allocated: Number(createForm.days_allocated),
        days_carried_forward: Number(createForm.days_carried_forward),
      });
      setShowCreate(false);
      setSuccess("Leave allocation created successfully.");
      await loadAllocations();
    } catch (requestError) {
      setFormError(
        getErrorMessage(requestError, "Unable to create the leave allocation."),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="allocations-page">
      <div className="allocations-header">
        <div>
          <p className="allocations-eyebrow">LEAVE MANAGEMENT</p>
          <h1>Leave Allocations</h1>
          <p>View allocated leave and remaining balances.</p>
        </div>
        {role === "hr_admin" && (
          <button
            type="button"
            className="allocation-primary-button"
            onClick={openCreateModal}
            disabled={optionsLoading || Boolean(optionsError)}
          >
            + Add allocation
          </button>
        )}
      </div>

      {success && (
        <div className="allocations-notice allocations-success" role="status">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess("")} aria-label="Dismiss">×</button>
        </div>
      )}

      {role === "hr_admin" && optionsError && (
        <div className="allocations-notice allocations-error" role="alert">
          <span>{optionsError}</span>
          <button type="button" onClick={loadCreateOptions}>Retry</button>
        </div>
      )}

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

      {showCreate && role === "hr_admin" && (
        <div
          className="allocation-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) setShowCreate(false);
          }}
        >
          <section
            className="allocation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-allocation-title"
          >
            <div className="allocation-modal-header">
              <div>
                <p className="allocations-eyebrow">NEW</p>
                <h2 id="create-allocation-title">Create leave allocation</h2>
              </div>
              <button
                type="button"
                className="allocation-close-button"
                onClick={() => setShowCreate(false)}
                disabled={saving}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={submitCreate}>
              {formError && <div className="allocation-form-error" role="alert">{formError}</div>}
              <div className="allocation-form-grid">
                <label>
                  Employee <span>*</span>
                  <select name="employee_id" value={createForm.employee_id} onChange={updateCreateField} required>
                    <option value="">Select employee</option>
                    {createEmployees.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.name_en} ({employee.employee_code})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Leave type <span>*</span>
                  <select name="leave_type_id" value={createForm.leave_type_id} onChange={updateCreateField} required>
                    <option value="">Select leave type</option>
                    {activeLeaveTypes.map((leaveType) => (
                      <option key={leaveType._id} value={leaveType._id}>{leaveType.leave_type_name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Period start <span>*</span>
                  <input type="date" name="period_start" value={createForm.period_start} onChange={updateCreateField} required />
                </label>
                <label>
                  Period end <span>*</span>
                  <input type="date" name="period_end" value={createForm.period_end} onChange={updateCreateField} min={createForm.period_start || undefined} required />
                </label>
                <label>
                  Days allocated <span>*</span>
                  <input type="number" name="days_allocated" value={createForm.days_allocated} onChange={updateCreateField} min="0" step="0.5" required />
                  {selectedLeaveType && <small>Annual maximum: {selectedLeaveType.max_days_per_year} days</small>}
                </label>
                <label>
                  Days carried forward
                  <input type="number" name="days_carried_forward" value={createForm.days_carried_forward} onChange={updateCreateField} min="0" step="0.5" disabled={selectedLeaveType && !selectedLeaveType.carry_forward} />
                  {selectedLeaveType && (
                    <small>
                      {selectedLeaveType.carry_forward
                        ? `Allowed${selectedLeaveType.max_carry_forward != null ? `, maximum ${selectedLeaveType.max_carry_forward}` : ""}`
                        : "Not allowed for this leave type"}
                    </small>
                  )}
                </label>
              </div>
              <div className="allocation-modal-actions">
                <button type="button" className="allocation-secondary-button" onClick={() => setShowCreate(false)} disabled={saving}>Cancel</button>
                <button type="submit" className="allocation-primary-button" disabled={saving}>{saving ? "Creating..." : "Create allocation"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default LeaveAllocations;
