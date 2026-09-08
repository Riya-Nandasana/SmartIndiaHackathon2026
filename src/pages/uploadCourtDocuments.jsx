import React, { useState } from "react";
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  X,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "../context/AppContext";

function UploadCourtDocuments() {
  const { cases = [] } = useApp();

  const [caseId, setCaseId] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      setSubmitted(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!caseId || !documentType || !documentTitle || !selectedFile) {
      alert("Please complete all required fields.");
      return;
    }

    /*
      Backend Integration Later:

      const formData = new FormData();

      formData.append("caseId", caseId);
      formData.append("documentType", documentType);
      formData.append("documentTitle", documentTitle);
      formData.append("description", description);
      formData.append("file", selectedFile);

      await axios.post("/api/court-documents", formData);
    */

    setSubmitted(true);

    setTimeout(() => {
      setCaseId("");
      setDocumentType("");
      setDocumentTitle("");
      setDescription("");
      setSelectedFile(null);
    }, 1000);
  };

  return (
    <div className="stack animate-fade-in">

      {/* HEADER */}
      <div className="card">
        <div className="row" style={{ alignItems: "flex-start" }}>
          <div>
            <h2 className="page-title">Upload Court Document</h2>

            <p className="page-subtext">
              Upload authorized judicial documents securely and link them
              to the appropriate case record.
            </p>
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 10px",
              borderRadius: "var(--radius-sm)",
              background: "var(--success-bg)",
              color: "var(--success)",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={15} />
            Secure Upload
          </div>
        </div>
      </div>


      {/* SUCCESS MESSAGE */}
      {submitted && (
        <div
          className="card"
          style={{
            borderColor: "var(--success)",
            background: "var(--success-bg)",
          }}
        >
          <div className="row">
            <CheckCircle2
              size={20}
              color="var(--success)"
            />

            <div>
              <strong
                style={{
                  fontSize: 13,
                  color: "var(--success)",
                }}
              >
                Court Document Uploaded Successfully
              </strong>

              <p
                className="page-subtext"
                style={{ marginTop: 3 }}
              >
                The document has been securely linked to the selected case.
              </p>
            </div>
          </div>
        </div>
      )}


      <form onSubmit={handleSubmit} className="stack">

        {/* DOCUMENT INFORMATION */}
        <div className="card">

          <div className="section-head">
            <div>
              <h3>Document Information</h3>

              <p className="page-subtext">
                Provide the case and document details.
              </p>
            </div>

            <FileText size={19} color="var(--gold)" />
          </div>


          <div className="grid-2">

            {/* CASE */}
            <div className="field">
              <label>Case ID *</label>

              <select
                value={caseId}
                onChange={(event) =>
                  setCaseId(event.target.value)
                }
                required
              >
                <option value="">
                  Select a case
                </option>

                {cases.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.id}
                    {item.title ? ` — ${item.title}` : ""}
                  </option>
                ))}

              </select>
            </div>


            {/* DOCUMENT TYPE */}
            <div className="field">
              <label>Document Type *</label>

              <select
                value={documentType}
                onChange={(event) =>
                  setDocumentType(event.target.value)
                }
                required
              >
                <option value="">
                  Select document type
                </option>

                <option value="Court Order">
                  Court Order
                </option>

                <option value="Judgment">
                  Judgment
                </option>

                <option value="Hearing Record">
                  Hearing Record
                </option>

                <option value="Legal Notice">
                  Legal Notice
                </option>

                <option value="Court Direction">
                  Court Direction
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

          </div>


          {/* TITLE */}
          <div className="field">

            <label>Document Title *</label>

            <input
              type="text"
              placeholder="Enter document title"
              value={documentTitle}
              onChange={(event) =>
                setDocumentTitle(event.target.value)
              }
              required
            />

          </div>


          {/* DESCRIPTION */}
          <div className="field">

            <label>Description</label>

            <textarea
              rows="4"
              placeholder="Add a short description about this court document..."
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
            />

          </div>

        </div>


        {/* FILE UPLOAD */}
        <div className="card">

          <div className="section-head">

            <div>
              <h3>Upload Document</h3>

              <p className="page-subtext">
                Select the authorized document to attach to this case.
              </p>
            </div>

            <UploadCloud
              size={20}
              color="var(--gold)"
            />

          </div>


          {!selectedFile ? (

            <label
              className="dropzone"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "38px 20px",
                cursor: "pointer",
              }}
            >

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <UploadCloud
                size={34}
                color="var(--gold)"
              />

              <p
                style={{
                  fontWeight: 700,
                  marginTop: 10,
                  fontSize: 13,
                }}
              >
                Click to upload court document
              </p>

              <p
                className="page-subtext"
                style={{ marginTop: 4 }}
              >
                Supported formats: PDF, DOC, DOCX
              </p>

            </label>

          ) : (

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
                padding: 16,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
              }}
            >

              <div
                className="row"
                style={{
                  minWidth: 0,
                }}
              >

                <FileText
                  size={22}
                  color="var(--gold)"
                />

                <div
                  style={{
                    minWidth: 0,
                  }}
                >

                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {selectedFile.name}
                  </p>

                  <p className="page-subtext">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>

                </div>

              </div>


              <button
                type="button"
                className="icon-btn"
                onClick={removeFile}
                title="Remove file"
              >
                <X size={17} />
              </button>

            </div>

          )}

        </div>


        {/* SECURITY INFORMATION */}
        <div className="card">

          <div
            className="row"
            style={{
              alignItems: "flex-start",
            }}
          >

            <div
              style={{
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "var(--navy)",
                color: "var(--gold)",
              }}
            >
              <Lock size={17} />
            </div>


            <div>

              <h4
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Secure Judicial Record
              </h4>

              <p
                className="page-subtext"
                style={{
                  marginTop: 5,
                }}
              >
                The uploaded document will be linked to the selected case,
                recorded in the audit trail, and protected through controlled
                role-based access.
              </p>

            </div>

          </div>

        </div>


        {/* ACTIONS */}
        <div
          className="row"
          style={{
            justifyContent: "flex-end",
            gap: 10,
          }}
        >

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>


          <button
            type="submit"
            className="btn btn-primary"
          >
            <ShieldCheck size={16} />
            Upload & Secure Document
          </button>

        </div>

      </form>

    </div>
  );
}

export default UploadCourtDocuments;