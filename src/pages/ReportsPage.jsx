import React from "react";
import { ShieldCheck } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ReportsPage() {
  const { cases } = useApp();

  return (
    <div className="stack animate-fade-in">
      <div className="card">
        <h2 className="page-title">Investigation Reports</h2>
        <p className="page-subtext">Signed and verified forensic and police investigation summaries.</p>
      </div>

      <div className="grid-2">
        {cases.map((c) => (
          <div key={c.id} className="card card-tight">
            <div className="row">
              <span className="evidence-id-badge">{c.id}</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--success)", display: "flex", alignItems: "center", gap: 5 }}>
                <ShieldCheck size={14} /> Signed &amp; Sealed
              </span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 14 }}>{c.name} — Summary Report</h3>
            <p className="page-subtext" style={{ marginTop: 6 }}>{c.description}</p>
            <div className="row" style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <span className="page-subtext">Lead: {c.assignedOfficer}</span>
              <button className="btn btn-primary btn-sm">Download PDF</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
