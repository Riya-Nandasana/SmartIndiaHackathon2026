import React, { useState } from "react";
import { UserPlus, CheckCircle2, ShieldCheck } from "lucide-react";
import { useApp } from "../context/AppContext";
import StatusBadge from "../components/common/StatusBadge";

export default function AssignForensicPage() {
  const { cases, users, assignForensicOfficer } = useApp();
  
  // Find forensic officers from users
  const forensicOfficers = users.filter((u) => u.role === "Forensic Officer" && u.status === "Active");

  // Selected officer mapping per caseId
  const [selectedMap, setSelectedMap] = useState({});
  const [toastMsg, setToastMsg] = useState("");

  const handleAssign = (caseId) => {
    const officerName = selectedMap[caseId] || (forensicOfficers[0]?.name || "Dr. Ananya Patel");
    assignForensicOfficer(caseId, officerName);
    setToastMsg(`Assigned ${officerName} to Case ${caseId}`);
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div className="stack animate-fade-in">
      <div className="card">
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700 }}>Assign Forensic Officer</h1>
        <p className="page-subtext">Route newly registered cases to certified forensic officers for digital and physical evidence extraction.</p>
      </div>

      {toastMsg && (
        <div className="card row" style={{ background: "var(--success-bg)", border: "1px solid var(--success-border)", color: "var(--success)", padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={18} />
            <span style={{ fontWeight: 700, fontSize: 13 }}>{toastMsg}</span>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Case Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Current Forensic Officer</th>
              <th className="text-right">Assign / Reassign Officer</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => {
              const isUnassigned = c.assignedForensicOfficer === "To be assigned by Administrator";
              return (
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
                  <td data-label="Current Forensic Officer">
                    {isUnassigned ? (
                      <span className="badge badge-warning">
                        To be assigned by Administrator
                      </span>
                    ) : (
                      <span className="badge badge-success">
                        <ShieldCheck size={13} /> {c.assignedForensicOfficer}
                      </span>
                    )}
                  </td>
                  <td data-label="Assign / Reassign Officer" className="text-right">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                      <select
                        value={selectedMap[c.id] || (isUnassigned ? (forensicOfficers[0]?.name || "") : c.assignedForensicOfficer)}
                        onChange={(e) => setSelectedMap({ ...selectedMap, [c.id]: e.target.value })}
                        style={{ padding: "6px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 12 }}
                      >
                        {forensicOfficers.map((fo) => (
                          <option key={fo.id} value={fo.name}>
                            {fo.name} ({fo.department})
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAssign(c.id)}
                        style={{ gap: 6 }}
                      >
                        <UserPlus size={14} /> Assign
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
