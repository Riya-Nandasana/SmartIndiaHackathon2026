import React from "react";
import { UserCheck, CheckCircle2, XCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import StatusBadge from "../components/common/StatusBadge";

export default function AdminApprovalsPage() {
  const { users, updateUserStatus } = useApp();

  const pendingUsers = users.filter((u) => u.status === "Pending");
  const processedUsers = users.filter((u) => u.status !== "Pending");

  return (
    <div className="stack animate-fade-in">
      <div className="card">
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700 }}>User Approval Requests</h1>
        <p className="page-subtext">Review officer credentials and approve or deny access requests for NyayaVault platform clearance.</p>
      </div>

      <div className="card">
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          Pending Requests ({pendingUsers.length})
        </h2>

        {pendingUsers.length === 0 ? (
          <div style={{ padding: 24, textAlignment: "center", background: "var(--bg)", borderRadius: "var(--radius)", border: "1px solid var(--border)", textAlign: "center" }}>
            <UserCheck size={28} color="var(--success)" style={{ marginInline: "auto", marginBottom: 6 }} />
            <p style={{ fontWeight: 600 }}>All user clearance requests have been reviewed.</p>
          </div>
        ) : (
          <div className="grid-2">
            {pendingUsers.map((u) => (
              <div key={u.id} className="card card-tight" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                <div className="row">
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{u.name}</h3>
                    <p style={{ fontSize: 12, color: "var(--subtext)" }}>{u.email}</p>
                  </div>
                  <StatusBadge status="Pending" />
                </div>

                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)", fontSize: 12.5, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div>
                    <span className="subtext">Requested Role:</span>{" "}
                    <strong style={{ color: "var(--gold-dark)" }}>{u.role}</strong>
                  </div>
                  <div>
                    <span className="subtext">Department:</span> <strong>{u.department}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button
                    className="btn btn-success btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => updateUserStatus(u.id, "Active")}
                  >
                    <CheckCircle2 size={14} /> Approve Access
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => updateUserStatus(u.id, "Rejected")}
                  >
                    <XCircle size={14} /> Reject Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          Recent Approvals History
        </h2>

        <div className="table-wrap" style={{ boxShadow: "none", border: "1px solid var(--border)" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Officer Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {processedUsers.map((u) => (
                <tr key={u.id}>
                  <td data-label="Officer Name" style={{ fontWeight: 600 }}>{u.name}</td>
                  <td data-label="Role">{u.role}</td>
                  <td data-label="Department" className="subtext">{u.department}</td>
                  <td data-label="Status"><StatusBadge status={u.status} /></td>
                  <td data-label="Last Active" className="subtext">{u.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
