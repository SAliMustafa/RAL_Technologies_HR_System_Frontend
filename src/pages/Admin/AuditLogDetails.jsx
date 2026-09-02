import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import "../../components/css/Admin/AuditLogDetails.css";

import {
  getAuditLogById,
  getAuditLogsByRecord,
} from "../../services/auditLogService";


const AuditLogDetails = () => {
  const navigate = useNavigate();

  const { auditLogId } = useParams();

  const [log, setLog] = useState(null);
  const [recordHistory, setRecordHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [error, setError] = useState("");


  useEffect(() => {
    fetchAuditLog();
  }, [auditLogId]);


  async function fetchAuditLog() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAuditLogById(auditLogId);

      const currentLog =
        data.log || data;

      console.log(
        "Audit Log:",
        currentLog
      );

      setLog(currentLog);


      if (
        currentLog.table_name &&
        currentLog.record_id
      ) {
        fetchRecordHistory(
          currentLog.table_name,
          currentLog.record_id
        );
      }

    } catch (err) {
      console.log(err);

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to load audit log"
      );

    } finally {
      setLoading(false);
    }
  }


  async function fetchRecordHistory(
    tableName,
    recordId
  ) {
    try {
      setHistoryLoading(true);

      const data =
        await getAuditLogsByRecord(
          tableName,
          recordId
        );

      setRecordHistory(
        Array.isArray(data)
          ? data
          : data.logs || []
      );

    } catch (err) {
      console.log(
        "Failed to load record history:",
        err
      );

    } finally {
      setHistoryLoading(false);
    }
  }


  function formatDateTime(date) {
    if (!date) return "--";

    return new Date(date).toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );
  }


  function formatTableName(name) {
    if (!name) return "--";

    return name
      .replaceAll("_", " ")
      .replace(
        /([a-z])([A-Z])/g,
        "$1 $2"
      )
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  }


  function formatFieldName(name) {
    if (!name) return "--";

    return name
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  }


  function formatAction(action) {
    if (!action) return "--";

    return (
      action.charAt(0).toUpperCase() +
      action.slice(1)
    );
  }


  function displayValue(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    if (
      value === true ||
      value === "true"
    ) {
      return "True";
    }

    if (
      value === false ||
      value === "false"
    ) {
      return "False";
    }

    if (typeof value === "object") {
      return JSON.stringify(
        value,
        null,
        2
      );
    }

    return String(value);
  }


  if (loading) {
    return (
      <main className="audit-details-page">
        <p>Loading audit log...</p>
      </main>
    );
  }


  if (error) {
    return (
      <main className="audit-details-page">

        <div className="audit-details-error">
          ⚠ {error}
        </div>

      </main>
    );
  }


  if (!log) {
    return (
      <main className="audit-details-page">
        <p>Audit log not found.</p>
      </main>
    );
  }


  return (
    <main className="audit-details-page">

      {/* BACK */}

      <button
        className="audit-details-back"
        onClick={() =>
          navigate("/admin/audit-logs")
        }
      >
        ← Back to Audit Logs
      </button>


      {/* HEADER */}

      <section className="audit-details-header">

        <div>

          <p className="audit-details-label">
            SYSTEM AUDIT
          </p>

          <h1>Audit Log Details</h1>

          <p>
            Review the complete information
            recorded for this system change.
          </p>

        </div>


        <ActionBadge
          action={log.action}
        />

      </section>


      {/* MAIN INFORMATION */}

      <section className="audit-details-card">

        <div className="audit-card-heading">

          <span>ACTIVITY</span>

          <h2>Activity Information</h2>

        </div>


        <div className="audit-details-grid">

          <DetailItem
            label="Date & Time"
            value={formatDateTime(
              log.changed_at
            )}
          />


          <DetailItem
            label="Action"
            value={formatAction(
              log.action
            )}
          />


          <DetailItem
            label="Table"
            value={formatTableName(
              log.table_name
            )}
          />


          <DetailItem
            label="Field"
            value={formatFieldName(
              log.field_name
            )}
          />

        </div>

      </section>


      {/* USER */}

      <section className="audit-details-card">

        <div className="audit-card-heading">

          <span>USER</span>

          <h2>Changed By</h2>

        </div>


        <div className="audit-changed-user">

          <div className="audit-details-avatar">

            {log
              ?.changed_by
              ?.username
              ?.charAt(0)
              ?.toUpperCase() ||
              "U"}

          </div>


          <div className="audit-changed-user-main">

            <strong>
              {log
                ?.changed_by
                ?.username ||
                "System"}
            </strong>

            <span>
              {log
                ?.changed_by
                ?.role
                ?.replaceAll(
                  "_",
                  " "
                ) ||
                "--"}
            </span>

          </div>


          <div className="audit-user-ip">

            <span>IP Address</span>

            <strong>
              {log.ip_address ||
                "--"}
            </strong>

          </div>

        </div>

      </section>


      {/* RECORD */}

      <section className="audit-details-card">

        <div className="audit-card-heading">

          <span>RECORD</span>

          <h2>Record Information</h2>

        </div>


        <div className="audit-record-grid">

          <DetailItem
            label="Table Name"
            value={formatTableName(
              log.table_name
            )}
          />


          <DetailItem
            label="Record ID"
            value={
              log.record_id ||
              "--"
            }
            mono
          />


          <DetailItem
            label="Field Name"
            value={formatFieldName(
              log.field_name
            )}
          />

        </div>

      </section>


      {/* CHANGE */}

      <section className="audit-details-card">

        <div className="audit-card-heading">

          <span>CHANGE</span>

          <h2>Value Change</h2>

        </div>


        <div className="audit-change-grid">

          {/* OLD */}

          <div className="audit-value-box old">

            <div className="audit-value-title">
              <span>Before</span>

              <strong>
                Old Value
              </strong>
            </div>


            <div className="audit-value-content">

              <pre>
                {displayValue(
                  log.old_value
                )}
              </pre>

            </div>

          </div>


          {/* ARROW */}

          <div className="audit-change-arrow">
            →
          </div>


          {/* NEW */}

          <div className="audit-value-box new">

            <div className="audit-value-title">
              <span>After</span>

              <strong>
                New Value
              </strong>
            </div>


            <div className="audit-value-content">

              <pre>
                {displayValue(
                  log.new_value
                )}
              </pre>

            </div>

          </div>

        </div>

      </section>


      {/* REASON */}

      {log.reason && (

        <section className="audit-details-card">

          <div className="audit-card-heading">

            <span>REASON</span>

            <h2>Change Reason</h2>

          </div>


          <div className="audit-reason-box">
            {log.reason}
          </div>

        </section>

      )}


      {/* RECORD HISTORY */}

      <section className="audit-details-card">

        <div className="audit-card-heading history-heading">

          <div>

            <span>HISTORY</span>

            <h2>Record History</h2>

            <p>
              Other recorded changes for
              this same record.
            </p>

          </div>


          <span className="history-count">
            {recordHistory.length}
            {" "}
            changes
          </span>

        </div>


        {historyLoading ? (

          <p className="history-loading">
            Loading history...
          </p>

        ) : recordHistory.length === 0 ? (

          <div className="audit-history-empty">
            No additional history found.
          </div>

        ) : (

          <div className="audit-history-list">

            {recordHistory.map(
              (history) => (

                <div
                  key={history._id}
                  className={
                    history._id === log._id
                      ? "audit-history-item current"
                      : "audit-history-item"
                  }
                  onClick={() => {

                    if (
                      history._id !==
                      log._id
                    ) {
                      navigate(
                        `/admin/audit-logs/${history._id}`
                      );
                    }

                  }}
                >

                  <div className="history-timeline">

                    <div
                      className={`history-dot action-${history.action}`}
                    ></div>

                    <div className="history-line"></div>

                  </div>


                  <div className="history-content">

                    <div className="history-top">

                      <div>

                        <ActionBadge
                          action={
                            history.action
                          }
                        />

                        <strong>
                          {formatFieldName(
                            history.field_name
                          )}
                        </strong>

                      </div>


                      <span>
                        {formatDateTime(
                          history.changed_at
                        )}
                      </span>

                    </div>


                    <div className="history-values">

                      <span>
                        {displayValue(
                          history.old_value
                        )}
                      </span>

                      <b>→</b>

                      <span>
                        {displayValue(
                          history.new_value
                        )}
                      </span>

                    </div>


                    <small>
                      Changed by{" "}
                      <strong>
                        {history
                          ?.changed_by
                          ?.username ||
                          "System"}
                      </strong>
                    </small>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </main>
  );
};



function DetailItem({
  label,
  value,
  mono = false
}) {

  return (
    <div className="audit-detail-item">

      <span>
        {label}
      </span>

      <strong
        className={
          mono ? "mono" : ""
        }
      >
        {value}
      </strong>

    </div>
  );
}



function ActionBadge({ action }) {

  const icons = {
    create: "+",
    update: "✎",
    approve: "✓",
    cancel: "–",
    correct: "✓",
    delete: "✕"
  };


  return (
    <span
      className={`audit-details-action action-${action}`}
    >
      <span>
        {icons[action] || "•"}
      </span>

      {action
        ? action
            .charAt(0)
            .toUpperCase() +
          action.slice(1)
        : "Unknown"}
    </span>
  );
}


export default AuditLogDetails;