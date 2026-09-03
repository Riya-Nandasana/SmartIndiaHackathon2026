import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, FolderKanban, ShieldCheck, Eye, UploadCloud, FileText } from "lucide-react";
import { useApp } from "../context/AppContext";
import StatusBadge from "../components/common/StatusBadge";

export default function JudicialSearchPage() {
  const { cases } = useApp();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState("");

  const filteredCases = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchId.toLowerCase()) ||
      c.name.toLowerCase().includes(searchId.toLowerCase()) ||
      c.category.toLowerCase().includes(searchId.toLowerCase())
  );

  return (
    <div className="stack animate-fade-in">
      <div className="card">
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700 }}>Judicial Case Search</h1>
        <p className="page-subtext">Quick lookup of submitted case records, FIRs, witness depositions, and forensic evidence files.</p>
        
        <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
          <div className="topbar-search" style={{ flex: 1 }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Enter exact Case ID (e.g. CASE-2026-001) or Title..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={{ width: "100%", padding: "12px 14px 12px 38px", fontSize: 13 }}
            />
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Case Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Legal Lead</th>
              <th>Status</th>
              <th className="text-right">Judicial Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((c) => (
              <tr key={c.id}>
                <td data-label="Case ID" className="mono" style={{ fontWeight: 700 }}>
                  <span className="evidence-id-badge">{c.id}</span>
                </td>
                <td data-label="Case Title" style={{ fontWeight: 600, fontSize: 13.5 }}>
                  {c.name}
                </td>
                <td data-label="Category" className="subtext">{c.category}</td>
                <td data-label="Priority">
                  <span style={{ fontWeight: 700, fontSize: 11.5, color: c.priority === "Critical" ? "var(--danger)" : "var(--text)" }}>
                    {c.priority}
                  </span>
                </td>
                <td data-label="Legal Lead" className="subtext">{c.assignedOfficer}</td>
                <td data-label="Status"><StatusBadge status={c.status} /></td>
                <td data-label="Judicial Actions" className="text-right">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/cases/${c.id}`)}
                    style={{ gap: 6 }}
                  >
                    <Eye size={14} /> Review Records &amp; Upload Orders →
                  </button>
                </td>
              </tr>
            ))}

            {filteredCases.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center subtext" style={{ padding: 40 }}>
                  No case records found matching "{searchId}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
