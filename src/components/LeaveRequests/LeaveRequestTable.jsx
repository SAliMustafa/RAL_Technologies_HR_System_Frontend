import LeaveRequestStatusBadge from "./LeaveRequestStatusBadge";
import "./LeaveRequests.css";

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function LeaveRequestTable({ requests, onView, renderActions }) {
  return (
    <div className="request-table-wrap">
      <table className="request-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Leave type</th>
            <th>Leave period</th>
            <th className="request-number-column">Total days</th>
            <th>Approver</th>
            <th>Status</th>
            <th><span className="request-sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request._id}>
              <td>
                <strong>{request.employee_id?.name_en || "Unknown employee"}</strong>
                {request.employee_id?.employee_code && (
                  <small>{request.employee_id.employee_code}</small>
                )}
              </td>
              <td>
                {request.leave_type_id?.leave_type_name || "Unknown leave type"}
              </td>
              <td>
                <span className="request-period">{formatDate(request.from_date)}</span>
                <small>
                  {request.is_half_day
                    ? "Half day"
                    : `to ${formatDate(request.to_date)}`}
                </small>
              </td>
              <td className="request-number-column">{request.total_days}</td>
              <td>
                <strong>{request.approver_id?.name_en || "No approver"}</strong>
                {request.approver_id?.employee_code && (
                  <small>{request.approver_id.employee_code}</small>
                )}
              </td>
              <td><LeaveRequestStatusBadge status={request.status} /></td>
              <td>
                <div className="request-row-actions">
                  <button type="button" onClick={() => onView(request)}>
                    Details
                  </button>
                  {renderActions?.(request)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeaveRequestTable;
