import { useCallback, useEffect, useState } from "react"
import { Navigate } from "react-router"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../context/AuthContext"
import {
  getAllAttendance,
  getAllTodayAttendance,
  updateAttendanceRecord,
  lockAttendanceRecord,
} from "../../services/attendanceService"
import "./AttendanceManagement.css"


const STATUS_OPTIONS = ["present", "absent", "half_day", "on_leave", "holiday", "weekly_off"]


function errorMessage(error, fallback) {
  return error.response?.data?.message || error.response?.data?.error || fallback;
}

function formatDate(value) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("en-GB");
}

function formatTime(value) {
  if (!value) return "--"
  return new Date(value).toLocaleTimeString("en-BH", { hour: "2-digit", minute: "2-digit" })
}

function formatStatus(status) {
  const names = {
    present: "Present", absent: "Absent", half_day: "Half Day",
    on_leave: "On Leave", holiday: "Holiday", weekly_off: "Weekly Off",
  }
  return names[status] || status || "--"
}

function employeeLabel(employee) {
  if (!employee || typeof employee === "string") return employee || "--";
  return `${employee.name_en || "--"} (${employee.employee_code || "--"})`;
}

function AttendanceManagement() {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { t } = useTranslation();

  const [showTodayOnly, setShowTodayOnly] = useState(false)
  const [filters, setFilters] = useState({ status: "", employee_id: "", date: "" })

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (showTodayOnly) {
        setAttendance(await getAllTodayAttendance());
      } else {
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== "")
        )
        setAttendance(await getAllAttendance(cleanFilters))
      }
    } catch (requestError) {
      setError(errorMessage(requestError, "Unable to load attendance."))
    } finally {
      setLoading(false)
    }
    
  }, [showTodayOnly, filters])

  useEffect(() => {
    const request = window.setTimeout(loadAttendance, 0)
    return () => window.clearTimeout(request)
  }, [loadAttendance]);

  if (user?.role !== "hr_admin") return <Navigate to="/" replace />

  function openCorrect(record) {
    setEditing(record);
    setForm({
      status: record.status || "",
      in_time: record.in_time ? new Date(record.in_time).toISOString().slice(0, 16) : "",
      out_time: record.out_time ? new Date(record.out_time).toISOString().slice(0, 16) : "",
      is_late_entry: Boolean(record.is_late_entry),
      is_early_exit: Boolean(record.is_early_exit),
      is_incomplete: Boolean(record.is_incomplete),
      correction_reason: "",
    });
    setFormError("")
  }

  function updateField(event) {
    const { name, type, checked, value } = event.target
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }))
  }

  async function submitCorrection(event) {
    event.preventDefault()
    if (!form.correction_reason.trim()) {
      setFormError("Correction reason is required.")
      return
    }

     setSaving(true)
    setFormError("")
    try {
      await updateAttendanceRecord(editing._id, {
        ...form,
        in_time: form.in_time ? new Date(form.in_time).toISOString() : undefined,
        out_time: form.out_time ? new Date(form.out_time).toISOString() : undefined,
      })
      setSuccess("Attendance record corrected successfully.")
      setEditing(null)
      await loadAttendance()
    } catch (requestError) {
      setFormError(errorMessage(requestError, "Unable to save the correction."))
    } finally {
      setSaving(false)
    }
  }



   async function handleLock(record) {
    try {
      await lockAttendanceRecord(record._id)
      setSuccess("Attendance record locked.")
      await loadAttendance();
    } catch (requestError) {
      setError(errorMessage(requestError, "Unable to lock this record."))
    }
  }


  return (
    <main className="attendance-management-page">
      <div className="attendance-header">
        <div>
          <p className="page-eyebrow">{t("attendanceManagement.eyebrow")}</p>
          <h1>{t("attendanceManagement.title")}</h1>
          <p>{t("attendanceManagement.subtitle")}</p>
        </div>
      </div>

      {success && (
        <div className="notice success-notice" role="status">
          {success}
          <button onClick={() => setSuccess("")} aria-label={t("attendanceManagement.dismiss")}>×</button>
        </div>
      )}
      {error && (
        <div className="notice error-notice" role="alert">
          {error}
          <button onClick={loadAttendance}>{t("attendanceManagement.retry")}</button>
        </div>
      )}

      <section className="attendance-card">
        <div className="table-toolbar attendance-toolbar">
          <div>
            <h2>{t("attendanceManagement.recordsHeading")}</h2>
            <span>{t("attendanceManagement.recordCount", { count: attendance.length })}</span>
          </div>

          <div className="attendance-filters">
            <label className="filter-toggle">
              <input
                type="checkbox"
                checked={showTodayOnly}
                onChange={(e) => setShowTodayOnly(e.target.checked)}
              />
              {t("attendanceManagement.todayOnly")}
            </label>

            {!showTodayOnly && (
              <>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">{t("attendanceManagement.allStatuses")}</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{t(`attendanceManagement.statusValues.${s}`)}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                />

                <input
                  type="text"
                  placeholder={t("attendanceManagement.employeeIdPlaceholder")}
                  value={filters.employee_id}
                  onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })}
                />

                <button className="secondary-button" onClick={loadAttendance}>
                  {t("attendanceManagement.filter")}
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="table-state" role="status">
            <span className="spinner" />{t("attendanceManagement.loading")}
          </div>
        ) : !error && attendance.length === 0 ? (
          <div className="table-state">
            <strong>{t("attendanceManagement.emptyTitle")}</strong>
            <span>{t("attendanceManagement.emptySubtitle")}</span>
          </div>
        ) : !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("attendanceManagement.columns.employee")}</th>
                  <th>{t("attendanceManagement.columns.date")}</th>
                  <th>{t("attendanceManagement.columns.status")}</th>
                  <th>{t("attendanceManagement.columns.in")}</th>
                  <th>{t("attendanceManagement.columns.out")}</th>
                  <th>{t("attendanceManagement.columns.flags")}</th>
                  <th><span className="sr-only">{t("attendanceManagement.columns.actions")}</span></th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record._id}>
                    <td><strong>{employeeLabel(record.employee_id)}</strong></td>
                    <td>{formatDate(record.date)}</td>
                    <td>
                      <span className={`status-badge status-${record.status}`}>
                        {t(`attendanceManagement.statusValues.${record.status}`)}
                      </span>
                    </td>
                    <td>{formatTime(record.in_time)}</td>
                    <td>{formatTime(record.out_time)}</td>
                    <td>
                      <div className="rule-tags">
                        {record.is_late_entry && <span>{t("attendanceManagement.flags.late")}</span>}
                        {record.is_early_exit && <span>{t("attendanceManagement.flags.earlyExit")}</span>}
                        {record.is_incomplete && <span>{t("attendanceManagement.flags.incomplete")}</span>}
                        {record.is_corrected && <span>{t("attendanceManagement.flags.corrected")}</span>}
                        {record.locked && <span className="muted-tag">{t("attendanceManagement.flags.locked")}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => openCorrect(record)} disabled={record.locked}>
                          {t("attendanceManagement.actions.correct")}
                        </button>
                        {!record.locked && (
                          <button className="danger-link" onClick={() => handleLock(record)}>
                            {t("attendanceManagement.actions.lock")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !saving && setEditing(null)}>
          <section className="attendance-modal" role="dialog" aria-modal="true" aria-labelledby="correction-title">
            <div className="modal-header">
              <div>
                <p className="page-eyebrow">{t("attendanceManagement.correctEyebrow")}</p>
                <h2 id="correction-title">{employeeLabel(editing.employee_id)} — {formatDate(editing.date)}</h2>
              </div>
              <button className="close-button" onClick={() => setEditing(null)} disabled={saving} aria-label={t("attendanceManagement.dismiss")}>×</button>
            </div>
            <form onSubmit={submitCorrection}>
              {formError && <div className="form-error" role="alert">{formError}</div>}
              <div className="form-grid">
                <label>{t("attendanceManagement.modal.status")}
                  <select name="status" value={form.status} onChange={updateField}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{t(`attendanceManagement.statusValues.${s}`)}</option>
                    ))}
                  </select>
                </label>
                <label>{t("attendanceManagement.modal.inTime")}
                  <input type="datetime-local" name="in_time" value={form.in_time} onChange={updateField} />
                </label>
                <label>{t("attendanceManagement.modal.outTime")}
                  <input type="datetime-local" name="out_time" value={form.out_time} onChange={updateField} />
                </label>
                <label className="full-field">{t("attendanceManagement.modal.reason")} <span>*</span>
                  <input name="correction_reason" value={form.correction_reason} onChange={updateField} required />
                </label>
              </div>
              <fieldset className="checkbox-grid">
                <legend>{t("attendanceManagement.modal.flagsLegend")}</legend>
                <label><input type="checkbox" name="is_late_entry" checked={form.is_late_entry} onChange={updateField} /> {t("attendanceManagement.flags.late")}</label>
                <label><input type="checkbox" name="is_early_exit" checked={form.is_early_exit} onChange={updateField} /> {t("attendanceManagement.flags.earlyExit")}</label>
                <label><input type="checkbox" name="is_incomplete" checked={form.is_incomplete} onChange={updateField} /> {t("attendanceManagement.flags.incomplete")}</label>
              </fieldset>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setEditing(null)} disabled={saving}>
                  {t("attendanceManagement.modal.cancel")}
                </button>
                <button className="primary-button" disabled={saving}>
                  {saving ? t("attendanceManagement.modal.saving") : t("attendanceManagement.modal.save")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default AttendanceManagement;