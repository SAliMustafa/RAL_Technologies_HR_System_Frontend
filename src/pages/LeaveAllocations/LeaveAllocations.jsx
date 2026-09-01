import { useCallback, useEffect, useState } from "react";
import { getLeaveAllocations } from "../../services/leaveAllocationService";
import "./LeaveAllocations.css";

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.err ||
    "Unable to load leave allocations."
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
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAllocations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getLeaveAllocations();
      setAllocations(Array.isArray(response?.data) ? response.data : []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const request = window.setTimeout(loadAllocations, 0);
    return () => window.clearTimeout(request);
  }, [loadAllocations]);

  return (
    <main className="allocations-page">
      <div className="allocations-header">
        <div>
          <p className="allocations-eyebrow">LEAVE MANAGEMENT</p>
          <h1>Leave Allocations</h1>
          <p>View allocated leave and remaining balances.</p>
        </div>
      </div>

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
    </main>
  );
}

export default LeaveAllocations;
