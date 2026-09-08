import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  UploadCloud,
  X,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  User,
  AlertCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";

const DOCUMENT_CATEGORIES = [
  { id: "fir", name: "FIR (First Information Report)", sub: "Click to Upload", accept: ".pdf" },
  { id: "witness", name: "Witness Statements", sub: "Click to Upload", accept: ".pdf,.doc,.docx" },
  { id: "evidence", name: "Evidence Documents", sub: "Click to Upload", accept: "*" },
  { id: "investigation", name: "Investigation Documents", sub: "Click to Upload", accept: ".pdf" },
  { id: "chargesheet", name: "Charge Sheet", sub: "Click to Upload", accept: "*" },
  { id: "other", name: "Other Documents", sub: "Click to Upload", accept: "*" },
];

export default function CreateCasePage() {
  const { currentUser, addCase, cases } = useApp();
  const navigate = useNavigate();

  const nextId = `CASE-2026-${(cases.length + 1).toString().padStart(3, "0")}`;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Criminal Investigation");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  
  // Categorized uploads: { fir: [ { id, name, size, type, fileObj } ], witness: [], ... }
  const [categoryDocs, setCategoryDocs] = useState({
    fir: [],
    witness: [],
    evidence: [],
    investigation: [],
    chargesheet: [],
    other: [],
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleFileUpload = (catId, files) => {
    if (!files || files.length === 0) return;

    const newDocs = Array.from(files).map((f) => ({
      id: "DOC-U-" + Math.random().toString(36).substring(2, 7),
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
      type: f.type || "Document",
      categoryName: DOCUMENT_CATEGORIES.find((c) => c.id === catId)?.name,
      fileObj: f,
    }));

    setCategoryDocs((prev) => ({
      ...prev,
      [catId]: [...prev[catId], ...newDocs],
    }));
  };

  const handleRemoveDoc = (catId, docId) => {
    setCategoryDocs((prev) => ({
      ...prev,
      [catId]: prev[catId].filter((d) => d.id !== docId),
    }));
  };

  const submitCaseForm = (caseStatus) => {
    if (!title.trim()) {
      alert("Please provide a Case Title.");
      return;
    }

    // Flatten all category documents into single list with proper document structure
    const allUploaded = [];
    Object.keys(categoryDocs).forEach((catId) => {
      const catObj = DOCUMENT_CATEGORIES.find((c) => c.id === catId);
      categoryDocs[catId].forEach((d) => {
        allUploaded.push({
          id: d.id,
          name: d.name,
          file: d.name,
          category: catObj ? catObj.name : "Supporting Documents",
          type: d.type || "PDF Document",
          size: d.size,
          uploadedBy: currentUser?.name || "Legal Officer",
          date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          hash: `SHA256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
          status: "Verified",
        });
      });
    });

    const newCase = addCase({
      name: title,
      category,
      priority,
      description,
      status: caseStatus,
      documents: allUploaded,
    });

    setSuccessMessage(`Case ${newCase.id} successfully created and registered.`);

    setTimeout(() => {
      navigate("/cases");
    }, 1200);
  };

  return (
    <div className="stack animate-fade-in" style={{ maxWidth: 960, margin: "0 auto" }}>
     

      {successMessage && (
        <div className="card row" style={{ background: "var(--success-bg)", border: "1px solid var(--success-border)", color: "var(--success)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={22} />
            <span style={{ fontWeight: 700, fontSize: 14 }}>{successMessage}</span>
          </div>
          <span className="mono" style={{ fontSize: 12 }}>Redirecting to My Cases...</span>
        </div>
      )}

      {/* HEADER */}
      <div className="card">
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 700 }}>Create New Case</h1>
        <p className="page-subtext" style={{ fontSize: 13, marginTop: 4 }}>
          Register a new case and securely upload all relevant case documents.
        </p>
      </div>

      {/* SECTION 1: CASE INFORMATION */}
      <div className="card">
        <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 20 }}>
            
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 700 }}>
            Case Information
          </h2>
        </div>

        <div className="field">
          <label>Case ID</label>
          <input
            type="text"
            value={nextId}
            disabled
            style={{ background: "var(--bg)", color: "var(--subtext)", fontWeight: 700, cursor: "not-allowed" }}
          />
          <span style={{ fontSize: 11, color: "var(--subtext)", marginTop: 4, display: "block" }}>
            Auto-generated unique case identifier sequence.
          </span>
        </div>

        <div className="field">
          <label>Case Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. State vs. Mehta Cyber Fraud & Laundering"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Case Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Criminal Investigation">Criminal Investigation</option>
              <option value="Cyber Crime">Cyber Crime</option>
              <option value="Financial Crime">Financial Crime</option>
              <option value="Missing Person">Missing Person</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="field">
            <label>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="field" style={{ marginBottom: 0 }}>
          <label>Case Description *</label>
          <textarea
            rows={4}
            required
            placeholder="Provide a thorough summary of the incident, involved entities, and key investigation goals..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* SECTION 2: CASE DOCUMENTS */}
      <div className="card">
        <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 700 }}>
            Case Documents
          </h2>
          {/* <p className="page-subtext">Upload multiple case files categorized by legal and investigation types.</p> */}
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          {DOCUMENT_CATEGORIES.map((cat) => {
            const uploadedList = categoryDocs[cat.id] || [];
            return (
              <div key={cat.id} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 18 }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 8 }}>
                  {cat.name}
                </p>

                {/* Dropzone trigger */}
                <label className="dropzone" style={{ display: "block", cursor: "pointer", padding: "16px 12px" }}>
                  <input
                    type="file"
                    multiple
                    accept={cat.accept}
                    onChange={(e) => handleFileUpload(cat.id, e.target.files)}
                    style={{ display: "none" }}
                  />
                  <UploadCloud size={22} color="var(--gold-dark)" style={{ marginInline: "auto", marginBottom: 4 }} />
                  <p className="dropzone-title">{cat.sub}</p>
                  <p className="dropzone-sub">PDF, DOC, Images</p>
                </label>

                {/* Uploaded file cards list */}
                {uploadedList.length > 0 && (
                  <div className="stack" style={{ gap: 8, marginTop: 12 }}>
                    {uploadedList.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          background: "#fff",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <FileText size={16} color="var(--navy)" />
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {doc.name}
                            </p>
                            <p style={{ fontSize: 10.5, color: "var(--subtext)" }}>{doc.size}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="icon-btn"
                          title="Remove file"
                          onClick={() => handleRemoveDoc(cat.id, doc.id)}
                          style={{ color: "var(--danger)" }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: ASSIGNMENT */}
      <div className="card">
        <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 700 }}>
           Assignment
          </h2>
        </div>

        <div className="grid-2">
          <div style={{ padding: 16, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--subtext)", textTransform: "uppercase" }}>
              Assigned Legal Officer
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>
                {currentUser?.name?.charAt(0) || "L"}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13 }}>{currentUser?.name || "Raj Mehta"}</p>
                <p style={{ fontSize: 11, color: "var(--gold-dark)" }}>{currentUser?.role || "Legal Officer"}</p>
              </div>
            </div>
          </div>

          <div style={{ padding: 16, background: "var(--amber-bg)", border: "1px solid var(--amber-border)", borderRadius: "var(--radius)" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--amber)", textTransform: "uppercase" }}>
              Forensic Officer
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              <AlertCircle size={20} color="var(--amber)" />
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, color: "var(--amber)" }}>
                  To be assigned by Administrator
                </p>
                <p style={{ fontSize: 11, color: "var(--subtext)" }}>
                  Will be routed to Admin control queue after registration
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTIONS */}
      <div className="card row" style={{ justifyContent: "flex-end", gap: 12 }}>
        <button type="button" className="btn btn-ghost" onClick={() => navigate("/cases")}>
          Cancel
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => submitCaseForm("Draft")}>
          Save as Draft
        </button>
        <button type="button" className="btn btn-primary" onClick={() => submitCaseForm("Active")}>
          <ShieldCheck size={15} /> Create Case
        </button>
      </div>
    </div>
  );
}
