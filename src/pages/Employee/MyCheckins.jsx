import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import "../../components/css/Employee/MyCheckins.css";
import { getMyCheckins} from "../../services/checkInService";

const MyCheckins = () => {
  const navigate = useNavigate();

  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    async function fetchCheckins() {
      try {
        const data = await getMyCheckins();

        console.log("My Checkins:", data);

        setCheckins(Array.isArray(data) ? data : data.checkins || []);
      } catch (err) {
        console.log(err);

        setError(
          err?.response?.data?.message ||
          "Failed to load check-ins"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCheckins();
  }, []);


  const filteredCheckins = useMemo(() => {
    return checkins.filter((item) => {

      if (
        typeFilter !== "ALL" &&
        item.log_type !== typeFilter
      ) {
        return false;
      }

      const itemDate = new Date(item.timestamp);

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
    checkins,
    typeFilter,
    fromDate,
    toDate
  ]);


  const todayCheckins = useMemo(() => {
    const today = new Date();

    return checkins.filter((item) => {
      const date = new Date(item.timestamp);

      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    });
  }, [checkins]);


  const todayIn = todayCheckins.find(
    (item) => item.log_type === "IN"
  );


  const todayOut = [...todayCheckins]
    .reverse().find(
      (item) => item.log_type === "OUT");


  function formatDate(timestamp) {
    if (!timestamp) return "--";

    return new Date(timestamp).toLocaleDateString(
      "en-GB"
    );
  }


  function formatTime(timestamp) {
    if (!timestamp) return "--";

    return new Date(timestamp).toLocaleTimeString(
      "en-BH",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }


  function formatSource(source) {
    if (!source) return "--";

    const sourceNames = {
      mobile_app: "Mobile App",
      web: "Web",
      biometric_device: "Biometric Device",
      hr_entry: "HR Entry"
    };

    return sourceNames[source] || source;
  }


  if (loading) {
    return (
      <main className="my-checkins-page">
        <p>Loading check-ins...</p>
      </main>
    );
  }


  return (
    <main className="my-checkins-page">

      {/* HEADER */}
      <section className="checkins-page-header">

        <div>
          <p className="page-eyebrow">
            ATTENDANCE
          </p>

          <h1>My Check-ins</h1>

          <p>
            View your check-in and check-out history.
          </p>
        </div>

      </section>


      {/* ERROR */}
      {error && (
        <div className="checkins-error">
          ⚠ {error}
        </div>
      )}


      {/* TODAY SUMMARY */}
      <section className="today-checkins-grid">

        <article className="today-checkin-card">

          <div className="today-card-icon in-icon">
            →
          </div>

          <div>
            <span>Today's Check In</span>

            <strong>
              {formatTime(todayIn?.timestamp)}
            </strong>

            <small>
              {todayIn
                ? formatSource(todayIn.source)
                : "Not checked in"}
            </small>
          </div>

        </article>


        <article className="today-checkin-card">

          <div className="today-card-icon out-icon">
            ←
          </div>

          <div>
            <span>Today's Check Out</span>

            <strong>
              {formatTime(todayOut?.timestamp)}
            </strong>

            <small>
              {todayOut
                ? formatSource(todayOut.source)
                : "Not checked out"}
            </small>
          </div>

        </article>

      </section>


      {/* FILTERS */}
      <section className="checkins-filter-card">

        <div className="filter-top">

          <div>
            <h2>Check-in History</h2>

            <p>
              Filter your records by type or date.
            </p>
          </div>


          <span className="records-count">
            {filteredCheckins.length} records
          </span>

        </div>


        <div className="checkins-filters">

          <div className="type-filter-buttons">

            <button
              className={
                typeFilter === "ALL"
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() =>
                setTypeFilter("ALL")
              }
            >
              All
            </button>


            <button
              className={
                typeFilter === "IN"
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() =>
                setTypeFilter("IN")
              }
            >
              IN
            </button>


            <button
              className={
                typeFilter === "OUT"
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() =>
                setTypeFilter("OUT")
              }
            >
              OUT
            </button>

          </div>


          <div className="date-filter">

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


            {(fromDate || toDate) && (
              <button
                className="clear-filter-btn"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
              >
                Clear
              </button>
            )}

          </div>

        </div>

      </section>


      {/* TABLE */}
      <section className="checkins-table-card">

        {filteredCheckins.length === 0 ? (

          <div className="checkins-empty">
            <div>◷</div>

            <h3>No check-ins found</h3>

            <p>
              No records match your current filters.
            </p>
          </div>

        ) : (

          <div className="checkins-table-wrapper">

            <table className="checkins-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Attendance</th>
                </tr>
              </thead>


              <tbody>

                {filteredCheckins.map((item) => (

                  <tr key={item._id}>

                    <td>
                      {formatDate(item.timestamp)}
                    </td>


                    <td className="time-cell">
                      {formatTime(item.timestamp)}
                    </td>


                    <td>
                      <span
                        className={
                          item.log_type === "IN"
                            ? "log-badge log-in"
                            : "log-badge log-out"
                        }
                      >
                        <span>
                          {item.log_type === "IN"
                            ? "→"
                            : "←"}
                        </span>

                        {item.log_type}
                      </span>
                    </td>


                    <td>
                      <span className="source-badge">
                        {formatSource(item.source)}
                      </span>
                    </td>


                    <td>

                      {item.attendance_id ? (

                        <button
                          className="view-attendance-btn"
                          onClick={() =>
                            navigate(
                              `/attendance/${item.attendance_id?._id || item.attendance_id}`
                            )
                          }
                        >
                          View Attendance
                          <span>→</span>
                        </button>

                      ) : (

                        <span className="no-attendance">
                          —
                        </span>

                      )}

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

export default MyCheckins;