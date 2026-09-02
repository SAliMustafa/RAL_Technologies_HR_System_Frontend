import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import "../../components/css/Admin/AdminAuditLogs.css";

import {
  getAllAuditLogs
} from "../../services/auditLogService";


const ACTIONS = [
  "create",
  "update",
  "approve",
  "cancel",
  "correct",
  "delete"
];


const AdminAuditLogs = () => {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [tableFilter, setTableFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;


  useEffect(() => {
    fetchLogs();
  }, []);


  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    actionFilter,
    tableFilter,
    dateFilter
  ]);


  async function fetchLogs() {
    try {
      setLoading(true);
      setError("");

      const data = await getAllAuditLogs();

      console.log("Audit Logs:", data);

      setLogs(
        Array.isArray(data)
          ? data
          : data.logs || []
      );

    } catch (err) {
      console.log(err);

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to load audit logs"
      );

    } finally {
      setLoading(false);
    }
  }


  /*
    Build table names automatically from
    the data returned by backend.
  */
  const tableNames = useMemo(() => {

    return [
      ...new Set(
        logs
          .map((log) => log.table_name)
          .filter(Boolean)
      )
    ];

  }, [logs]);


  const filteredLogs = useMemo(() => {

    return logs.filter((log) => {

      const text =
        search.trim().toLowerCase();


      const username =
        log?.changed_by?.username || "";


      const role =
        log?.changed_by?.role || "";


      const table =
        log?.table_name || "";


      const recordId =
        log?.record_id || "";


      const field =
        log?.field_name || "";


      const matchesSearch =
        username
          .toLowerCase()
          .includes(text) ||

        role
          .toLowerCase()
          .includes(text) ||

        table
          .toLowerCase()
          .includes(text) ||

        recordId
          .toString()
          .toLowerCase()
          .includes(text) ||

        field
          .toLowerCase()
          .includes(text);


      const matchesAction =
        actionFilter === "all" ||
        log.action === actionFilter;


      const matchesTable =
        tableFilter === "all" ||
        log.table_name === tableFilter;


      let matchesDate = true;


      if (dateFilter && log.changed_at) {

        const selectedDate =
          new Date(dateFilter);


        const logDate =
          new Date(log.changed_at);


        matchesDate =
          selectedDate.getFullYear() ===
            logDate.getFullYear() &&

          selectedDate.getMonth() ===
            logDate.getMonth() &&

          selectedDate.getDate() ===
            logDate.getDate();
      }


      return (
        matchesSearch &&
        matchesAction &&
        matchesTable &&
        matchesDate
      );

    });

  }, [
    logs,
    search,
    actionFilter,
    tableFilter,
    dateFilter
  ]);


  const summary = useMemo(() => {

    const today = new Date();


    const todayLogs =
      logs.filter((log) => {

        if (!log.changed_at) {
          return false;
        }

        const date =
          new Date(log.changed_at);

        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );

      });


    return {

      total: logs.length,

      today: todayLogs.length,

      updates:
        logs.filter(
          (log) =>
            log.action === "update"
        ).length,

      approvals:
        logs.filter(
          (log) =>
            log.action === "approve"
        ).length

    };

  }, [logs]);


  // ===========================
  // PAGINATION
  // ===========================

  const totalPages = Math.ceil(
    filteredLogs.length /
    itemsPerPage
  );


  const startIndex =
    (currentPage - 1) *
    itemsPerPage;


  const paginatedLogs =
    filteredLogs.slice(
      startIndex,
      startIndex + itemsPerPage
    );


  function formatDateTime(date) {
    if (!date) return "--";

    return new Date(date).toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }


  function formatTableName(name) {
    if (!name) return "--";

    return name
      .replaceAll("_", " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }


  function formatAction(action) {
    if (!action) return "--";

    return action
      .charAt(0)
      .toUpperCase() +
      action.slice(1);
  }


  function displayValue(value) {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    if (typeof value === "boolean") {
      return value
        ? "True"
        : "False";
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  }


  if (loading) {
    return (
      <main className="admin-audit-page">
        <p>Loading audit logs...</p>
      </main>
    );
  }


  return (
    <main className="admin-audit-page">

      {/* HEADER */}

      <section className="audit-page-header">

        <div>

          <p className="audit-page-label">
            SYSTEM ADMINISTRATION
          </p>

          <h1>Audit Logs</h1>

          <p>
            Track changes and activities
            across the HR system.
          </p>

        </div>

      </section>


      {/* ERROR */}

      {error && (
        <div className="audit-error">
          ⚠ {error}
        </div>
      )}


      {/* SUMMARY */}

      <section className="audit-summary-grid">

        <SummaryCard
          label="Total Logs"
          value={summary.total}
          icon="▤"
        />


        <SummaryCard
          label="Today"
          value={summary.today}
          icon="◷"
          type="today"
        />


        <SummaryCard
          label="Updates"
          value={summary.updates}
          icon="✎"
          type="update"
        />


        <SummaryCard
          label="Approvals"
          value={summary.approvals}
          icon="✓"
          type="approve"
        />

      </section>


      {/* FILTERS */}

      <section className="audit-filter-card">

        <div className="audit-filter-header">

          <div>
            <h2>System Activity</h2>

            <p>
              Search and filter system audit
              history.
            </p>
          </div>


          <span className="audit-record-count">
            {filteredLogs.length} records
          </span>

        </div>


        <div className="audit-filters">

          {/* SEARCH */}

          <div className="audit-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search user, table, record or field..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          {/* TABLE */}

          <div className="audit-filter-field">

            <label>Table</label>

            <select
              value={tableFilter}
              onChange={(e) =>
                setTableFilter(
                  e.target.value
                )
              }
            >

              <option value="all">
                All Tables
              </option>

              {tableNames.map(
                (table) => (

                  <option
                    key={table}
                    value={table}
                  >
                    {formatTableName(
                      table
                    )}
                  </option>

                )
              )}

            </select>

          </div>


          {/* ACTION */}

          <div className="audit-filter-field">

            <label>Action</label>

            <select
              value={actionFilter}
              onChange={(e) =>
                setActionFilter(
                  e.target.value
                )
              }
            >

              <option value="all">
                All Actions
              </option>


              {ACTIONS.map(
                (action) => (

                  <option
                    key={action}
                    value={action}
                  >
                    {formatAction(action)}
                  </option>

                )
              )}

            </select>

          </div>


          {/* DATE */}

          <div className="audit-filter-field">

            <label>Date</label>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(
                  e.target.value
                )
              }
            />

          </div>


          {(search ||
            tableFilter !== "all" ||
            actionFilter !== "all" ||
            dateFilter) && (

            <button
              className="audit-clear-filter"
              onClick={() => {
                setSearch("");
                setTableFilter("all");
                setActionFilter("all");
                setDateFilter("");
              }}
            >
              Clear
            </button>

          )}

        </div>

      </section>


      {/* TABLE */}

      <section className="audit-table-card">

        {paginatedLogs.length === 0 ? (

          <div className="audit-empty">

            <div>▤</div>

            <h3>
              No audit logs found
            </h3>

            <p>
              No audit records match the
              selected filters.
            </p>

          </div>

        ) : (

          <div className="audit-table-wrapper">

            <table className="audit-table">

              <thead>

                <tr>
                  <th>Date & Time</th>
                  <th>Changed By</th>
                  <th>Table</th>
                  <th>Action</th>
                  <th>Field</th>
                  <th>Old Value</th>
                  <th>New Value</th>
                  <th>IP Address</th>
                </tr>

              </thead>


              <tbody>

                {paginatedLogs.map(
                  (log) => (

                    <tr
                      key={log._id}
                      className="audit-table-row"
                      onClick={() =>
                        navigate(
                          `/admin/audit-logs/${log._id}`
                        )
                      }
                    >

                      {/* DATE */}

                      <td className="audit-date">
                        {formatDateTime(
                          log.changed_at
                        )}
                      </td>


                      {/* USER */}

                      <td>

                        <div className="audit-user">

                          <div className="audit-user-avatar">

                            {log
                              ?.changed_by
                              ?.username
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "U"}

                          </div>


                          <div>

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

                        </div>

                      </td>


                      {/* TABLE */}

                      <td>

                        <span className="audit-table-name">
                          {formatTableName(
                            log.table_name
                          )}
                        </span>

                      </td>


                      {/* ACTION */}

                      <td>

                        <ActionBadge
                          action={log.action}
                        />

                      </td>


                      {/* FIELD */}

                      <td>

                        <span className="audit-field">
                          {log.field_name ||
                            "--"}
                        </span>

                      </td>


                      {/* OLD */}

                      <td>

                        <span className="audit-value old">

                          {displayValue(
                            log.old_value
                          )}

                        </span>

                      </td>


                      {/* NEW */}

                      <td>

                        <span className="audit-value new">

                          {displayValue(
                            log.new_value
                          )}

                        </span>

                      </td>


                      {/* IP */}

                      <td>

                        <span className="audit-ip">
                          {log.ip_address ||
                            "--"}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}


        {/* PAGINATION */}

        {filteredLogs.length > 0 && (

          <div className="audit-pagination">

            <div className="audit-pagination-info">

              Showing{" "}

              <strong>
                {startIndex + 1}
              </strong>

              {" - "}

              <strong>
                {Math.min(
                  startIndex +
                    itemsPerPage,
                  filteredLogs.length
                )}
              </strong>

              {" of "}

              <strong>
                {filteredLogs.length}
              </strong>

            </div>


            {totalPages > 1 && (

              <div className="audit-page-buttons">

                <button
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        page - 1
                    )
                  }
                >
                  ←
                </button>


                {Array.from(
                  {
                    length:
                      totalPages
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (

                  <button
                    key={page}
                    className={
                      currentPage ===
                      page
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setCurrentPage(
                        page
                      )
                    }
                  >
                    {page}
                  </button>

                ))}


                <button
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        page + 1
                    )
                  }
                >
                  →
                </button>

              </div>

            )}

          </div>

        )}

      </section>

    </main>
  );
};



function SummaryCard({
  label,
  value,
  icon,
  type = ""
}) {

  return (
    <article className="audit-summary-card">

      <div
        className={`audit-summary-icon ${type}`}
      >
        {icon}
      </div>


      <div>
        <span>{label}</span>

        <strong>{value}</strong>
      </div>

    </article>
  );
}



function ActionBadge({ action }) {

  return (
    <span
      className={`audit-action action-${action}`}
    >
      {action === "approve" && "✓ "}
      {action === "delete" && "✕ "}
      {action === "update" && "✎ "}
      {action === "create" && "+ "}
      {action === "correct" && "✓ "}
      {action === "cancel" && "– "}

      {action
        ? action.charAt(0).toUpperCase() +
          action.slice(1)
        : "--"}
    </span>
  );
}


export default AdminAuditLogs;