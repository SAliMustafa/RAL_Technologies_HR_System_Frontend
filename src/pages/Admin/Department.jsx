import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { getDepartments, createDepartment, updateDepartment } from "../../services/departmentService";
import "./Departments.css";

function errorMessage(error, fallback) {
  return error.response?.data?.message || error.response?.data?.error || fallback;
}

function Departments() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editing, setEditing] = useState(null); // null = create mode, object = edit mode
  const [form, setForm] = useState({ name: "", manager_id: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDepartments(await getDepartments());
    } catch (requestError) {
      setError(errorMessage(requestError, t("departments.errors.load")));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { loadDepartments(); }, [loadDepartments]);

  if (user?.role !== "hr_admin") return <Navigate to="/" replace />;

  function openCreate() {
    setEditing(null);
    setForm({ name: "", manager_id: "" });
    setFormError("");
    setShowForm(true);
  }

  function openEdit(department) {
    setEditing(department);
    setForm({ name: department.name || "", manager_id: department.manager_id || "" });
    setFormError("");
    setShowForm(true);
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        await updateDepartment(editing._id, form);
        setSuccess(t("departments.success.updated"));
      } else {
        await createDepartment(form);
        setSuccess(t("departments.success.created"));
      }
      setShowForm(false);
      await loadDepartments();
    } catch (requestError) {
      setFormError(errorMessage(requestError, t("departments.errors.save")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="departments-page">
      <div className="departments-header">
        <div>
          <p className="page-eyebrow">{t("departments.eyebrow")}</p>
          <h1>{t("departments.title")}</h1>
          <p>{t("departments.subtitle")}</p>
        </div>
        <button className="primary-button" onClick={openCreate}>{t("departments.addButton")}</button>
      </div>

      {success && <div className="notice success-notice" role="status">{success}<button onClick={() => setSuccess("")}>×</button></div>}
      {error && <div className="notice error-notice" role="alert">{error}<button onClick={loadDepartments}>{t("departments.retry")}</button></div>}

      <section className="departments-card">
        {loading ? (
          <div className="table-state" role="status"><span className="spinner" />{t("departments.loading")}</div>
        ) : !error && departments.length === 0 ? (
          <div className="table-state"><strong>{t("departments.emptyTitle")}</strong></div>
        ) : !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("departments.columns.name")}</th>
                  <th>{t("departments.columns.manager")}</th>
                  <th><span className="sr-only">{t("departments.columns.actions")}</span></th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept._id}>
                    <td><strong>{dept.name}</strong></td>
                    <td>{dept.manager_id || "--"}</td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => openEdit(dept)}>{t("departments.actions.edit")}</button>
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
          <section className="departments-modal" role="dialog" aria-modal="true" aria-labelledby="department-form-title">
            <div className="modal-header">
              <div>
                <p className="page-eyebrow">{editing ? t("departments.editEyebrow") : t("departments.createEyebrow")}</p>
                <h2 id="department-form-title">{editing ? editing.name : t("departments.addButton")}</h2>
              </div>
              <button className="close-button" onClick={() => setShowForm(false)} disabled={saving} aria-label={t("departments.dismiss")}>×</button>
            </div>
            <form onSubmit={submitForm}>
              {formError && <div className="form-error" role="alert">{formError}</div>}
              <div className="form-grid">
                <label className="full-field">{t("departments.form.name")}
                  <input name="name" value={form.name} onChange={updateField} required />
                </label>
                <label className="full-field">{t("departments.form.managerId")}
                  <input name="manager_id" value={form.manager_id} onChange={updateField} />
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowForm(false)} disabled={saving}>
                  {t("departments.form.cancel")}
                </button>
                <button className="primary-button" disabled={saving}>
                  {saving ? t("departments.form.saving") : t("departments.form.save")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default Departments;