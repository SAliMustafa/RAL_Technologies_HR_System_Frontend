import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import "../../components/css/Admin/EditAdminDocument.css";

import {
  getDocumentById,
  updateDocumentByHrAdmin,
} from "../../services/documentsService";

const DOCUMENT_TYPES = [
  "CPR",
  "passport",
  "work_permit",
  "visa",
  "employment_contract",
  "qualification",
  "health_insurance",
  "bank_letter",
];

const EditAdminDocument = () => {
  const navigate = useNavigate();
  const { documentId } = useParams();

  const [document, setDocument] = useState(null);

  const [formData, setFormData] = useState({
    document_type: "",
    issue_date: "",
    expiry_date: "",
    is_active: true,
    file: null,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  
  useEffect(() => {
    async function fetchDocument() {
      try {
        setLoading(true);

        const data = await getDocumentById(documentId);

        const currentDocument = data.document || data;

        console.log("Document:", currentDocument);

        setDocument(currentDocument);

        setFormData({
          document_type: currentDocument.document_type || "",

          issue_date: formatDateForInput(currentDocument.issue_date),

          expiry_date: formatDateForInput(currentDocument.expiry_date),

          is_active: currentDocument.is_active !== false,

          file: null,
        });
      } catch (err) {
        console.log(err);

        setError(err?.response?.data?.message || "Failed to load document");
      } finally {
        setLoading(false);
      }
    }

    fetchDocument();
  }, [documentId]);

  function formatDateForInput(date) {
    if (!date) return "";

    return new Date(date).toISOString().split("T")[0];
  }

  function formatDocumentType(type) {
    if (!type) return "--";

    return type
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];

    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      file,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.document_type) {
      setError("Document type is required.");
      return;
    }

    try {
      setSubmitting(true);

      const data = new FormData();

      data.append("document_type", formData.document_type);

      if (formData.issue_date) {
        data.append("issue_date", formData.issue_date);
      }

      if (formData.expiry_date) {
        data.append("expiry_date", formData.expiry_date);
      }

      data.append("is_active", String(formData.is_active));

      // file is optional
      if (formData.file) {
        data.append("file", formData.file);
      }

      const response = await updateDocumentByHrAdmin(documentId, data);

      console.log("Updated document:", response.document);

      setSuccess(response.message || "Document updated successfully.");

      setTimeout(() => {
        navigate(`/admin/documents/${documentId}`);
      }, 800);
    } catch (err) {
      console.log(err);

      setError(err?.response?.data?.message || "Failed to update document");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="admin-edit-document-page">
        <p>Loading document...</p>
      </main>
    );
  }

  if (!document) {
    return (
      <main className="admin-edit-document-page">
        <p>Document not found.</p>
      </main>
    );
  }

  const currentFileName = document?.file?.split(/[\\/]/).pop();

  const currentFileUrl = currentFileName
    ? `http://localhost:3000/image/${encodeURIComponent(currentFileName)}`
    : null;

  return (
    <main className="admin-edit-document-page">
      {/* BACK */}

      <button
        className="edit-document-back"
        onClick={() => navigate(`/admin/documents/${documentId}`)}
      >
        ← Back to Document
      </button>

      {/* HEADER */}

      <section className="edit-document-header">
        <div>
          <p className="edit-page-label">DOCUMENT MANAGEMENT</p>

          <h1>Edit Document</h1>

          <p>Update employee document information or replace the file.</p>
        </div>

        <div className="edit-document-status">
          <span className={`edit-status ${document.status}`}>
            {document.status === "verified" && "✓ Verified"}

            {document.status === "pending" && "◷ Pending"}

            {document.status === "rejected" && "✕ Rejected"}
          </span>

          <span
            className={
              document.is_active ? "edit-active active" : "edit-active inactive"
            }
          >
            ● {document.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </section>

      {/* ERROR */}

      {error && <div className="edit-document-message error">⚠ {error}</div>}

      {/* SUCCESS */}

      {success && (
        <div className="edit-document-message success">✓ {success}</div>
      )}

      <form className="edit-document-form" onSubmit={handleSubmit}>
        {/* EMPLOYEE */}

        <section className="edit-employee-section">
          <div className="edit-section-heading">
            <span>EMPLOYEE</span>

            <h2>Employee Information</h2>
          </div>

          <div className="edit-employee-info">
            <div className="edit-employee-avatar">
              {document?.employee_id?.name_en?.charAt(0)?.toUpperCase() || "E"}
            </div>

            <div>
              <strong>
                {document?.employee_id?.name_en || "Unknown Employee"}
              </strong>

              <span>{document?.employee_id?.employee_code || "--"}</span>
            </div>
          </div>
        </section>

        {/* DOCUMENT DETAILS */}

        <section className="edit-form-section">
          <div className="edit-section-heading">
            <span>DETAILS</span>

            <h2>Document Information</h2>
          </div>

          <div className="edit-form-grid">
            {/* TYPE */}

            <div className="edit-form-group">
              <label>
                Document Type
                <span>*</span>
              </label>

              <select
                name="document_type"
                value={formData.document_type}
                onChange={handleChange}
              >
                <option value="">Select document type</option>

                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatDocumentType(type)}
                  </option>
                ))}
              </select>
            </div>

            {/* ISSUE DATE */}

            <div className="edit-form-group">
              <label>Issue Date</label>

              <input
                type="date"
                name="issue_date"
                value={formData.issue_date}
                onChange={handleChange}
              />
            </div>

            {/* EXPIRY */}

            <div className="edit-form-group">
              <label>Expiry Date</label>

              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
              />

              <small>Leave empty if the document does not expire.</small>
            </div>
            <div className="edit-form-group">
              <label>Document Status</label>

              <select
                name="is_active"
                value={String(formData.is_active)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_active: e.target.value === "true",
                  }))
                }
              >
                <option value="true">Active</option>

                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </section>

        {/* CURRENT FILE */}

        <section className="edit-form-section">
          <div className="edit-section-heading">
            <span>FILE</span>

            <h2>Document File</h2>
          </div>

          {currentFileUrl ? (
            <div className="current-document-file">
              <div className="current-file-left">
                <div className="current-file-icon">▤</div>

                <div>
                  <span>Current File</span>

                  <strong>{currentFileName}</strong>
                </div>
              </div>

              <a href={currentFileUrl} target="_blank" rel="noreferrer">
                Open File ↗
              </a>
            </div>
          ) : (
            <div className="no-current-file">No current file available.</div>
          )}

          {/* REPLACE FILE */}

          <div className="replace-file-section">
            <label className="replace-file-label">Replace File</label>

            <label className="edit-file-upload">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
              />

              {!formData.file ? (
                <div className="edit-file-empty">
                  <div className="edit-upload-icon">↑</div>

                  <div>
                    <strong>Choose new file</strong>

                    <span>Optional — leave empty to keep the current file</span>
                  </div>
                </div>
              ) : (
                <div className="edit-selected-file">
                  <div className="edit-upload-icon">▤</div>

                  <div>
                    <strong>{formData.file.name}</strong>

                    <span>
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              )}
            </label>
          </div>
        </section>

        {/* REJECTED INFO */}

        {document.status === "rejected" && document.rejection_reason && (
          <section className="edit-rejection-info">
            <span>✕</span>

            <div>
              <strong>Previous Rejection Reason</strong>

              <p>{document.rejection_reason}</p>
            </div>
          </section>
        )}

        {/* ACTIONS */}

        <div className="edit-document-actions">
          <button
            type="button"
            className="edit-cancel-btn"
            onClick={() => navigate(`/admin/documents/${documentId}`)}
          >
            Cancel
          </button>

          <button type="submit" className="edit-save-btn" disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default EditAdminDocument;
