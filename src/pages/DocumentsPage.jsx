import React, { useState } from "react";
import { FileText, Search } from "lucide-react";
import { useApp } from "../context/AppContext";

const ACCESS_LABELS = {
  Available: "PUBLIC WITHIN CASE",
  Restricted: "RESTRICTED",
};

export default function DocumentsPage() {
  const { cases } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const allDocs = cases.flatMap((c) =>
    c.documents.map((d) => ({ ...d, caseId: c.id }))
  );

  const filtered = allDocs.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.caseId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="stack animate-fade-in">
      <div className="card">
        <h2 className="page-title">Secure Document Repository</h2>
        <p className="page-subtext">Central repository for FIRs, witness statements, and forensic filings.</p>
      </div>

      <div className="topbar-search" style={{ maxWidth: 380 }}>
        <Search size={15} />
        <input
          type="text"
          placeholder="Search documents or case ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Type</th>
              <th>Case ID</th>
              <th>Access Level</th>
              <th>Integrity Hash</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc, idx) => (
              <tr key={idx}>
                <td data-label="Document" style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <FileText size={15} color="var(--gold-dark)" /> {doc.name}
                </td>
                <td data-label="Type" className="subtext">{doc.type}</td>
                <td data-label="Case ID" className="mono" style={{ fontWeight: 700 }}>{doc.caseId}</td>
                <td data-label="Access">
                  <span className={"badge " + (doc.access === "Restricted" ? "badge-warning" : "badge-success")}>
                    {ACCESS_LABELS[doc.access] || doc.access}
                  </span>
                </td>
                <td data-label="Hash" className="mono subtext">{doc.hash.slice(0, 22)}...</td>
                <td data-label="Action" className="text-right">
                  <button className="link-gold" style={{ background: "none", border: "none" }}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
