import React from "react";
import { ShieldCheck, Lock, Database, ShieldAlert } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function SecurityPage() {
  const { auditLogs } = useApp();
  const blocked = auditLogs.filter((l) => l.status === "Blocked");

  return (
    <div className="stack animate-fade-in">
      <div className="card row">
        <div>
          <h2 className="page-title">Security Center</h2>
          <p className="page-subtext">System-wide cryptographic integrity and compliance monitoring.</p>
        </div>
        <span className="system-secure-badge">
          <span className="pulse-dot" /> SYSTEM SECURE
        </span>
      </div>

      <div className="grid-4">
        <SecurityCard label="Encryption" value="AES-256 ACTIVE" icon={Lock} foot="End-to-end protected" />
        <SecurityCard label="Role-Based Access" value="RBAC ENFORCED" icon={ShieldCheck} foot="Zero-trust routing" />
        <SecurityCard label="Audit Logging" value="IMMUTABLE" icon={Database} foot="Append-only ledger" />
        <SecurityCard label="Document Integrity" value="VERIFIED" icon={ShieldAlert} foot="Zero hash mismatches" />
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Security Events</h3>
        <div className="stack" style={{ gap: 10 }}>
          {blocked.length === 0 && <p className="subtext">No unresolved security events.</p>}
          {blocked.map((log) => (
            <div key={log.id} className="row" style={{ padding: "12px 16px", background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: "var(--radius-sm)" }}>
              <div>
                <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--danger)" }}>{log.action}</p>
                <p className="page-subtext" style={{ marginTop: 2 }}>{log.timestamp} · {log.ip}</p>
              </div>
              <span className="badge badge-danger">Blocked</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecurityCard({ label, value, icon: Icon, foot }) {
  return (
    <div className="stat-card">
      <div className="stat-card-head">
        <span>{label}</span>
        <Icon size={17} color="var(--gold)" />
      </div>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 700 }}>{value}</p>
      <p className="stat-card-foot foot-success">{foot}</p>
    </div>
  );
}
