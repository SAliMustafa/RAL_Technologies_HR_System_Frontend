function LeaveRequestStatusBadge({ status }) {
  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";

  return (
    <span className={`request-status request-status-${status || "unknown"}`}>
      {label}
    </span>
  );
}

export default LeaveRequestStatusBadge;
