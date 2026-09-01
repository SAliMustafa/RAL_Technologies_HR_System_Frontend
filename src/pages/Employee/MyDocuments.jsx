import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {  getMyDocuments,getExpiryAlerts,}  from "../../services/documentsService";
import "../../components/css/Employee/MyDocuments.css";
import Navbar from "../../components/Navbar";

const MyDocuments = () => {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expiryAlerts, setExpiryAlerts] = useState([]);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const data = await getMyDocuments();

        console.log(data);

        setDocuments(data);

        const datayAlerts = await getExpiryAlerts();

        console.log("Expiry alerts:", datayAlerts);

        setExpiryAlerts(datayAlerts);
      } catch (err) {
        console.log(err);

        setError(err?.response?.data?.message || "Failed to load documents");
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, []);

  const formatDate = (date) => {
    if (!date) return "No expiry date";

    return new Date(date).toLocaleDateString("en-GB");
  };

  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return null;

    const today = new Date();
    const expiry = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const difference = expiry - today;

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  const verifiedCount = documents.filter(
    (doc) => doc.status === "verified",
  ).length;

  const pendingCount = documents.filter(
    (doc) => doc.status === "pending",
  ).length;

  const rejectedCount = documents.filter(
    (doc) => doc.status === "rejected",
  ).length;

  const expiringCount = documents.filter((doc) => {
    if (doc.status !== "verified") return false;

    const days = getDaysRemaining(doc.expiry_date);

    return days !== null && days >= 0 && days <= 90;
  }).length;

  if (loading) {
    return (
      <main className="documents-page">
        <p>Loading documents...</p>
      </main>
    );
  }

  return (
      <main className="documents-page">
          {/* <Navbar/> */}
      {/* HEADER */}
      <div className="documents-header">
        <div>
          <h1>My Documents</h1>

          <p>View and manage your employee documents.</p>
        </div>

        <button
          className="upload-document-btn"
          onClick={() => navigate("/documents/upload")}
        >
          + Upload Document
        </button>
      </div>

      {/* ERROR */}
      {error && <div className="documents-error">⚠ {error}</div>}

      {/* SUMMARY */}
      <section className="documents-summary">
        <SummaryCard title="Total" value={documents.length} />

        <SummaryCard
          title="Verified"
          value={verifiedCount}
          className="summary-verified"
        />

        <SummaryCard
          title="Pending"
          value={pendingCount}
          className="summary-pending"
        />

        <SummaryCard
          title="Rejected"
          value={rejectedCount}
          className="summary-rejected"
        />

        <SummaryCard
          title="Expiring Soon"
          value={expiringCount}
          className="summary-expiring"
        />
      </section>

      {/* Expiry Alerts  */}
        {expiryAlerts.length > 0 && (
        <section className="expiry-alerts">
          <div className="expiry-alerts-header">
            <div>
              <h2>Document Alerts</h2>
              <p>Documents that need your attention soon.</p>
            </div>

            <span className="expiry-alert-count">{expiryAlerts.length}</span>
          </div>

          <div className="expiry-alert-list">
            {expiryAlerts.map((alert, index) => (
              <div key={index} className="expiry-alert">
                <div className="expiry-alert-icon">⚠</div>

                <div className="expiry-alert-content">
                  <div className="expiry-alert-top">
                    <strong>
                      {alert.document_type
                        .replaceAll("_", " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </strong>

                    <span className="expiry-days-badge">
                      {alert.daysRemaining} days
                    </span>
                  </div>

                  <p>{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* DOCUMENT LIST */}

    
      {documents.length === 0 ? (
        <section className="empty-documents">
          <h2>No Documents</h2>

          <p>You have not uploaded any documents yet.</p>

          <button onClick={() => navigate("/documents/upload")}>
            Upload Your First Document
          </button>
        </section>
      ) : (
        <section className="documents-grid">
          {documents.map((document) => {
            const daysRemaining = getDaysRemaining(document.expiry_date);

            return (
              <DocumentCard
                key={document._id}
                document={document}
                daysRemaining={daysRemaining}
                formatDate={formatDate}
                onView={() => navigate(`/documents/${document._id}`)}
              />
            );
          })}
        </section>
      )}
    </main>
  );
};

const SummaryCard = ({ title, value, className = "" }) => {
  return (
    <div className={`summary-card ${className}`}>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
};

const DocumentCard = ({ document, daysRemaining, formatDate, onView }) => {
  const getStatusIcon = () => {
    if (document.status === "verified") return "✓";

    if (document.status === "pending") return "⏳";

    if (document.status === "rejected") return "✕";

    return "•";
  };

  const getExpiryMessage = () => {
    if (!document.expiry_date) {
      return "No expiry date";
    }

    if (daysRemaining < 0) {
      return `Expired ${Math.abs(daysRemaining)} days ago`;
    }

    if (daysRemaining === 0) {
      return "Expires today";
    }

    if (daysRemaining <= 7) {
      return `Expires in ${daysRemaining} days`;
    }

    if (daysRemaining <= 30) {
      return `Expires in ${daysRemaining} days`;
    }

    if (daysRemaining <= 90) {
      return `Expires in ${daysRemaining} days`;
    }

    return `Valid for ${daysRemaining} days`;
  };

  return (
    <article className="document-card">
      <div className="document-card-header">
        <div className="document-icon">📄</div>

        <div>
          <h2>{document.document_type?.replaceAll("_", " ")}</h2>

          {document.document_number && <p>{document.document_number}</p>}
        </div>
      </div>

      <div className="document-information">
        <div>
          <span>Issue Date</span>

          <strong>
            {document.issue_date ? formatDate(document.issue_date) : "—"}
          </strong>
        </div>

        <div>
          <span>Expiry Date</span>

          <strong>
            {document.expiry_date ? formatDate(document.expiry_date) : "—"}
          </strong>
        </div>
      </div>

      {/* STATUS */}
      <div className={`document-status status-${document.status}`}>
        <span>{getStatusIcon()}</span>

        <span>{document.status}</span>
      </div>

      {/* EXPIRY */}
      {document.status === "verified" && document.expiry_date && (
        <div
          className={
            daysRemaining < 0
              ? "expiry-message expiry-expired"
              : daysRemaining <= 90
                ? "expiry-message expiry-warning"
                : "expiry-message"
          }
        >
          {daysRemaining < 0 ? "⚠" : "◷"}

          {getExpiryMessage()}
        </div>
      )}

      <div className="document-actions">
        <button className="view-document-btn" onClick={onView}>
          View Document
        </button>
      </div>
    </article>
  );
};

export default MyDocuments;
