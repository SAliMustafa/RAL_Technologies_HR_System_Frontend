import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import "../../components/css/Admin/ReviewDocument.css";

import {
  getDocumentById,
  reviewDocument,
} from "../../services/documentsService";


const ReviewDocument = () => {
  const navigate = useNavigate();
  const { documentId } = useParams();

  const [document, setDocument] = useState(null);

  const [status, setStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  useEffect(() => {
    async function fetchDocument() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getDocumentById(documentId);

        const currentDocument =
          data.document || data;

        console.log(
          "Review Document:",
          currentDocument
        );

        setDocument(currentDocument);

      } catch (err) {
        console.log(err);

        setError(
          err?.response?.data?.message ||
          "Failed to load document"
        );

      } finally {
        setLoading(false);
      }
    }

    fetchDocument();

  }, [documentId]);


  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");


    if (!status) {
      setError(
        "Please select Verify or Reject."
      );

      return;
    }


    if (
      status === "rejected" &&
      !rejectionReason.trim()
    ) {
      setError(
        "Rejection reason is required."
      );

      return;
    }


    try {
      setSubmitting(true);

      const body = {
        status,
      };


      if (status === "rejected") {
        body.rejection_reason =
          rejectionReason.trim();
      }


      const response =
        await reviewDocument(
          documentId,
          body
        );


      console.log(
        "Review response:",
        response
      );


      setSuccess(
        response.message ||
        "Document reviewed successfully."
      );


      setTimeout(() => {
        navigate(
          `/admin/documents/${documentId}`
        );
      }, 800);

    } catch (err) {
      console.log(err);

      setError(
        err?.response?.data?.message ||
        "Failed to review document"
      );

    } finally {
      setSubmitting(false);
    }
  }


  function formatDocumentType(type) {
    if (!type) return "--";

    return type
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }


  function formatDate(date) {
    if (!date) return "--";

    return new Date(date)
      .toLocaleDateString("en-GB");
  }


  if (loading) {
    return (
      <main className="review-document-page">
        <p>Loading document...</p>
      </main>
    );
  }


  if (!document) {
    return (
      <main className="review-document-page">
        <p>Document not found.</p>
      </main>
    );
  }


  const employee =
    document.employee_id;


  const fileName =
    document?.file
      ?.split(/[\\/]/)
      .pop();


  const fileUrl = fileName
    ? `http://localhost:3000/image/${encodeURIComponent(
        fileName
      )}`
    : null;


  const isImage =
    /\.(jpg|jpeg|png|webp)$/i.test(
      fileName || ""
    );


  const isPdf =
    /\.pdf$/i.test(
      fileName || ""
    );


  return (
    <main className="review-document-page">

      {/* BACK */}

      <button
        className="review-back-btn"
        onClick={() =>
          navigate(
            `/admin/documents/${documentId}`
          )
        }
      >
        ← Back to Document
      </button>


      {/* HEADER */}

      <section className="review-page-header">

        <div>
          <p className="review-page-label">
            DOCUMENT MANAGEMENT
          </p>

          <h1>Review Document</h1>

          <p>
            Review the employee document and
            approve or reject it.
          </p>
        </div>


        <span className="review-pending-badge">
          ◷ Pending Review
        </span>

      </section>


      {/* ERROR */}

      {error && (
        <div className="review-message error">
          ⚠ {error}
        </div>
      )}


      {/* SUCCESS */}

      {success && (
        <div className="review-message success">
          ✓ {success}
        </div>
      )}


      {/* MAIN GRID */}

      <div className="review-main-grid">

        {/* LEFT SIDE */}

        <div className="review-left">

          {/* EMPLOYEE */}

          <section className="review-card">

            <div className="review-card-header">

              <span>EMPLOYEE</span>

              <h2>
                Employee Information
              </h2>

            </div>


            <div className="review-employee">

              <div className="review-employee-avatar">
                {employee?.name_en
                  ?.charAt(0)
                  ?.toUpperCase() || "E"}
              </div>


              <div>
                <strong>
                  {employee?.name_en ||
                    "Unknown Employee"}
                </strong>

                <span>
                  {employee?.employee_code ||
                    "--"}
                </span>
              </div>

            </div>

          </section>


          {/* DOCUMENT INFO */}

          <section className="review-card">

            <div className="review-card-header">

              <span>DOCUMENT</span>

              <h2>
                Document Information
              </h2>

            </div>


            <div className="review-info-grid">

              <InfoItem
                label="Document Type"
                value={formatDocumentType(
                  document.document_type
                )}
              />


              <InfoItem
                label="Issue Date"
                value={formatDate(
                  document.issue_date
                )}
              />


              <InfoItem
                label="Expiry Date"
                value={formatDate(
                  document.expiry_date
                )}
              />


              <InfoItem
                label="Current Status"
                value="Pending"
              />

            </div>

          </section>


          {/* FILE PREVIEW */}

          <section className="review-card">

            <div className="review-card-header preview-header">

              <div>
                <span>FILE</span>

                <h2>
                  Document Preview
                </h2>
              </div>


              {fileUrl && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="review-open-file"
                >
                  Open in new tab ↗
                </a>
              )}

            </div>


            <div className="review-file-preview">

              {!fileUrl && (
                <div className="review-no-preview">
                  <strong>
                    No file available
                  </strong>
                </div>
              )}


              {fileUrl && isImage && (
                <img
                  src={fileUrl}
                  alt="Document"
                  className="review-image-preview"
                />
              )}


              {fileUrl && isPdf && (
                <iframe
                  src={fileUrl}
                  title="Document PDF"
                  className="review-pdf-preview"
                />
              )}


              {fileUrl &&
                !isImage &&
                !isPdf && (
                  <div className="review-no-preview">

                    <strong>
                      Preview unavailable
                    </strong>

                    <p>
                      Open the document in a
                      new tab.
                    </p>

                  </div>
                )}

            </div>

          </section>

        </div>


        {/* RIGHT SIDE - REVIEW */}

        <aside className="review-decision-card">

          <div className="review-decision-header">

            <span>REVIEW</span>

            <h2>
              Review Decision
            </h2>

            <p>
              Choose whether this document
              should be verified or rejected.
            </p>

          </div>


          <form onSubmit={handleSubmit}>

            {/* VERIFY */}

            <label
              className={
                status === "verified"
                  ? "decision-option verify selected"
                  : "decision-option verify"
              }
            >

              <input
                type="radio"
                name="status"
                value="verified"
                checked={
                  status === "verified"
                }
                onChange={(e) => {
                  setStatus(e.target.value);

                  setRejectionReason("");
                }}
              />


              <div className="decision-icon">
                ✓
              </div>


              <div>
                <strong>
                  Verify Document
                </strong>

                <span>
                  Document information is
                  valid and approved.
                </span>
              </div>

            </label>


            {/* REJECT */}

            <label
              className={
                status === "rejected"
                  ? "decision-option reject selected"
                  : "decision-option reject"
              }
            >

              <input
                type="radio"
                name="status"
                value="rejected"
                checked={
                  status === "rejected"
                }
                onChange={(e) =>
                  setStatus(e.target.value)
                }
              />


              <div className="decision-icon">
                ✕
              </div>


              <div>
                <strong>
                  Reject Document
                </strong>

                <span>
                  Document requires correction
                  or replacement.
                </span>
              </div>

            </label>


            {/* REJECTION REASON */}

            {status === "rejected" && (
              <div className="rejection-input">

                <label>
                  Rejection Reason
                  <span>*</span>
                </label>

                <textarea
                  value={rejectionReason}
                  onChange={(e) =>
                    setRejectionReason(
                      e.target.value
                    )
                  }
                  placeholder="Explain why this document is being rejected..."
                  rows="5"
                />

                <small>
                  This reason will be visible
                  to the employee.
                </small>

              </div>
            )}


            {/* ACTIONS */}

            <div className="review-actions">

              <button
                type="button"
                className="review-cancel-btn"
                onClick={() =>
                  navigate(
                    `/admin/documents/${documentId}`
                  )
                }
              >
                Cancel
              </button>


              <button
                type="submit"
                className={
                  status === "rejected"
                    ? "review-submit-btn reject"
                    : "review-submit-btn"
                }
                disabled={
                  submitting ||
                  !status
                }
              >
                {submitting
                  ? "Submitting..."
                  : status === "verified"
                  ? "Verify Document"
                  : status === "rejected"
                  ? "Reject Document"
                  : "Submit Review"}
              </button>

            </div>

          </form>

        </aside>

      </div>

    </main>
  );
};


function InfoItem({ label, value }) {
  return (
    <div className="review-info-item">

      <span>{label}</span>

      <strong>{value}</strong>

    </div>
  );
}


export default ReviewDocument;