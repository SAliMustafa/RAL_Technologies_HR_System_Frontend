import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import "../../components/css/Employee/MyAttendance.css";

import {getMyAttendance} from "../../services/attendanceService";

const MyAttendance = () => {
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");


  useEffect(() => {
    async function fetchAttendance() {
      try {
        const data = await getMyAttendance();

        console.log("My Attendance:", data);

        setAttendance(
          Array.isArray(data)
            ? data
            : data.attendance || []
        );

      } catch (err) {
        console.log(err);

        setError(
          err?.response?.data?.message ||
          "Failed to load attendance"
        );

      } finally {
        setLoading(false);
      }
    }

    fetchAttendance();
  }, []);


  const filteredAttendance = useMemo(() => {
    return attendance.filter((item) => {

      if (
        statusFilter !== "all" &&
        item.status !== statusFilter
      ) {
        return false;
      }

      const itemDate = new Date(item.date);


      if (fromDate) {
        const from = new Date(fromDate);

        from.setHours(0, 0, 0, 0);

        if (itemDate < from) {
          return false;
        }
      }


      if (toDate) {
        const to = new Date(toDate);

        to.setHours(23, 59, 59, 999);

        if (itemDate > to) {
          return false;
        }
      }

      return true;
    });
  }, [
    attendance,
    statusFilter,
    fromDate,
    toDate
  ]);


  const summary = useMemo(() => {
    return {
      total: attendance.length,

      present: attendance.filter(
        (item) => item.status === "present"
      ).length,

      late: attendance.filter(
        (item) => item.is_late_entry
      ).length,

      absent: attendance.filter(
        (item) => item.status === "absent"
      ).length,

      incomplete: attendance.filter(
        (item) => item.is_incomplete
      ).length
    };
  }, [attendance]);


  function formatDate(date) {
    if (!date) return "--";

    return new Date(date).toLocaleDateString(
      "en-GB"
    );
  }


  function formatTime(date) {
    if (!date) return "--";

    return new Date(date).toLocaleTimeString(
      "en-BH",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }


  function formatStatus(status) {
    const statusNames = {
      present: "Present",
      absent: "Absent",
      half_day: "Half Day",
      on_leave: "On Leave",
      holiday: "Holiday",
      weekly_off: "Weekly Off"
    };

    return statusNames[status] || status || "--";
  }


  if (loading) {
    return (
      <main className="my-attendance-page">
        <p>Loading attendance...</p>
      </main>
    );
  }


  return (
    <main className="my-attendance-page">

      {/* HEADER */}
      <section className="attendance-page-header">

        <div>
          <p className="attendance-eyebrow">
            ATTENDANCE
          </p>

          <h1>My Attendance</h1>

          <p>
            View your daily attendance records and working hours.
          </p>
        </div>

      </section>


      {error && (
        <div className="attendance-error">
          ⚠ {error}
        </div>
      )}


      {/* SUMMARY */}
      <section className="attendance-summary-grid">

        <SummaryCard
          title="Total Records"
          value={summary.total}
          icon="▤"
        />

        <SummaryCard
          title="Present"
          value={summary.present}
          icon="✓"
          type="green"
        />

        <SummaryCard
          title="Late Entries"
          value={summary.late}
          icon="◷"
          type="amber"
        />

        <SummaryCard
          title="Absent"
          value={summary.absent}
          icon="✕"
          type="red"
        />

        <SummaryCard
          title="Incomplete"
          value={summary.incomplete}
          icon="!"
          type="amber"
        />

      </section>


      {/* FILTER */}
      <section className="attendance-filter-card">

        <div className="attendance-filter-header">

          <div>
            <h2>Attendance History</h2>

            <p>
              Filter your attendance by status or date.
            </p>
          </div>

          <span className="attendance-count">
            {filteredAttendance.length} records
          </span>

        </div>


        <div className="attendance-filters">

          <div className="filter-field">

            <label>Status</label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="all">
                All Status
              </option>

              <option value="present">
                Present
              </option>

              <option value="absent">
                Absent
              </option>

              <option value="half_day">
                Half Day
              </option>

              <option value="on_leave">
                On Leave
              </option>

              <option value="holiday">
                Holiday
              </option>

              <option value="weekly_off">
                Weekly Off
              </option>

            </select>

          </div>


          <div className="filter-field">

            <label>From</label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(e.target.value)
              }
            />

          </div>


          <div className="filter-field">

            <label>To</label>

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(e.target.value)
              }
            />

          </div>


          {(fromDate ||
            toDate ||
            statusFilter !== "all") && (

            <button
              className="clear-attendance-filter"
              onClick={() => {
                setStatusFilter("all");
                setFromDate("");
                setToDate("");
              }}
            >
              Clear
            </button>

          )}

        </div>

      </section>


      {/* TABLE */}
      <section className="attendance-table-card">

        {filteredAttendance.length === 0 ? (

          <div className="attendance-empty">

            <div>◷</div>

            <h3>No attendance records</h3>

            <p>
              No attendance records match your filters.
            </p>

          </div>

        ) : (

          <div className="attendance-table-wrapper">

            <table className="attendance-table">

              <thead>

                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Worked Hours</th>
                  <th>Notes</th>
                  <th></th>
                </tr>

              </thead>


              <tbody>

                {filteredAttendance.map((item) => (

                  <tr key={item._id}>

                    {/* DATE */}
                    <td className="attendance-date">
                      {formatDate(item.date)}
                    </td>


                    {/* STATUS */}
                    <td>

                      <span
                        className={`attendance-status-badge status-${item.status}`}
                      >
                        {formatStatus(item.status)}
                      </span>

                    </td>


                    {/* IN */}
                    <td>
                      {formatTime(item.in_time)}
                    </td>


                    {/* OUT */}
                    <td>
                      {formatTime(item.out_time)}
                    </td>


                    {/* HOURS */}
                    <td className="worked-hours">
                      {item.worked_hours
                        ? `${item.worked_hours} hrs`
                        : "--"}
                    </td>


                    {/* NOTES */}
                    <td>

                      <div className="attendance-flags">

                        {item.is_late_entry && (
                          <span className="flag flag-warning">
                            Late
                          </span>
                        )}


                        {item.is_early_exit && (
                          <span className="flag flag-warning">
                            Early Exit
                          </span>
                        )}


                        {item.is_incomplete && (
                          <span className="flag flag-danger">
                            Incomplete
                          </span>
                        )}


                        {item.is_corrected && (
                          <span className="flag flag-corrected">
                            Corrected
                          </span>
                        )}


                        {item.locked && (
                          <span className="flag flag-locked">
                            Locked
                          </span>
                        )}


                        {!item.is_late_entry &&
                          !item.is_early_exit &&
                          !item.is_incomplete &&
                          !item.is_corrected &&
                          !item.locked && (
                            <span className="no-flags">
                              —
                            </span>
                          )}

                      </div>

                    </td>


                    {/* VIEW */}
                    <td>

                      <button
                        className="view-attendance-details"
                        onClick={() =>
                          navigate(
                            `/attendance/${item._id}`
                          )
                        }
                      >
                        View →
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </main>
  );
};



function SummaryCard({
  title,
  value,
  icon,
  type = ""
}) {
  return (
    <article className="attendance-summary-card">

      <div
        className={`summary-icon ${type}`}
      >
        {icon}
      </div>

      <div>
        <span>{title}</span>

        <strong>{value}</strong>
      </div>

    </article>
  );
}


export default MyAttendance;