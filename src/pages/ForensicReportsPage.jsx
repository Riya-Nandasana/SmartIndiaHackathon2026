import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FileCheck, UploadCloud, Eye, ShieldCheck, FileText } from "lucide-react";
import { useApp } from "../context/AppContext";
import StatusBadge from "../components/common/StatusBadge";
import Modal from "../components/common/Modal";

export default function ForensicReportsPage() {
  const { cases, currentUser, uploadForensicReport } = useApp();
  const [selectedCase, setSelectedCase] = useState(null);
  const [reportTitle, setReportTitle] = useState("");
  const [findings, setFindings] = useState("");
  const [viewDoc, setViewDoc] = useState(null);

  // Filter cases relevant for forensic officer (or assigned to Dr. Ananya Patel / currentUser)
  const assignedCases = cases.filter(
    (c) =>
      c.assignedForensicOfficer === currentUser?.name ||
      c.assignedForensicOfficer?.includes("Ananya") ||
      c.assignedForensicOfficer !== "To be assigned by Administrator"
  );

  const displayCases = assignedCases.length > 0 ? assignedCases : cases;

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    uploadForensicReport(selectedCase.id, {
      title: reportTitle || "Forensic Examination Summary Report",
      fileName: (reportTitle || "Forensic_Report").toLowerCase().replace(/\s+/g, "_") + ".pdf",
      findings,
    });

    setSelectedCase(null);
    setReportTitle("");
    setFindings("");
  };

  return (
    <div className="stack animate-fade-in">
      <div className="card">
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700 }}>My Forensic Reports</h1>
        <p className="page-subtext">Manage assigned investigations, upload lab analysis reports, and review submitted reports.</p>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Case Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Report Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayCases.map((c) => {
              const forensicReportDoc = c.documents?.find((d) => d.isForensicReport || d.name.toLowerCase().includes("forensic"));
              const isSubmitted = !!forensicReportDoc;

              return (
                <tr key={c.id}>
                  <td data-label="Case ID" className="mono" style={{ fontWeight: 700 }}>
                    <span className="evidence-id-badge">{c.id}</span>
                  </td>
                  <td data-label="Case Name" style={{ fontWeight: 600, fontSize: 13.5 }}>
                    {c.name}
                  </td>
                  <td data-label="Category" className="subtext">
                    {c.category}
                  </td>
                  <td data-label="Status">
                    <StatusBadge status={c.status} />
                  </td>
                  <td data-label="Report Status">
                    {isSubmitted ? (
                      <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <ShieldCheck size={13} /> Report Submitted
                      </span>
                    ) : (
                      <span className="badge badge-warning">Pending Report</span>
                    )}
                  </td>
                  <td data-label="Action" className="text-right">
                    {isSubmitted ? (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setViewDoc(forensicReportDoc)}
                        style={{ gap: 6 }}
                      >
                        <Eye size={14} /> [View Report]
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setSelectedCase(c);
                          setReportTitle(`Forensic Report — ${c.name}`);
                        }}
                        style={{ gap: 6 }}
                      >
                        <UploadCloud size={14} /> [Upload Report]
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* UPLOAD REPORT MODAL */}
      {selectedCase && (
        <Modal onClose={() => setSelectedCase(null)} maxWidth={520}>
          <h3 className="modal-title" style={{ fontFamily: "var(--font-serif)" }}>Upload Forensic Analysis Report</h3>
          <p className="page-subtext" style={{ marginBottom: 18 }}>
            Submitting official laboratory findings for Case <strong>{selectedCase.id} ({selectedCase.name})</strong>
          </p>

          <form onSubmit={handleUploadSubmit}>
            <div className="field">
              <label>Report Title *</label>
              <input
                type="text"
                required
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Attach PDF Lab Report</label>
              <div className="dropzone">
                <p className="dropzone-title">Drag &amp; drop signed PDF, or click to browse</p>
                <p className="dropzone-sub">AES-256 Encrypted Upload</p>
              </div>
            </div>

            <div className="field">
              <label>Forensic Examination Summary / Conclusions *</label>
              <textarea
                rows={4}
                required
                placeholder="State technical findings, mobile/digital extraction summaries, memory hash verification..."
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setSelectedCase(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Report
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW REPORT MODAL */}
      {viewDoc && (
        <Modal onClose={() => setViewDoc(null)} maxWidth={540}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <FileCheck size={26} color="var(--success)" />
            <div>
              <h3 className="modal-title" style={{ fontFamily: "var(--font-serif)" }}>
                {viewDoc.name}
              </h3>
              <p className="page-subtext mono">{viewDoc.file} · Submitted {viewDoc.date}</p>
            </div>
          </div>

          <div className="stack" style={{ gap: 16, marginTop: 16 }}>
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
              <span className="subtext" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Examiner</span>
              <p style={{ fontWeight: 700, fontSize: 13, marginTop: 2 }}>{viewDoc.uploadedBy || "Dr. Ananya Patel"}</p>
              
              <span className="subtext" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", display: "block", marginTop: 12 }}>Findings Summary</span>
              <p style={{ fontSize: 13, color: "var(--text)", marginTop: 4, lineHeight: 1.5 }}>
                {viewDoc.findings || "Digital forensics extraction complete. Cryptographic signatures confirmed valid across all evidence partitions."}
              </p>
            </div>

            <div style={{ background: "var(--navy)", color: "#fff", borderRadius: "var(--radius)", padding: 16, textAlign: "center" }}>
              <p style={{ fontWeight: 700, fontSize: 12, color: "var(--gold)" }}>Cryptographic Verification Seal</p>
              <p className="mono" style={{ fontSize: 10.5, color: "#9AA5B1", marginTop: 4 }}>
                {viewDoc.hash || "SHA256:77889900112233445566778899aabbcc"}
              </p>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-primary" onClick={() => setViewDoc(null)}>
              Close View
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
