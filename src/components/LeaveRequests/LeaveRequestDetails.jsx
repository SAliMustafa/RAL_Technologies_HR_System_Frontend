import { useCallback, useEffect, useState } from "react";
import {
  downloadLeaveRequestDocument,
  getLeaveRequestById,
} from "../../services/leaveRequestService";
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

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || error.response?.data?.err || fallback;
}

function getDownloadName(contentDisposition, request) {
  if (contentDisposition) {
    const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    const basicMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    const encodedName = utfMatch?.[1] || basicMatch?.[1];

    if (encodedName) {
      try {
        return decodeURIComponent(encodedName);
      } catch {
        return encodedName;
      }
    }
  }

  const extension = request.document?.split(".").pop();
  return `leave-request-document${extension ? `.${extension}` : ""}`;
}

async function getDownloadError(error) {
  const data = error.response?.data;
  if (data instanceof Blob && data.type.includes("json")) {
    try {
      const body = JSON.parse(await data.text());
      return body.message || body.err || "Unable to download the document.";
    } catch {
      return "Unable to download the document.";
    }
  }

  return getErrorMessage(error, "Unable to download the document.");
}

function DetailItem({ label, children, fullWidth = false }) {
  return (
    <div className={`request-detail-item ${fullWidth ? "request-detail-full" : ""}`}>
      <span>{label}</span>
      <div>{children ?? "—"}</div>
    </div>
  );
}

function LeaveRequestDetails({ requestId, onClose }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const loadRequest = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getLeaveRequestById(requestId);
      setRequest(response?.data || null);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load the leave request."));
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    const pendingRequest = window.setTimeout(loadRequest, 0);
    return () => window.clearTimeout(pendingRequest);
  }, [loadRequest]);

  async function downloadDocument() {
    setDownloading(true);
    setDownloadError("");
    try {
      const result = await downloadLeaveRequestDocument(requestId);
      const url = window.URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getDownloadName(result.contentDisposition, request);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      setDownloadError(await getDownloadError(requestError));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className="request-modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="request-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-details-title"
      >
        <div className="request-modal-header">
          <div>
            <p>LEAVE REQUEST</p>
            <h2 id="request-details-title">Request details</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">×</button>
        </div>

        {loading ? (
          <div className="request-details-state" role="status">
            <span className="request-details-spinner" />
            Loading request details...
          </div>
        ) : error ? (
          <div className="request-details-state request-details-error" role="alert">
            <strong>{error}</strong>
            <button type="button" onClick={loadRequest}>Retry</button>
          </div>
        ) : request && (
          <div className="request-details-content">
            <div className="request-details-summary">
              <div>
                <strong>{request.employee_id?.name_en || "Unknown employee"}</strong>
                <span>{request.leave_type_id?.leave_type_name || "Unknown leave type"}</span>
              </div>
              <LeaveRequestStatusBadge status={request.status} />
            </div>

            <div className="request-details-grid">
              <DetailItem label="Employee code">{request.employee_id?.employee_code}</DetailItem>
              <DetailItem label="Approver">{request.approver_id?.name_en}</DetailItem>
              <DetailItem label="From date">{formatDate(request.from_date)}</DetailItem>
              <DetailItem label="To date">{formatDate(request.to_date)}</DetailItem>
              <DetailItem label="Leave duration">{request.is_half_day ? "Half day" : `${request.total_days} day(s)`}</DetailItem>
              <DetailItem label="Half-day date">{request.is_half_day ? formatDate(request.half_day_date) : "Not applicable"}</DetailItem>
              <DetailItem label="Balance when submitted">{request.balance_at_request ?? "Not submitted"}</DetailItem>
              <DetailItem label="Created">{formatDate(request.createdAt)}</DetailItem>
              <DetailItem label="Reason" fullWidth>{request.reason || "No reason provided."}</DetailItem>
              <DetailItem label="Decision note" fullWidth>{request.decision_note || "No decision note."}</DetailItem>
            </div>

            <div className="request-document-section">
              <div>
                <strong>Supporting document</strong>
                <span>{request.document ? "A document is attached to this request." : "No document attached."}</span>
              </div>
              {request.document && (
                <button type="button" onClick={downloadDocument} disabled={downloading}>
                  {downloading ? "Downloading..." : "Download document"}
                </button>
              )}
            </div>
            {downloadError && <div className="request-download-error" role="alert">{downloadError}</div>}
          </div>
        )}
      </section>
    </div>
  );
}

export default LeaveRequestDetails;
