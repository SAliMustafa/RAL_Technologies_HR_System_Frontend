import { useState } from "react";
import "./LeaveRequests.css";

function LeaveRequestDecisionDialog({ title, message, confirmLabel, saving, error, onConfirm, onClose }) {
  const [note, setNote] = useState("");
  const [validationError, setValidationError] = useState("");

  function submit() {
    if (!note.trim()) {
      setValidationError("A decision note is required.");
      return;
    }
    onConfirm(note.trim());
  }

  return (
    <div className="request-modal-backdrop">
      <section className="request-decision-modal" role="dialog" aria-modal="true" aria-labelledby="request-decision-title">
        <div className="request-modal-header">
          <div>
            <p>LEAVE REQUEST</p>
            <h2 id="request-decision-title">{title}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close">×</button>
        </div>
        <div className="request-decision-content">
          <p>{message}</p>
          {(validationError || error) && <div className="request-form-error" role="alert">{validationError || error}</div>}
          <label>
            Decision note <span>*</span>
            <textarea value={note} onChange={(event) => { setNote(event.target.value); setValidationError(""); }} maxLength="1000" rows="4" />
            <small>{note.length}/1000 characters</small>
          </label>
          <div className="request-form-actions">
            <button type="button" className="request-secondary-button" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="button" className="request-danger-button" onClick={submit} disabled={saving}>{saving ? "Please wait..." : confirmLabel}</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LeaveRequestDecisionDialog;
