import React, { useState } from "react";
import { Database, ShieldCheck, Clock, Lock, Eye } from "lucide-react";
import { useApp } from "../context/AppContext";
import StatusBadge from "../components/common/StatusBadge";
import Modal from "../components/common/Modal";

function EvidencePage() {
  const { evidenceList } = useApp();
  const [activeEvidence, setActiveEvidence] = useState(null);

  const total = evidenceList.length;
  const verified = evidenceList.filter((e) => e.status === "Verified").length;
  const pending = evidenceList.filter((e) => e.status === "Pending Analysis").length;
  const restricted = evidenceList.filter((e) => e.access === "Restricted").length;

  return (
    <div className="stack animate-fade-in">
      <div className="card">
        <h2 className="page-title">Evidence Vault</h2>
        <p className="page-subtext">Cryptographically hashed evidence records and immutable chain of custody.</p>
      </div>

      <div className="grid-4">
        <StatCard label="Total Evidence" value={String(total).padStart(2, "0")} icon={Database} />
        <StatCard label="Verified" value={String(verified).padStart(2, "0")} icon={ShieldCheck} />
        <StatCard label="Pending Analysis" value={String(pending).padStart(2, "0")} icon={Clock} />
        <StatCard label="Restricted" value={String(restricted).padStart(2, "0")} icon={Lock} />
      </div>

      <div className="grid-3">
        {evidenceList.map((item) => (
          <div key={item.id} className="evidence-card">
            <div>
              <div className="row" style={{ marginBottom: 4 }}>
                <span className="evidence-id-badge">{item.id}</span>
                <StatusBadge status={item.status} />
              </div>
              <h3 className="evidence-type">{item.type}</h3>
              <p className="page-subtext" style={{ marginTop: 6 }}>
                Case: <strong style={{ color: "var(--text)" }}>{item.caseId}</strong>
              </p>
              <p className="page-subtext" style={{ marginTop: 2 }}>Uploaded by {item.uploadedBy}</p>
              <p className="evidence-hash">{item.hash.slice(0, 26)}...</p>
            </div>

            <div className="evidence-footer">
              <span className="page-subtext">Size: {item.size}</span>
              <button className="btn btn-primary btn-sm" onClick={() => setActiveEvidence(item)}>
                <Eye size={14} /> View Evidence
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeEvidence && (
        <Modal onClose={() => setActiveEvidence(null)} maxWidth={560}>
          <div className="row" style={{ alignItems: "flex-start" }}>
            <div>
              <span className="evidence-id-badge">{activeEvidence.id}</span>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 10 }}>{activeEvidence.type}</h3>
            </div>
            <StatusBadge status={activeEvidence.status} />
          </div>

          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, marginTop: 16, fontSize: 12.5, display: "flex", flexDirection: "column", gap: 6 }}>
            <p><strong>Case ID:</strong> {activeEvidence.caseId}</p>
            <p><strong>Uploaded By:</strong> {activeEvidence.uploadedBy} on {activeEvidence.date}</p>
            <p><strong>File Size:</strong> {activeEvidence.size}</p>
            <p className="mono"><strong>Integrity Hash:</strong> {activeEvidence.hash}</p>
          </div>

          <div style={{ marginTop: 20 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldCheck size={14} color="var(--success)" /> Chain of Custody
            </h4>
            <ul className="custody-list">
              {activeEvidence.chainOfCustody.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="modal-actions">
            <button className="btn btn-primary" onClick={() => setActiveEvidence(null)}>
              Close Vault Record
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-head">
        <span>{label}</span>
        <Icon size={17} color="var(--gold)" />
      </div>
      <p className="stat-card-value">{value}</p>
    </div>
  );
}
export default EvidencePage;
