import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  Eye,
  Lock,
  User,
  AlertCircle,
  UploadCloud,
  FileCheck,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import StatusBadge from "../components/common/StatusBadge";
import Modal from "../components/common/Modal";

const CATEGORY_KEYS = [
  "FIR / First Information Report",
  "Witness Statements",
  "Evidence Documents",
  "Investigation Documents",
  "Supporting Documents",
  "Other Documents",
  "Court Documents",
];

export default function CaseDetail() {
  const { id } = useParams();
  const { cases, currentUser, uploadCourtDocument, uploadForensicReport } = useApp();
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Modals for Judicial / Forensic uploads directly from case detail
  const [showCourtModal, setShowCourtModal] = useState(false);
  const [courtForm, setCourtForm] = useState({ title: "", docType: "Judicial Order", remarks: "" });

  const [showForensicModal, setShowForensicModal] = useState(false);
  const [forensicForm, setForensicForm] = useState({ title: "", findings: "" });

  const caseData = cases.find((c) => c.id === id) || cases[0];

  const docs = caseData?.documents || [];

  const handleCourtUpload = (e) => {
    e.preventDefault();
    uploadCourtDocument(caseData.id, {
      title: courtForm.title,
      docType: courtForm.docType,
      fileName: courtForm.title.toLowerCase().replace(/\s+/g, "_") + ".pdf",
      remarks: courtForm.remarks,
    });
    setShowCourtModal(false);
    setCourtForm({ title: "", docType: "Judicial Order", remarks: "" });
  };

  const handleForensicUpload = (e) => {
    e.preventDefault();
    uploadForensicReport(caseData.id, {
      title: forensicForm.title,
      fileName: forensicForm.title.toLowerCase().replace(/\s+/g, "_") + ".pdf",
      findings: forensicForm.findings,
    });
    setShowForensicModal(false);
    setForensicForm({ title: "", findings: "" });
  };

  const isJudicial = currentUser?.role === "Judicial Officer" || currentUser?.role === "Court Authority";
  const isForensic = currentUser?.role === "Forensic Officer";

  return (
    <div className="stack animate-fade-in">
      <Link to="/cases" className="back-link">
        <ArrowLeft size={15} /> Back to Cases
      </Link>

      {/* CASE OVERVIEW HEADER CARD */}
      <div className="card">
        <div className="row-start">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span className="evidence-id-badge" style={{ fontSize: 13, padding: "5px 12px" }}>
                {caseData.id}
              </span>
              <StatusBadge status={caseData.status} />
              <span className="mono" style={{ fontSize: 11.5, color: "var(--gold-dark)", fontWeight: 700 }}>
                Created: {caseData.createdDate || caseData.updated || "01 Sep 2026"}
              </span>
            </div>

            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 700 }}>
              {caseData.name}
            </h1>
            <p className="page-subtext" style={{ marginTop: 8, maxWidth: 640, fontSize: 13.5, lineHeight: 1.6 }}>
              {caseData.description}
            </p>
          </div>

          <div style={{ textAlign: "right", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, minWidth: 240 }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "var(--subtext)", textTransform: "uppercase", fontWeight: 700 }}>
                Category
              </span>
              <p style={{ fontWeight: 700, fontSize: 13 }}>{caseData.category}</p>
            </div>

            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "var(--subtext)", textTransform: "uppercase", fontWeight: 700 }}>
                Priority
              </span>
              <p style={{ fontWeight: 700, fontSize: 13, color: caseData.priority === "Critical" ? "var(--danger)" : "var(--text)" }}>
                {caseData.priority}
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8 }}>
              <span style={{ fontSize: 11, color: "var(--subtext)", textTransform: "uppercase", fontWeight: 700 }}>
                Legal Officer
              </span>
              <p style={{ fontWeight: 600, fontSize: 12.5 }}>{caseData.assignedOfficer}</p>
            </div>

            <div style={{ marginTop: 8, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
              <span style={{ fontSize: 11, color: "var(--subtext)", textTransform: "uppercase", fontWeight: 700 }}>
                Forensic Officer
              </span>
              <p style={{ fontWeight: 600, fontSize: 12.5, color: caseData.assignedForensicOfficer === "To be assigned by Administrator" ? "var(--amber)" : "var(--text)" }}>
                {caseData.assignedForensicOfficer}
              </p>
            </div>
          </div>
        </div>

        {/* QUICK ACTION FOR JUDICIAL / FORENSIC OFFICERS */}
        {(isJudicial || isForensic) && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
            {isJudicial && (
              <button className="btn btn-primary" onClick={() => setShowCourtModal(true)}>
                <UploadCloud size={15} /> Upload Court Document
              </button>
            )}
            {isForensic && (
              <button className="btn btn-primary" onClick={() => setShowForensicModal(true)}>
                <FileCheck size={15} /> Upload Forensic Report
              </button>
            )}
          </div>
        )}
      </div>

      {/* CASE DOCUMENTS BY CATEGORIES */}
      <div className="card">
        <div className="row" style={{ marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 700 }}>
              CASE DOCUMENTS
            </h2>
            <p className="page-subtext">Securely archived, hashed, and categorized repository files.</p>
          </div>
          <span className="badge badge-success">
            <ShieldCheck size={13} /> {docs.length} Total Files Encrypted
          </span>
        </div>

        <div className="stack" style={{ gap: 24 }}>
          {CATEGORY_KEYS.map((catName) => {
            const catDocs = docs.filter((d) => d.category === catName || (!d.category && catName === "Supporting Documents"));
            return (
              <div key={catName} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {catName}
                  </h3>
                  <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                    {catDocs.length} {catDocs.length === 1 ? "document" : "documents"}
                  </span>
                </div>

                {catDocs.length === 0 ? (
                  <p style={{ fontSize: 12, color: "var(--subtext)", fontStyle: "italic", padding: "10px 0" }}>
                    No documents uploaded in this category.
                  </p>
                ) : (
                  <div className="stack" style={{ gap: 10 }}>
                    {catDocs.map((doc) => (
                      <div key={doc.id || doc.name} className="doc-row">
                        <div className="doc-left">
                          <div className="doc-icon">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="doc-name">{doc.name}</p>
                            <p className="doc-file mono">
                              {doc.file} · {doc.size || "2.1 MB"} · Uploaded by {doc.uploadedBy || "Officer"}
                            </p>
                          </div>
                        </div>

                        <div className="doc-right">
                          <StatusBadge status={doc.status || "Verified"} />
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedDoc(doc)}
                            style={{ gap: 6 }}
                          >
                            <Eye size={14} /> View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedDoc && (
        <Modal onClose={() => setSelectedDoc(null)} maxWidth={560}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <FileText size={22} color="var(--gold-dark)" />
            <div>
              <h3 className="modal-title" style={{ fontFamily: "var(--font-serif)" }}>
                {selectedDoc.name}
              </h3>
              <p className="page-subtext mono">{selectedDoc.file}</p>
            </div>
          </div>

          <div className="stack" style={{ gap: 16, marginTop: 16 }}>
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
              <div className="grid-2" style={{ gap: 12, fontSize: 12 }}>
                <div>
                  <span className="subtext">Category:</span>
                  <p style={{ fontWeight: 700 }}>{selectedDoc.category || "General Document"}</p>
                </div>
                <div>
                  <span className="subtext">Document Type:</span>
                  <p style={{ fontWeight: 700 }}>{selectedDoc.type || "PDF Document"}</p>
                </div>
                <div>
                  <span className="subtext">Uploaded By:</span>
                  <p style={{ fontWeight: 700 }}>{selectedDoc.uploadedBy || "Officer"}</p>
                </div>
                <div>
                  <span className="subtext">Upload Date:</span>
                  <p style={{ fontWeight: 700 }}>{selectedDoc.date || "01 Sep 2026"}</p>
                </div>
              </div>
            </div>

            <div style={{ background: "var(--navy)", color: "#fff", borderRadius: "var(--radius)", padding: 18, textAlign: "center" }}>
              <ShieldCheck size={28} color="var(--gold)" style={{ marginInline: "auto", marginBottom: 6 }} />
              <p style={{ fontWeight: 700, fontSize: 13, color: "var(--gold)" }}>SHA-256 Cryptographic Ledger Seal</p>
              <p className="mono" style={{ fontSize: 10.5, color: "#9AA5B1", marginTop: 4, wordBreak: "break-all" }}>
                {selectedDoc.hash || "SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
              </p>
              <p style={{ fontSize: 11, color: "var(--success-border)", marginTop: 8 }}>
                ✓ Tamper-Evident Ledger Integrity Confirmed
              </p>
            </div>

            {(selectedDoc.findings || selectedDoc.remarks) && (
              <div style={{ background: "var(--amber-bg)", border: "1px solid var(--amber-border)", borderRadius: "var(--radius)", padding: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--amber)", textTransform: "uppercase" }}>
                  Official Remarks / Examination Findings
                </span>
                <p style={{ fontSize: 12.5, color: "var(--text)", marginTop: 4 }}>
                  {selectedDoc.findings || selectedDoc.remarks}
                </p>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button className="btn btn-primary" onClick={() => setSelectedDoc(null)}>
              Close Preview
            </button>
          </div>
        </Modal>
      )}

      {/* UPLOAD COURT DOCUMENT MODAL (FOR JUDICIAL OFFICERS) */}
      {showCourtModal && (
        <Modal onClose={() => setShowCourtModal(false)} maxWidth={500}>
          <h3 className="modal-title" style={{ fontFamily: "var(--font-serif)" }}>Upload Judicial Court Document</h3>
          <p className="page-subtext" style={{ marginBottom: 16 }}>
            Attach signed court order, bail ruling, or proceeding document to Case {caseData.id}.
          </p>

          <form onSubmit={handleCourtUpload}>
            <div className="field">
              <label>Document Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Interim Injunction & Bail Hearing Order"
                value={courtForm.title}
                onChange={(e) => setCourtForm({ ...courtForm, title: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Document Type</label>
              <select
                value={courtForm.docType}
                onChange={(e) => setCourtForm({ ...courtForm, docType: e.target.value })}
              >
                <option>Judicial Order</option>
                <option>Interim Ruling</option>
                <option>Bail Decision</option>
                <option>Summons / Warrant</option>
                <option>Court Minute</option>
              </select>
            </div>

            <div className="field">
              <label>Judicial Remarks</label>
              <textarea
                rows={3}
                placeholder="Enter court directions or summary remarks..."
                value={courtForm.remarks}
                onChange={(e) => setCourtForm({ ...courtForm, remarks: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowCourtModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Upload &amp; Attach Order
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* UPLOAD FORENSIC REPORT MODAL (FOR FORENSIC OFFICERS) */}
      {showForensicModal && (
        <Modal onClose={() => setShowForensicModal(false)} maxWidth={500}>
          <h3 className="modal-title" style={{ fontFamily: "var(--font-serif)" }}>Submit Forensic Analysis Report</h3>
          <p className="page-subtext" style={{ marginBottom: 16 }}>
            Upload signed examination report for Case {caseData.id}.
          </p>

          <form onSubmit={handleForensicUpload}>
            <div className="field">
              <label>Report Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Digital Memory Extraction & Cryptographic Analysis"
                value={forensicForm.title}
                onChange={(e) => setForensicForm({ ...forensicForm, title: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Key Findings / Examination Summary *</label>
              <textarea
                rows={4}
                required
                placeholder="Detail key technical findings, hash integrity, and evidence conclusions..."
                value={forensicForm.findings}
                onChange={(e) => setForensicForm({ ...forensicForm, findings: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForensicModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Signed Report
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
