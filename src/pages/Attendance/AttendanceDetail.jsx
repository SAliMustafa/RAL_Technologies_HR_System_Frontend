import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { getAttendanceById } from "../../services/attendanceService";
import "./AttendanceDetail.css";

function errorMessage(error, fallback) {
  return error.response?.data?.message || error.response?.data?.error || fallback;
}

function formatDateTime(value) {
  if (!value) return "--";
  return new Date(value).toLocaleString("en-GB");
}

function formatDate(value) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("en-GB");
}

function yesNo(t, value) {
  return value ? t("attendanceDetail.yes") : t("attendanceDetail.no");
}

function AttendanceDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        setRecord(await getAttendanceById(id));
      } catch (requestError) {
        setError(errorMessage(requestError, t("attendanceDetail.errors.load")));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, t]);

  if (loading) {
    return <main className="attendance-detail-page"><div className="table-state" role="status"><span className="spinner" />{t("attendanceDetail.loading")}</div></main>;
  }

  if (error) {
    return (
      <main className="attendance-detail-page">
        <div className="notice error-notice" role="alert">{error}</div>
        <button className="secondary-button" onClick={() => navigate(-1)}>{t("attendanceDetail.back")}</button>
      </main>
    );
  }

  const employee = typeof record.employee_id === "object" ? record.employee_id : null;

  return (
    <main className="attendance-detail-page">
      <div className="attendance-detail-header">
        <p className="page-eyebrow">{t("attendanceDetail.eyebrow")}</p>
        <h1>{employee ? `${employee.name_en} (${employee.employee_code})` : t("attendanceDetail.title")}</h1>
        <p>{formatDate(record.date)}</p>
      </div>

      <section className="attendance-detail-card">
        <dl className="detail-grid">
          <div><dt>{t("attendanceDetail.fields.status")}</dt><dd><span className={`status-badge status-${record.status}`}>{record.status || "--"}</span></dd></div>
          <div><dt>{t("attendanceDetail.fields.date")}</dt><dd>{formatDate(record.date)}</dd></div>
          <div><dt>{t("attendanceDetail.fields.inTime")}</dt><dd>{formatDateTime(record.in_time)}</dd></div>
          <div><dt>{t("attendanceDetail.fields.outTime")}</dt><dd>{formatDateTime(record.out_time)}</dd></div>
          <div><dt>{t("attendanceDetail.fields.workedHours")}</dt><dd>{record.worked_hours ?? 0}</dd></div>
          <div><dt>{t("attendanceDetail.fields.lateEntry")}</dt><dd>{yesNo(t, record.is_late_entry)}</dd></div>
          <div><dt>{t("attendanceDetail.fields.earlyExit")}</dt><dd>{yesNo(t, record.is_early_exit)}</dd></div>
          <div><dt>{t("attendanceDetail.fields.incomplete")}</dt><dd>{yesNo(t, record.is_incomplete)}</dd></div>
          <div><dt>{t("attendanceDetail.fields.leaveRequest")}</dt><dd>{record.leave_request_id || "--"}</dd></div>
          <div><dt>{t("attendanceDetail.fields.corrected")}</dt><dd>{yesNo(t, record.is_corrected)}</dd></div>
          {record.is_corrected && (
            <>
              <div><dt>{t("attendanceDetail.fields.correctedBy")}</dt><dd>{record.corrected_by?.username || "--"}</dd></div>
              <div><dt>{t("attendanceDetail.fields.correctionReason")}</dt><dd>{record.correction_reason || "--"}</dd></div>
            </>
          )}
          <div><dt>{t("attendanceDetail.fields.locked")}</dt><dd>{yesNo(t, record.locked)}</dd></div>
          <div><dt>{t("attendanceDetail.fields.createdAt")}</dt><dd>{formatDateTime(record.createdAt)}</dd></div>
          <div><dt>{t("attendanceDetail.fields.updatedAt")}</dt><dd>{formatDateTime(record.updatedAt)}</dd></div>
        </dl>
      </section>

      <button className="secondary-button" onClick={() => navigate(-1)}>{t("attendanceDetail.back")}</button>
    </main>
  );
}

export default AttendanceDetail;