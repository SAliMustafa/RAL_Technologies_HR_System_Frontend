import "./LeaveRequests.css";

function LeaveRequestConfirmDialog({ title, message, confirmLabel, danger = false, saving, error, onConfirm, onClose }) {
  return (
    <div className="request-modal-backdrop">
      <section className="request-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="request-confirm-title">
        <div className={`request-confirm-icon ${danger ? "danger" : ""}`}>!</div>
        <h2 id="request-confirm-title">{title}</h2>
        <p>{message}</p>
        {error && <div className="request-form-error" role="alert">{error}</div>}
        <div className="request-form-actions">
          <button type="button" className="request-secondary-button" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="button" className={danger ? "request-danger-button" : "request-primary-button"} onClick={() => onConfirm()} disabled={saving}>
            {saving ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export default LeaveRequestConfirmDialog;
