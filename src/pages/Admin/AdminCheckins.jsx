
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import "../../components/css/Admin/AdminCheckins.css";

import {
  getAllCheckins,
} from "../../services/checkInService";


const AdminCheckins = () => {
  const navigate = useNavigate();

  const [checkins, setCheckins] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const [sourceFilter, setSourceFilter] =
    useState("all");

  const [dateFilter, setDateFilter] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 10;


  useEffect(() => {
    fetchCheckins();
  }, []);


  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    typeFilter,
    sourceFilter,
    dateFilter
  ]);


  async function fetchCheckins() {
    try {
      setLoading(true);
      setError("");

      const data = await getAllCheckins();

      console.log("All Checkins:", data);

      setCheckins(
        Array.isArray(data)
          ? data
          : data.checkins || []
      );

    } catch (err) {
      console.log(err);

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to load check-ins"
      );

    } finally {
      setLoading(false);
    }
  }


  const filteredCheckins = useMemo(() => {
    return checkins.filter((checkin) => {

      const employeeName =
        checkin?.employee_id?.name_en || "";

      const employeeCode =
        checkin?.employee_id?.employee_code || "";

      const text =
        search.trim().toLowerCase();


      // SEARCH
      const matchesSearch =
        employeeName
          .toLowerCase()
          .includes(text) ||

        employeeCode
          .toLowerCase()
          .includes(text);


      // IN / OUT
      const matchesType =
        typeFilter === "all" ||
        checkin.log_type === typeFilter;


      // SOURCE
      const matchesSource =
        sourceFilter === "all" ||
        checkin.source === sourceFilter;


      // DATE
      let matchesDate = true;

      if (dateFilter) {
        const selectedDate =
          new Date(dateFilter);

        const checkinDate =
          new Date(checkin.timestamp);

        matchesDate =
          selectedDate.getFullYear() ===
            checkinDate.getFullYear() &&

          selectedDate.getMonth() ===
            checkinDate.getMonth() &&

          selectedDate.getDate() ===
            checkinDate.getDate();
      }


      return (
        matchesSearch &&
        matchesType &&
        matchesSource &&
        matchesDate
      );

    });
  }, [
    checkins,
    search,
    typeFilter,
    sourceFilter,
    dateFilter
  ]);


  const summary = useMemo(() => {

    const now = new Date();

    const today = checkins.filter(
      (checkin) => {

        const date =
          new Date(checkin.timestamp);

        return (
          date.getFullYear() ===
            now.getFullYear() &&

          date.getMonth() ===
            now.getMonth() &&

          date.getDate() ===
            now.getDate()
        );
      }
    );


    return {
      total: checkins.length,

      in: checkins.filter(
        (checkin) =>
          checkin.log_type === "IN"
      ).length,

      out: checkins.filter(
        (checkin) =>
          checkin.log_type === "OUT"
      ).length,

      today: today.length
    };

  }, [checkins]);


  // PAGINATION
  const totalPages = Math.ceil(
    filteredCheckins.length /
    itemsPerPage
  );


  const startIndex =
    (currentPage - 1) *
    itemsPerPage;


  const paginatedCheckins =
    filteredCheckins.slice(
      startIndex,
      startIndex + itemsPerPage
    );


  function formatDate(timestamp) {
    if (!timestamp) return "--";

    return new Date(
      timestamp
    ).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    );
  }


  function formatTime(timestamp) {
    if (!timestamp) return "--";

    return new Date(
      timestamp
    ).toLocaleTimeString(
      "en-BH",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }


  function formatSource(source) {
    const sources = {
      mobile_app: "Mobile App",
      web: "Web",
      biometric_device:
        "Biometric Device",
      hr_entry: "HR Entry"
    };

    return sources[source] ||
      source ||
      "--";
  }


  if (loading) {
    return (
      <main className="admin-checkins-page">
        <p>Loading check-ins...</p>
      </main>
    );
  }


  return (
    <main className="admin-checkins-page">

      {/* HEADER */}
      <section className="admin-checkins-header">

        <div>
          <p className="checkins-page-label">
            ATTENDANCE MANAGEMENT
          </p>

          <h1>Check-ins</h1>

          <p>
            View employee check-in and
            check-out activity.
          </p>
        </div>

      </section>


      {/* ERROR */}

      {error && (
        <div className="admin-checkins-error">
          ⚠ {error}
        </div>
      )}


      {/* SUMMARY */}

      <section className="admin-checkins-summary">

        <SummaryCard
          label="Total Logs"
          value={summary.total}
          icon="▤"
        />


        <SummaryCard
          label="Check Ins"
          value={summary.in}
          icon="→"
          type="in"
        />


        <SummaryCard
          label="Check Outs"
          value={summary.out}
          icon="←"
          type="out"
        />


        <SummaryCard
          label="Today's Logs"
          value={summary.today}
          icon="◷"
          type="today"
        />

      </section>


      {/* FILTERS */}

      <section className="admin-checkins-filter-card">

        <div className="checkins-filter-heading">

          <div>
            <h2>Check-in Records</h2>

            <p>
              Search and filter employee
              check-in history.
            </p>
          </div>


          <span className="checkins-count">
            {filteredCheckins.length}
            {" "}
            records
          </span>

        </div>


        <div className="admin-checkins-filters">

          {/* SEARCH */}

          <div className="checkins-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search employee or code..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          {/* TYPE */}

          <div className="checkin-filter-field">

            <label>Type</label>

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value
                )
              }
            >

              <option value="all">
                All Types
              </option>

              <option value="IN">
                IN
              </option>

              <option value="OUT">
                OUT
              </option>

            </select>

          </div>


          {/* SOURCE */}

          <div className="checkin-filter-field">

            <label>Source</label>

            <select
              value={sourceFilter}
              onChange={(e) =>
                setSourceFilter(
                  e.target.value
                )
              }
            >

              <option value="all">
                All Sources
              </option>

              <option value="web">
                Web
              </option>

              <option value="mobile_app">
                Mobile App
              </option>

              <option value="biometric_device">
                Biometric Device
              </option>

              <option value="hr_entry">
                HR Entry
              </option>

            </select>

          </div>


          {/* DATE */}

          <div className="checkin-filter-field">

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
            typeFilter !== "all" ||
            sourceFilter !== "all" ||
            dateFilter) && (

            <button
              className="clear-checkins-filter"
              onClick={() => {
                setSearch("");
                setTypeFilter("all");
                setSourceFilter("all");
                setDateFilter("");
              }}
            >
              Clear
            </button>

          )}

        </div>

      </section>


      {/* TABLE */}

      <section className="admin-checkins-table-card">

        {paginatedCheckins.length === 0 ? (

          <div className="admin-checkins-empty">

            <div>◷</div>

            <h3>
              No check-ins found
            </h3>

            <p>
              No records match the selected
              filters.
            </p>

          </div>

        ) : (

          <div className="admin-checkins-table-wrapper">

            <table className="admin-checkins-table">

              <thead>

                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Attendance</th>
                </tr>

              </thead>


              <tbody>

                {paginatedCheckins.map(
                  (checkin) => (

                    <tr key={checkin._id}>

                      {/* EMPLOYEE */}

                      <td>

                        <div className="checkin-employee">

                          <div className="checkin-employee-avatar">

                            {checkin
                              ?.employee_id
                              ?.name_en
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "E"}

                          </div>


                          <div>

                            <strong>
                              {checkin
                                ?.employee_id
                                ?.name_en ||
                                "Unknown Employee"}
                            </strong>

                            <span>
                              {checkin
                                ?.employee_id
                                ?.employee_code ||
                                "--"}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* DATE */}

                      <td className="checkin-date">
                        {formatDate(
                          checkin.timestamp
                        )}
                      </td>


                      {/* TIME */}

                      <td className="checkin-time">
                        {formatTime(
                          checkin.timestamp
                        )}
                      </td>


                      {/* TYPE */}

                      <td>

                        <span
                          className={
                            checkin.log_type ===
                            "IN"
                              ? "admin-log-badge log-in"
                              : "admin-log-badge log-out"
                          }
                        >

                          <span>
                            {checkin.log_type ===
                            "IN"
                              ? "→"
                              : "←"}
                          </span>

                          {checkin.log_type}

                        </span>

                      </td>


                      {/* SOURCE */}

                      <td>

                        <span className="admin-source-badge">
                          {formatSource(
                            checkin.source
                          )}
                        </span>

                      </td>


                      {/* ATTENDANCE */}

                      <td>

                        {checkin.attendance_id ? (

                          <button
                            className="checkin-attendance-link"
                            onClick={() =>
                              navigate(
                                `/admin/attendance/${
                                  checkin
                                    .attendance_id
                                    ?._id ||
                                  checkin
                                    .attendance_id
                                }`
                              )
                            }
                          >
                            View Attendance →
                          </button>

                        ) : (

                          <span className="no-attendance-link">
                            —
                          </span>

                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}


        {/* PAGINATION */}

        {filteredCheckins.length > 0 && (
          <div className="checkins-pagination">

            <div className="checkins-pagination-info">

              Showing{" "}

              <strong>
                {startIndex + 1}
              </strong>

              {" - "}

              <strong>
                {Math.min(
                  startIndex +
                    itemsPerPage,

                  filteredCheckins.length
                )}
              </strong>

              {" of "}

              <strong>
                {filteredCheckins.length}
              </strong>

            </div>


            {totalPages > 1 && (

              <div className="checkins-page-buttons">

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
                      page ===
                      currentPage
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
    <article className="checkins-summary-card">

      <div
        className={`checkins-summary-icon ${type}`}
      >
        {icon}
      </div>


      <div>
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>

    </article>
  );
}


export default AdminCheckins;