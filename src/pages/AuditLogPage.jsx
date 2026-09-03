import React from "react";
import { useApp } from "../context/AppContext";
import StatusBadge from "../components/common/StatusBadge";

export default function AuditLogPage() {
  const { auditLogs } = useApp();

  return (
    <div className="stack animate-fade-in">
      <div className="card">
        <h2 className="page-title">Audit Trail</h2>
        <p className="page-subtext">Chronological, tamper-resistant record of every user action, view, and upload.</p>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Case</th>
              <th>IP / Device</th>
              <th className="text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.id}>
                <td data-label="Timestamp" className="mono subtext">{log.timestamp}</td>
                <td data-label="User" style={{ fontWeight: 600 }}>{log.user}</td>
                <td data-label="Action">{log.action}</td>
                <td data-label="Case" className="mono link-gold">{log.caseId}</td>
                <td data-label="IP" className="mono subtext">{log.ip}</td>
                <td data-label="Status" className="text-right"><StatusBadge status={log.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
