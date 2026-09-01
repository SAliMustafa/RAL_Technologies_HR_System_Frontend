import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { getHolidays, createHoliday, updateHoliday, deleteHoliday } from "../../services/holidayService";
import "./Holidays.css";

function errorMessage(error, fallback) {
  return error.response?.data?.message || error.response?.data?.error || fallback;
}

function formatDate(value) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function Holidays() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ date: "", description: "", is_confirmed: true });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const loadHolidays = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setHolidays(await getHolidays());
    } catch (requestError) {
      setError(errorMessage(requestError, t("holidays.errors.load")));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { loadHolidays(); }, [loadHolidays]);

  if (user?.role !== "hr_admin") return <Navigate to="/" replace />;

  function openCreate() {
    setEditing(null);
    setForm({ date: "", description: "", is_confirmed: true });
    setFormError("");
    setShowForm(true);
  }

  function openEdit(holiday) {
    setEditing(holiday);
    setForm({
      date: holiday.date ? holiday.date.slice(0, 10) : "",
      description: holiday.description || "",
      is_confirmed: Boolean(holiday.is_confirmed),
    });
    setFormError("");
    setShowForm(true);
  }

  function updateField(event) {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        await updateHoliday(editing._id, form);
        setSuccess(t("holidays.success.updated"));
      } else {
        await createHoliday(form);
        setSuccess(t("holidays.success.created"));
      }
      setShowForm(false);
      await loadHolidays();
    } catch (requestError) {
      setFormError(errorMessage(requestError, t("holidays.errors.save")));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(holiday) {
    try {
      await deleteHoliday(holiday._id);
      setSuccess(t("holidays.success.deleted"));
      await loadHolidays();
    } catch (requestError) {
      setError(errorMessage(requestError, t("holidays.errors.delete")));
    }
  }

  return (
    <main className="holidays-page">
      <div className="holidays-header">
        <div>
          <p className="page-eyebrow">{t("holidays.eyebrow")}</p>
          <h1>{t("holidays.title")}</h1>
          <p>{t("holidays.subtitle")}</p>
        </div>
        <button className="primary-button" onClick={openCreate}>{t("holidays.addButton")}</button>
      </div>

      {success && <div className="notice success-notice" role="status">{success}<button onClick={() => setSuccess("")}>×</button></div>}
      {error && <div className="notice error-notice" role="alert">{error}<button onClick={loadHolidays}>{t("holidays.retry")}</button></div>}

      <section className="holidays-card">
        {loading ? (
          <div className="table-state" role="status"><span className="spinner" />{t("holidays.loading")}</div>
        ) : !error && holidays.length === 0 ? (
          <div className="table-state"><strong>{t("holidays.emptyTitle")}</strong></div>
        ) : !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("holidays.columns.date")}</th>
                  <th>{t("holidays.columns.description")}</th>
                  <th>{t("holidays.columns.confirmed")}</th>
                  <th><span className="sr-only">{t("holidays.columns.actions")}</span></th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((holiday) => (
                  <tr key={holiday._id}>
                    <td>{formatDate(holiday.date)}</td>
                    <td><strong>{holiday.description}</strong></td>
                    <td>
                      <span className={`status-badge ${holiday.is_confirmed ? "status-present" : "status-half_day"}`}>
                        {holiday.is_confirmed ? t("holidays.confirmed") : t("holidays.unconfirmed")}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => openEdit(holiday)}>{t("holidays.actions.edit")}</button>
                        <button className="danger-link" onClick={() => handleDelete(holiday)}>{t("holidays.actions.delete")}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !saving && setShowForm(false)}>
          <section className="holidays-modal" role="dialog" aria-modal="true" aria-labelledby="holiday-form-title">
            <div className="modal-header">
              <div>
                <p className="page-eyebrow">{editing ? t("holidays.editEyebrow") : t("holidays.createEyebrow")}</p>
                <h2 id="holiday-form-title">{editing ? editing.description : t("holidays.addButton")}</h2>
              </div>
              <button className="close-button" onClick={() => setShowForm(false)} disabled={saving} aria-label={t("holidays.dismiss")}>×</button>
            </div>
            <form onSubmit={submitForm}>
              {formError && <div className="form-error" role="alert">{formError}</div>}
              <div className="form-grid">
                <label>{t("holidays.form.date")}
                  <input type="date" name="date" value={form.date} onChange={updateField} required />
                </label>
                <label className="full-field">{t("holidays.form.description")}
                  <input name="description" value={form.description} onChange={updateField} required />
                </label>
              </div>
              <fieldset className="checkbox-grid">
                <label>
                  <input type="checkbox" name="is_confirmed" checked={form.is_confirmed} onChange={updateField} />
                  {t("holidays.form.confirmed")}
                </label>
              </fieldset>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowForm(false)} disabled={saving}>
                  {t("holidays.form.cancel")}
                </button>
                <button className="primary-button" disabled={saving}>
                  {saving ? t("holidays.form.saving") : t("holidays.form.save")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default Holidays;