import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getDocumentById } from "../../services/employeeService";
import "../../components/css/Employee/DocumentDetails.css";

const DocumentDetails = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDocument() {
      try {
        const data = await getDocumentById(documentId);

        console.log(data);

        setDocument(data);
      } catch (err) {
        // console.log(err);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Failed to load document",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDocument();
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-GB");
  };

  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return null;

    const today = new Date();
    const expiry = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  const formatDocumentType = (type) => {
    if (!type) return "Document";

    return type
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return (
      <main className="document-details-page">
        <p>Loading document...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="document-details-page">
        <div className="document-details-error">⚠ {error}</div>
      </main>
    );
  }

  if (!document) {
    return (
      <main className="document-details-page">
        <p>Document not found.</p>
      </main>
    );
  }

  const daysRemaining = getDaysRemaining(document.expiry_date);
  const fileName = document?.file?.split("\\").pop();

  const fileUrl = `http://localhost:3000/image/${encodeURIComponent(fileName)}`;
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(document.file);
  const isPdf = /\.pdf$/i.test(document.file);
  return (
    <main className="document-details-page">
      {/* HEADER */}
      <div className="document-details-header">
        <div>
          <button
            className="details-back-btn"
            onClick={() => navigate("/mydocuments")}
          >
            ← Back
          </button>

          <h1>{formatDocumentType(document.document_type)}</h1>

          <p>View your document information and verification status.</p>
        </div>

        <StatusBadge status={document.status} />
      </div>

     

      {/* DOCUMENT INFORMATION */}
      <section className="document-details-card">
        <h2>Document Information</h2>

        <div className="document-details-grid">
          <DetailsItem
            label="Document Type"
            value={formatDocumentType(document.document_type)}
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
            value={<StatusBadge status={document.status} />}
          />
        </div>
      </section>

      {/* EXPIRY INFORMATION */}
      {document.expiry_date && document.status === "verified" && (
        <section className="document-details-card">
          <h2>Expiry Information</h2>

          {daysRemaining < 0 ? (
            <div className="expiry-box expiry-danger">
              ⚠
              <div>
                <strong>Document Expired</strong>

                <p>This document expired {Math.abs(daysRemaining)} days ago.</p>
              </div>
            </div>
          ) : daysRemaining <= 90 ? (
            <div className="expiry-box expiry-warning">
              ⚠
              <div>
                <strong>Expiring Soon</strong>

                <p>This document will expire in {daysRemaining} days.</p>
              </div>
            </div>
          ) : (
            <div className="expiry-box expiry-valid">
              ✓
              <div>
                <strong>Document Valid</strong>

                <p>This document is valid for {daysRemaining} more days.</p>
              </div>
            </div>
          )}
        </section>
      )}
       {/* DOCUMENT PREVIEW */}
     <section className="document-preview-card">

  <div className="document-preview-header">
    <div className="document-preview-title">
      <div className="document-preview-icon">📄</div>

      <div>
        <h2>
          {formatDocumentType(document.document_type)}
        </h2>

        <p>
          {isPdf ? "PDF Document" : isImage ? "Image Document" : "Document File"}
        </p>
      </div>
    </div>

    <a
      href={fileUrl}
      target="_blank"
      rel="noreferrer"
      className="preview-open-btn"
    >
      Open in new tab ↗
    </a>
  </div>


  <div className="document-preview-body">

    {document?.file ? (
      <>
        {isImage && (
          <img
            src={fileUrl}
            alt={formatDocumentType(document.document_type)}
            className="document-image-preview"
          />
        )}

        {isPdf && (
          <iframe
            src={fileUrl}
            title="PDF Document"
            className="document-pdf-preview"
          />
        )}

        {!isImage && !isPdf && (
          <div className="unsupported-document">
            <span>📎</span>

            <h3>Preview not available</h3>

            <p>
              Open the document in a new tab to view it.
            </p>

            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open Document
            </a>
          </div>
        )}
      </>
    ) : (
      <div className="unsupported-document">
        <span>📄</span>

        <h3>No file available</h3>

        <p>
          There is no uploaded file for this document.
        </p>
      </div>
    )}

  </div>

</section>

      {/* VERIFICATION */}
      <section className="document-details-card">
        <h2>Verification Information</h2>

        {document.status === "pending" && (
          <div className="verification-box verification-pending">
            <span>⏳</span>

            <div>
              <strong>Waiting for HR verification</strong>

              <p>
                Your document has been submitted and is waiting for HR review.
              </p>
            </div>
          </div>
        )}

        {document.status === "verified" && (
          <>
            <div className="verification-box verification-success">
              <span>✓</span>

              <div>
                <strong>Document Verified</strong>

                <p>HR has reviewed and verified this document.</p>
              </div>
            </div>

            <div className="document-details-grid verification-details">
              <DetailsItem
                label="Verified On"
                value={formatDate(document.verified_on)}
              />

              <DetailsItem
                label="Verified By"
                value={
                  document.verified_by?.username ||
                  document.verified_by?.name_en ||
                  "HR Admin"
                }
              />
            </div>
          </>
        )}

        {document.status === "rejected" && (
          <div className="rejected-document-section">
            <div className="verification-box verification-rejected">
              <span>✕</span>

              <div>
                <strong>Document Rejected</strong>

                <p>HR rejected this document. Please check the reason below.</p>
              </div>
            </div>

            <div className="rejection-reason">
              <span>Rejection Reason</span>

              <p>
                {document.rejection_reason || "No rejection reason provided."}
              </p>
            </div>

            <button
              className="resubmit-document-btn"
              onClick={() => navigate(`/documents/${document._id}/edit`)}
            >
              Upload Again
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

const DetailsItem = ({ label, value }) => {
  return (
    <div className="details-item">
      <span className="details-label">{label}</span>

      <div className="details-value">{value || "—"}</div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const icons = {
    verified: "✓",
    pending: "⏳",
    rejected: "✕",
  };

  return (
    <span className={`details-status status-${status}`}>
      {icons[status] || "•"}

      {status || "Unknown"}
    </span>
  );
};

export default DocumentDetails;
