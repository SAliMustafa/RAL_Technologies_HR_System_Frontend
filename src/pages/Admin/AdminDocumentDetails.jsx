import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import "../../components/css/Admin/AdminDocumentDetails.css";

import {
  getDocumentById,
  deleteDocument,
} from "../../services/documentsService";

const AdminDocumentDetails = () => {
  const navigate = useNavigate();
  const { documentId } = useParams();

  const [document, setDocument] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  async function fetchDocument() {
    try {
      setLoading(true);
      setError("");

      const data = await getDocumentById(documentId);

      console.log("Document:", data);

      setDocument(data.document || data);
    } catch (err) {
      console.log(err);

      setError(err?.response?.data?.message || "Failed to load document");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDeactivate() {
    try {
      await deleteDocument(selectedDocumentId);

      // Close popup
      setShowDeletePopup(false);
      setSelectedDocumentId(null);

      // Get fresh documents from backend
      await fetchDocuments();
    } catch (err) {
      console.log(err);

      setError(err?.response?.data?.message || "Failed to deactivate document");
    }
  }

  function handleDeactivate(documentId) {
    setSelectedDocumentId(documentId);
    setShowDeletePopup(true);
  }

  function formatDate(date) {
    if (!date) return "--";

    return new Date(date).toLocaleDateString("en-GB");
  }

  function formatDateTime(date) {
    if (!date) return "--";

    return new Date(date).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function formatDocumentType(type) {
    if (!type) return "--";

    return type
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  if (loading) {
    return (
      <main className="admin-document-details-page">
        <p>Loading document...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-document-details-page">
        <div className="document-details-error">⚠ {error}</div>
      </main>
    );
  }

  if (!document) {
    return (
      <main className="admin-document-details-page">
        <p>Document not found.</p>
      </main>
    );
  }

  const fileName = document?.file?.split(/[\\/]/).pop();

  const fileUrl = fileName
    ? `http://localhost:3000/image/${encodeURIComponent(fileName)}`
    : null;

  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(fileName || "");

  const isPdf = /\.pdf$/i.test(fileName || "");

  const employee = document.employee_id;

  return (
    <main className="admin-document-details-page">
      {/* BACK */}
      <button
        className="document-details-back"
        onClick={() => navigate("/admin/documents")}
      >
        ← Back to Documents
      </button>

      {/* HEADER */}
      <section className="admin-document-details-header">
        <div>
          <p className="details-page-label">DOCUMENT MANAGEMENT</p>

          <h1>{formatDocumentType(document.document_type)}</h1>

          <p>View employee document information and verification details.</p>
        </div>

        <div className="document-header-actions">
          <StatusBadge status={document.status} />

          <ActiveBadge active={document.is_active} />
        </div>
      </section>

      {/* ACTION BAR */}
      <section className="document-details-actions">
        {/* Pending */}
        {document.status === "pending" && document.is_active && (
          <button
            className="details-review-btn"
            onClick={() => navigate(`/admin/documents/${document._id}/review`)}
          >
            Review Document
          </button>
        )}

        {/* Verified or Rejected */}
        {document.is_active &&
          ["verified", "rejected"].includes(document.status) && (
            <>
              <button
                className="details-edit-btn"
                onClick={() =>
                  navigate(`/admin/documents/${document._id}/edit`)
                }
              >
                Edit Document
              </button>

              <button
                className="details-deactivate-btn"
                onClick={handleDeactivate}
              >
                Deactivate
              </button>
            </>
          )}

        {/* Inactive */}
        {!document.is_active && (
          <button
            className="details-edit-btn"
            onClick={() => navigate(`/admin/documents/${document._id}/edit`)}
          >
            Edit Document
          </button>
        )}
      </section>

      {/* EMPLOYEE */}
      <section className="document-details-card">
        <div className="details-card-header">
          <div>
            <span>EMPLOYEE</span>

            <h2>Employee Information</h2>
          </div>
        </div>

        <div className="employee-details-box">
          <div className="details-employee-avatar">
            {document?.employee_id?.name_en?.charAt(0)?.toUpperCase() || "E"}
          </div>

          <div className="details-employee-main">
            <strong>{document?.employee_id?.name_en || "Unknown Employee"}</strong>

            <span>{document?.employee_id?.employee_code || "--"}</span>
          </div>

          <div className="employee-meta">
            <div>
              <span>Department</span>

              <strong>{document.employee_id?.department || "--"}</strong>
            </div>

            <div>
              <span>Job Title</span>

              <strong>{document?.employee_id?.job_title || "--"}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* DOCUMENT INFO */}
      <section className="document-details-card">
        <div className="details-card-header">
          <div>
            <span>DETAILS</span>

            <h2>Document Information</h2>
          </div>
        </div>

        <div className="document-information-grid">
          <DetailsItem
            label="Document Type"
            value={formatDocumentType(document.document_type)}
          />

          <DetailsItem
            label="Document Number"
            value={document.document_number || "--"}
          />

          <DetailsItem
            label="Issue Date"
            value={formatDate(document.issue_date)}
          />

          <DetailsItem
            label="Expiry Date"
            value={formatDate(document.expiry_date)}
          />

          <DetailsItem
            label="Status"
            value={
              document.status
                ? document.status.charAt(0).toUpperCase() +
                  document.status.slice(1)
                : "--"
            }
          />

          <DetailsItem
            label="Active"
            value={document.is_active ? "Yes" : "No"}
          />
        </div>
      </section>

      {/* PREVIEW */}
      <section className="document-details-card">
        <div className="details-card-header preview-header">
          <div>
            <span>FILE</span>

            <h2>Document Preview</h2>
          </div>

          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="open-document-btn"
            >
              Open in new tab ↗
            </a>
          )}
        </div>

        <div className="admin-document-preview">
          {!fileUrl && (
            <div className="preview-unavailable">
              <span>▤</span>

              <strong>No file available</strong>
            </div>
          )}

          {fileUrl && isImage && (
            <img
              src={fileUrl}
              alt={formatDocumentType(document.document_type)}
              className="admin-document-image"
            />
          )}

          {fileUrl && isPdf && (
            <iframe
              src={fileUrl}
              title="Document PDF"
              className="admin-document-pdf"
            />
          )}

          {fileUrl && !isImage && !isPdf && (
            <div className="preview-unavailable">
              <span>📎</span>

              <strong>Preview unavailable</strong>

              <p>Open the file in a new tab to view it.</p>
            </div>
          )}
        </div>
      </section>

      {/* REVIEW INFORMATION */}
      <section className="document-details-card">
        <div className="details-card-header">
          <div>
            <span>VERIFICATION</span>

            <h2>Verification Information</h2>
          </div>
        </div>

        {document.status === "pending" && (
          <div className="verification-message pending">
            <span>◷</span>

            <div>
              <strong>Waiting for Review</strong>

              <p>This document has not been reviewed yet.</p>
            </div>
          </div>
        )}

        {document.status === "verified" && (
          <div className="verification-details">
            <DetailsItem
              label="Verified By"
              value={
                document?.verified_by?.username ||
                document?.verified_by?.name_en ||
                "HR Admin"
              }
            />

            <DetailsItem
              label="Verified On"
              value={formatDateTime(document.verified_on)}
            />
          </div>
        )}

        {document.status === "rejected" && (
          <>
            <div className="verification-message rejected">
              <span>✕</span>

              <div>
                <strong>Document Rejected</strong>

                <p>This document was rejected during HR review.</p>
              </div>
            </div>

            <div className="rejection-reason-box">
              <span>REJECTION REASON</span>

              <p>
                {document.rejection_reason || "No rejection reason provided."}
              </p>
            </div>
          </>
        )}
      </section>
      {showDeletePopup && (
        <div className="popup-overlay">
          <div className="delete-popup">
            <h3>Deactivate Document</h3>

            <p>Are you sure you want to deactivate this document?</p>

            <div className="popup-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowDeletePopup(false);
                  setSelectedDocumentId(null);
                }}
              >
                Cancel
              </button>

              <button className="delete-btn" onClick={confirmDeactivate}>
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

function DetailsItem({ label, value }) {
  return (
    <div className="details-item">
      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusData = {
    verified: {
      icon: "✓",
      label: "Verified",
    },

    pending: {
      icon: "◷",
      label: "Pending",
    },

    rejected: {
      icon: "✕",
      label: "Rejected",
    },
  };

  const item = statusData[status] || {
    icon: "•",
    label: status || "Unknown",
  };

  return (
    <span className={`details-status-badge ${status}`}>
      {item.icon} {item.label}
    </span>
  );
}

function ActiveBadge({ active }) {
  return (
    <span
      className={
        active ? "details-active-badge active" : "details-active-badge inactive"
      }
    >
      ● {active ? "Active" : "Inactive"}
    </span>
  );
}

export default AdminDocumentDetails;
