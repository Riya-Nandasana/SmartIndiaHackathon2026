import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UploadCloud, Eye, FileText, ShieldCheck } from "lucide-react";
import { useApp } from "../context/AppContext";
import Modal from "../components/common/Modal";

export default function JudicialUploadsPage() {
  const { cases, currentUser } = useApp();
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Find all court documents uploaded by judicial officer or in Court Documents category
  const uploadedRecords = [];
  cases.forEach((c) => {
    (c.documents || []).forEach((d) => {
      if (d.isCourtDocument || d.category === "Court Documents" || d.uploadedBy?.includes("Malhotra") || d.uploadedBy?.includes("Judicial")) {
        uploadedRecords.push({
          caseId: c.id,
          caseName: c.name,
          ...d,
        });
      }
    });
  });

  return (
    <div className="stack animate-fade-in">
      <div className="card">
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700 }}>My Court Uploads</h1>
        <p className="page-subtext">Archive of all judicial court orders, interim rulings, and bail decisions uploaded by this Judicial Officer.</p>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Case Name</th>
              <th>Document Title</th>
              <th>Order Type</th>
              <th>Upload Date</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {uploadedRecords.map((item, idx) => (
              <tr key={item.id || idx}>
                <td data-label="Case ID" className="mono" style={{ fontWeight: 700 }}>
                  <span className="evidence-id-badge">{item.caseId}</span>
                </td>
                <td data-label="Case Name" style={{ fontWeight: 600, fontSize: 13 }}>
                  {item.caseName}
                </td>
                <td data-label="Document Title" style={{ fontWeight: 600, fontSize: 13.5 }}>
                  {item.name}
                </td>
                <td data-label="Order Type">
                  <span className="badge badge-neutral" style={{ fontSize: 11 }}>
                    {item.type || "Judicial Order"}
                  </span>
                </td>
                <td data-label="Upload Date" className="mono subtext" style={{ fontSize: 11.5 }}>
                  {item.date || "02 Sep 2026"}
                </td>
                <td data-label="Status">
                  <span className="badge badge-success">
                    <ShieldCheck size={13} /> Verified Filing
                  </span>
                </td>
                <td data-label="Action" className="text-right">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedDoc(item)}
                    style={{ gap: 6 }}
                  >
                    <Eye size={14} /> View Order
                  </button>
                </td>
              </tr>
            ))}

            {uploadedRecords.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center subtext" style={{ padding: 40 }}>
                  No judicial filings uploaded yet. Open any case under "Search Cases" to upload court orders.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW ORDER MODAL */}
      {selectedDoc && (
        <Modal onClose={() => setSelectedDoc(null)} maxWidth={540}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <FileText size={26} color="var(--gold-dark)" />
            <div>
              <h3 className="modal-title" style={{ fontFamily: "var(--font-serif)" }}>
                {selectedDoc.name}
              </h3>
              <p className="page-subtext mono">Case {selectedDoc.caseId} · {selectedDoc.file}</p>
            </div>
          </div>

          <div className="stack" style={{ gap: 16, marginTop: 16 }}>
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
              <div className="grid-2" style={{ gap: 12, fontSize: 12 }}>
                <div>
                  <span className="subtext">Filing Officer:</span>
                  <p style={{ fontWeight: 700 }}>{selectedDoc.uploadedBy || "Justice Vikram Malhotra"}</p>
                </div>
                <div>
                  <span className="subtext">Filing Date:</span>
                  <p style={{ fontWeight: 700 }}>{selectedDoc.date || "02 Sep 2026"}</p>
                </div>
              </div>

              {selectedDoc.remarks && (
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  <span className="subtext" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Judicial Remarks</span>
                  <p style={{ fontSize: 13, marginTop: 4 }}>{selectedDoc.remarks}</p>
                </div>
              )}
            </div>

            <div style={{ background: "var(--navy)", color: "#fff", borderRadius: "var(--radius)", padding: 16, textAlign: "center" }}>
              <p style={{ fontWeight: 700, fontSize: 12, color: "var(--gold)" }}>High Court Seal &amp; SHA-256 Ledger</p>
              <p className="mono" style={{ fontSize: 10.5, color: "#9AA5B1", marginTop: 4 }}>
                {selectedDoc.hash || "SHA256:44332211009988776655443322110099"}
              </p>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-primary" onClick={() => setSelectedDoc(null)}>
              Close Order
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
