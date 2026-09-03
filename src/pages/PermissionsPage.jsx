import React from "react";
import { Check, X } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function PermissionsPage() {
  const { permissionMatrix } = useApp();

  return (
    <div className="stack animate-fade-in">
      <div className="card">
        <h2 className="page-title">Access Control</h2>
        <p className="page-subtext">Manage role-based access to sensitive case information.</p>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Role</th>
              <th className="text-center">View</th>
              <th className="text-center">Edit</th>
              <th className="text-center">Upload</th>
              <th className="text-center">Share</th>
            </tr>
          </thead>
          <tbody>
            {permissionMatrix.map((p, idx) => (
              <tr key={idx}>
                <td data-label="Role" style={{ fontWeight: 600 }}>{p.role}</td>
                <td data-label="View" className="text-center">
                  {p.view ? <Check size={16} color="var(--success)" /> : <X size={16} color="var(--danger)" />}
                </td>
                <td data-label="Edit" className="text-center">
                  {p.edit ? <Check size={16} color="var(--success)" /> : <X size={16} color="var(--danger)" />}
                </td>
                <td data-label="Upload" className="text-center">
                  {p.upload ? <Check size={16} color="var(--success)" /> : <X size={16} color="var(--danger)" />}
                </td>
                <td data-label="Share" className="text-center">
                  {p.share ? <Check size={16} color="var(--success)" /> : <X size={16} color="var(--danger)" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Document-Specific Permissions</h3>
        <p className="page-subtext" style={{ marginBottom: 16 }}>
          Fine-grained overrides for individual restricted documents.
        </p>
        <div className="stack" style={{ gap: 10 }}>
          <PermissionRow name="Evidence_0042.pdf" scope="CASE-2026-001" level="Court Only" />
          <PermissionRow name="Audit_Trail.pdf" scope="CASE-2026-008" level="Admin Only" />
        </div>
      </div>
    </div>
  );
}

function PermissionRow({ name, scope, level }) {
  return (
    <div className="row" style={{ padding: "12px 16px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
      <div>
        <p style={{ fontSize: 12.5, fontWeight: 600 }}>{name}</p>
        <p className="page-subtext" style={{ marginTop: 2 }}>{scope}</p>
      </div>
      <span className="badge badge-warning">{level.toUpperCase()}</span>
    </div>
  );
}
