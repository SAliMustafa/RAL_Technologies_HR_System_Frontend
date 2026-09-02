import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import "../../components/css/Admin/AdminDocuments.css";

import {
  getAllDocuments,
  deleteDocument,
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

const AdminDocuments = () => {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter]);

  async function fetchDocuments() {
    try {
      setLoading(true);
      setError("");

      const data = await getAllDocuments();

      console.log("All Documents:", data);

      setDocuments(Array.isArray(data) ? data : data.documents || []);
    } catch (err) {
      console.log(err);

      setError(err?.response?.data?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDeactivate() {
  try {
    await deleteDocument(selectedDocumentId);

    setShowDeletePopup(false);
    setSelectedDocumentId(null);

    await fetchDocuments();

  } catch (err) {
    console.log(err);

    setError(
      err?.response?.data?.message ||
      "Failed to deactivate document"
    );
  }
}

  function handleDeactivate(documentId) {
    setSelectedDocumentId(documentId);
    setShowDeletePopup(true);
  }

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const employeeName =
        document?.employee_id?.name_en || document?.employee_id?.name_ar || "";

      const employeeCode = document?.employee_id?.employee_code || "";

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        employeeName.toLowerCase().includes(searchText) ||
        employeeCode.toLowerCase().includes(searchText) ||
        document.document_type?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" || document.status === statusFilter;

      const matchesType =
        typeFilter === "all" || document.document_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [documents, search, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedDocuments = filteredDocuments.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const summary = useMemo(() => {
    return {
      total: documents.length,

      verified: documents.filter((doc) => doc.status === "verified").length,

      pending: documents.filter((doc) => doc.status === "pending").length,

      rejected: documents.filter((doc) => doc.status === "rejected").length,
    };
  }, [documents]);

  function formatDocumentType(type) {
    if (!type) return "--";

    return type
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function formatDate(date) {
    if (!date) return "--";

    return new Date(date).toLocaleDateString("en-GB");
  }

  if (loading) {
    return (
      <main className="admin-documents-page">
        <p>Loading documents...</p>
      </main>
    );
  }

  return (
    <main className="admin-documents-page">
      {/* PAGE HEADER */}

      <section className="admin-documents-header">
        <div>
          <p className="admin-page-label">DOCUMENT MANAGEMENT</p>

          <h1>Employee Documents</h1>

          <p>View, review and manage employee documents.</p>
        </div>

        <button
          className="upload-document-btn"
          onClick={() => navigate("/admin/documents/upload")}
        >
          <span>+</span>
          Upload Document
        </button>
      </section>

      {/* ERROR */}
      {error && <div className="admin-documents-error">⚠ {error}</div>}

      {/* SUMMARY */}
      <section className="documents-summary-grid">
        <SummaryCard title="Total Documents" value={summary.total} icon="▤" />

        <SummaryCard
          title="Verified"
          value={summary.verified}
          icon="✓"
          type="verified"
        />

        <SummaryCard
          title="Pending"
          value={summary.pending}
          icon="◷"
          type="pending"
        />

        <SummaryCard
          title="Rejected"
          value={summary.rejected}
          icon="✕"
          type="rejected"
        />
      </section>

      {/* FILTERS */}
      <section className="documents-filter-card">
        <div className="documents-filter-header">
          <div>
            <h2>Documents List</h2>

            <p>Search and filter employee documents.</p>
          </div>

          <span className="document-record-count">
            {filteredDocuments.length} records
          </span>
        </div>

        <div className="documents-filter-row">
          {/* SEARCH */}
          <div className="document-search-box">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search employee, code or document..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* STATUS */}
          <div className="admin-filter-field">
            <label>Status</label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>

              <option value="verified">Verified</option>

              <option value="pending">Pending</option>

              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* DOCUMENT TYPE */}
          <div className="admin-filter-field">
            <label>Document Type</label>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>

              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatDocumentType(type)}
                </option>
              ))}
            </select>
          </div>

          {(search || statusFilter !== "all" || typeFilter !== "all") && (
            <button
              className="clear-documents-filter"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setTypeFilter("all");
              }}
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* TABLE */}
      <section className="admin-documents-table-card">
        {filteredDocuments.length === 0 ? (
          <div className="admin-documents-empty">
            <div>▤</div>

            <h3>No documents found</h3>

            <p>No documents match the selected filters.</p>
          </div>
        ) : (
          <table className="admin-documents-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Document</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
                <th>Status</th>

                <th>Active</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedDocuments.map((document) => (
                <tr
                  key={document._id}
                  className="document-table-row"
                  onClick={() => navigate(`/admin/documents/${document._id}`)}
                >
                  {/* EMPLOYEE */}
                  <td>
                    <div className="employee-table-info">
                      <div className="employee-table-avatar">
                        {document?.employee_id?.name_en
                          ?.charAt(0)
                          ?.toUpperCase() || "E"}
                      </div>

                      <div>
                        <strong>
                          {document?.employee_id?.name_en || "Unknown Employee"}
                        </strong>

                        <span>
                          {document?.employee_id?.employee_code || "--"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* TYPE */}
                  <td>
                    <span className="document-type-name">
                      {formatDocumentType(document.document_type)}
                    </span>
                  </td>

                  {/* ISSUE */}
                  <td>{formatDate(document.issue_date)}</td>

                  {/* EXPIRY */}
                  <td>{formatDate(document.expiry_date)}</td>

                  {/* STATUS */}
                  <td>
                    <StatusBadge status={document.status} />
                  </td>

                  <td>
                    {document.is_active ? (
                      <span className="active-status active">
                        <span>●</span>
                        Active
                      </span>
                    ) : (
                      <span className="active-status inactive">
                        <span>●</span>
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td>
                    <div className="document-table-actions">
                      {/* PENDING → REVIEW ONLY */}
                      {document.status === "pending" && document.is_active && (
                        <button
                          className="doc-action-btn review"
                          onClick={(e) => {
                            e.stopPropagation();

                            navigate(`/admin/documents/${document._id}/review`);
                          }}
                        >
                          Review
                        </button>
                      )}

                      {/* NOT PENDING → EDIT + DEACTIVATE */}
                      {document.status !== "pending" && document.is_active && (
                        <>
                          <button
                            className="doc-action-btn edit"
                            onClick={(e) => {
                              e.stopPropagation();

                              navigate(`/admin/documents/${document._id}/edit`);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="doc-action-btn delete"
                            onClick={(e) => {
                              e.stopPropagation();

                              handleDeactivate(document._id);
                            }}
                          >
                            Deactivate
                          </button>
                        </>
                      )}
                      {/* NOT PENDING → EDIT + DEACTIVATE */}
                      {document.status !== "pending" && !document.is_active && (
                        <>
                          <button
                            className="doc-action-btn edit"
                            onClick={(e) => {
                              e.stopPropagation();

                              navigate(`/admin/documents/${document._id}/edit`);
                            }}
                          >
                            Edit
                          </button>

                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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

        {/* Page Number */}
        {totalPages > 1 && (
          <div className="documents-pagination">
            <div className="pagination-info">
              Showing <strong>{startIndex + 1}</strong>
              {" - "}
              <strong>
                {Math.min(startIndex + itemsPerPage, filteredDocuments.length)}
              </strong>
              {" of "}
              <strong>{filteredDocuments.length}</strong>
            </div>

            <div className="pagination-buttons">
              <button
                className="pagination-arrow"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={
                      currentPage === page
                        ? "pagination-number active"
                        : "pagination-number"
                    }
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                className="pagination-arrow"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                →
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

function SummaryCard({ title, value, icon, type = "" }) {
  return (
    <article className="document-summary-card">
      <div className={`document-summary-icon ${type}`}>{icon}</div>

      <div>
        <span>{title}</span>

        <strong>{value}</strong>
      </div>
    </article>
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

  const current = statusData[status] || {
    icon: "•",
    label: status || "Unknown",
  };

  return (
    <span className={`admin-document-status status-${status}`}>
      <span>{current.icon}</span>

      {current.label}
    </span>
  );
}

export default AdminDocuments;
