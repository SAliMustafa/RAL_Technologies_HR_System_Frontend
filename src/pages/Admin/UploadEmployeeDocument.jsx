import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "../../components/css/Admin/UploadEmployeeDocument.css";

import { uploadDocumentByHrAdmin } from "../../services/documentsService";

import { getAllEmployees } from "../../services/employeeService";

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

const UploadEmployeeDocument = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    employee_id: "",
    document_type: "",
    document_number: "",
    issue_date: "",
    expiry_date: "",
    file: null,
  });

  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const data = await getAllEmployees();

        console.log("Employees:", data);

        setEmployees(Array.isArray(data) ? data : data.employees || []);
      } catch (err) {
        console.log(err);

        setError(err?.response?.data?.message || "Failed to load employees");
      } finally {
        setLoadingEmployees(false);
      }
    }

    fetchEmployees();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];

    setFormData((prev) => ({
      ...prev,
      file,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.employee_id) {
      setError("Please select an employee.");
      return;
    }

    if (!formData.document_type) {
      setError("Please select a document type.");
      return;
    }

    if (!formData.file) {
      setError("Please select a document file.");
      return;
    }

    try {
      setSubmitting(true);

      //   console.log( formData.employee_id);

      const data = new FormData();

      data.append("document_type", formData.document_type);

      if (formData.document_number) {
        data.append("document_number", formData.document_number);
      }

      if (formData.issue_date) {
        data.append("issue_date", formData.issue_date);
      }

      if (formData.expiry_date) {
        data.append("expiry_date", formData.expiry_date);
      }

      data.append("file", formData.file);

      const response = await uploadDocumentByHrAdmin(
        formData.employee_id,
        data,
      );

      console.log("Uploaded document:", response);

      setSuccess("Document uploaded successfully.");

      setTimeout(() => {
        navigate("/admin/documents");
      }, 1000);
    } catch (err) {
      console.log(err);

      setError(err?.response?.data?.message || "Failed to upload document");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDocumentType(type) {
    return type
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  return (
    <main className="admin-upload-document-page">
      {/* BACK */}
      <button
        className="upload-back-btn"
        onClick={() => navigate("/admin/documents")}
      >
        ← Back to Documents
      </button>

      {/* HEADER */}
      <section className="upload-document-header">
        <p className="upload-page-label">DOCUMENT MANAGEMENT</p>

        <h1>Upload Document</h1>

        <p>Upload a document on behalf of an employee.</p>
      </section>

      {/* MESSAGES */}

      {error && <div className="upload-message error">⚠ {error}</div>}

      {success && <div className="upload-message success">✓ {success}</div>}

      {/* FORM */}
      <form className="admin-upload-form" onSubmit={handleSubmit}>
        <div className="upload-form-heading">
          <div>
            <h2>Document Information</h2>

            <p>Select the employee and enter the document details.</p>
          </div>

          <span className="auto-verified-badge">✓ HR Upload</span>
        </div>

        {/* EMPLOYEE */}
        <div className="upload-form-group full-width">
          <label>
            Employee
            <span>*</span>
          </label>

          <select
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            disabled={loadingEmployees}
          >
            <option value="">
              {loadingEmployees ? "Loading employees..." : "Select employee"}
            </option>

            {employees.map((employee) => (
              <option
                key={employee.employeeId._id}
                value={employee.employeeId._id}
              >
                {employee.employeeId.name_en}
                {employee.employeeId.employee_code
                  ? ` - ${employee.employeeId.employee_code}`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="upload-form-grid">
          {/* DOCUMENT TYPE */}
          <div className="upload-form-group">
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
          <div className="upload-form-group">
            <label>Issue Date</label>

            <input
              type="date"
              name="issue_date"
              value={formData.issue_date}
              onChange={handleChange}
            />
          </div>

          {/* EXPIRY DATE */}
          <div className="upload-form-group">
            <label>Expiry Date</label>

            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
            />

            <small>Leave empty if the document does not expire.</small>
          </div>
        </div>

        {/* FILE */}
        <div className="upload-form-group full-width">
          <label>
            Document File
            <span>*</span>
          </label>

          <label className="document-file-upload">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
            />

            {!formData.file ? (
              <div className="file-empty">
                <div className="file-upload-icon">↑</div>

                <strong>Choose document file</strong>

                <span>PDF, JPG, JPEG, PNG or WEBP</span>
              </div>
            ) : (
              <div className="selected-file">
                <div className="selected-file-icon">▤</div>

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

        {/* INFO */}
        <div className="hr-upload-info">
          <span>✓</span>

          <div>
            <strong>HR Admin Upload</strong>

            <p>Documents uploaded by HR are verified automatically.</p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="upload-form-actions">
          <button
            type="button"
            className="upload-cancel-btn"
            onClick={() => navigate("/admin/documents")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="upload-submit-btn"
            disabled={submitting}
          >
            {submitting ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default UploadEmployeeDocument;
