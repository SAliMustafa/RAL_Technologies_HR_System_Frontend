import React, { useState } from "react";
import { useNavigate } from "react-router";
import { uploadDocument } from "../../services/employeeService";
import "../../components/css/Employee/UploadDocument.css";

const UploadDocument = () => {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    document_type: "",
    document_number: "",
    issue_date: "",
    expiry_date: "",
    file: null,
  });

  const documentTypes = [
    "CPR",
    "passport",
    "work_permit",
    "visa",
    "employment_contract",
    "qualification",
    "health_insurance",
    "bank_letter",
  ];

  function handleChange(event) {
    const { name, value, files } = event.target;

    if (name === "file") {
      setFormData({
        ...formData,
        file: files[0],
      });

      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.file) {
      setError("Please select a document file.");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append("document_type", formData.document_type);
      data.append("document_number", formData.document_number);
      data.append("issue_date", formData.issue_date);
      data.append("expiry_date", formData.expiry_date);
      data.append("file", formData.file);

      await uploadDocument(data);

      setSuccess("Document uploaded successfully and is waiting for HR verification.");

      setTimeout(() => {
        navigate("/mydocuments");
      }, 1200);

    } catch (err) {
      console.log(err);

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to upload document."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="upload-document-page">

      <div className="upload-page-header">
        <div>
          <h1>Upload Document</h1>

          <p>
            Upload your employee document for HR verification.
          </p>
        </div>

        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/mydocuments")}
        >
          ← Back to Documents
        </button>
      </div>


      <section className="upload-document-card">

        <div className="upload-card-title">
          <h2>Document Information</h2>

          <p>
            Please provide the correct document information before uploading.
          </p>
        </div>


        {error && (
          <div className="upload-error">
            ⚠ {error}
          </div>
        )}


        {success && (
          <div className="upload-success">
            ✓ {success}
          </div>
        )}


        <form
          className="upload-document-form"
          onSubmit={handleSubmit}
        >

          <div className="upload-form-group">
            <label htmlFor="document_type">
              Document Type
              <span className="required">*</span>
            </label>

            <select
              id="document_type"
              name="document_type"
              value={formData.document_type}
              onChange={handleChange}
              required
            >
              <option value="">
                Select document type
              </option>

              {documentTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>



          <div className="upload-date-grid">

            <div className="upload-form-group">
              <label htmlFor="issue_date">
                Issue Date
              </label>

              <input
                type="date"
                id="issue_date"
                name="issue_date"
                value={formData.issue_date}
                onChange={handleChange}
              />
            </div>


            <div className="upload-form-group">
              <label htmlFor="expiry_date">
                Expiry Date
              </label>

              <input
                type="date"
                id="expiry_date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
              />
            </div>

          </div>


          <div className="upload-form-group">
            <label htmlFor="file">
              Document File
              <span className="required">*</span>
            </label>

            <div className="file-upload-box">

              <input
                type="file"
                id="file"
                name="file"
                onChange={handleChange}
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />

              <div className="file-upload-info">

                <span className="file-icon">
                  📄
                </span>

                {formData.file ? (
                  <>
                    <strong>
                      {formData.file.name}
                    </strong>

                    <span>
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </>
                ) : (
                  <>
                    <strong>
                      Select a file
                    </strong>

                    <span>
                      PDF, JPG, JPEG or PNG
                    </span>
                  </>
                )}

              </div>

            </div>
          </div>


          <div className="verification-notice">
            <span>ℹ</span>

            <div>
              <strong>HR Verification Required</strong>

              <p>
                After uploading, your document will have a
                Pending status until HR reviews and verifies it.
              </p>
            </div>
          </div>


       
          <div className="upload-actions">

            <button
              type="button"
              className="upload-cancel-btn"
              onClick={() => navigate("/mydocuments")}
              disabled={loading}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="upload-submit-btn"
              disabled={loading}
            >
              {loading
                ? "Uploading..."
                : "Upload Document"}
            </button>

          </div>

        </form>

      </section>

    </main>
  );
};

export default UploadDocument;