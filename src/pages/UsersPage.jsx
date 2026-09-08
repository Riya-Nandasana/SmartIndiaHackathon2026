import React, { useState } from "react";
import { Users, UserPlus, ShieldCheck } from "lucide-react";
import { useApp } from "../context/AppContext";
import StatusBadge from "../components/common/StatusBadge";

export default function UsersPage() {
  const { users, updateUserStatus } = useApp();
  const [filterRole, setFilterRole] = useState("All");

  const filteredUsers = users.filter(
    (u) => filterRole === "All" || u.role === filterRole
  );

  return (
    <div className="stack animate-fade-in">
      <div className="card row">
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700 }}>User Management</h1>
          <p className="page-subtext">Comprehensive directory of authorized legal officers, forensic teams, judicial officers, and administrators.</p>
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg)", fontSize: 12.5 }}
        >
          <option value="All">All Roles</option>
          <option value="Legal Officer">Legal Officer</option>
          <option value="Forensic Officer">Forensic Officer</option>
          <option value="Judicial Officer">Judicial Officer</option>
          <option value="Administrator">Administrator</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Last Active</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td data-label="Name" style={{ fontWeight: 600 }}>{u.name}</td>
                <td data-label="Role" style={{ fontWeight: 600, color: "var(--gold-dark)" }}>{u.role}</td>
                <td data-label="Department" className="subtext">{u.department}</td>
                <td data-label="Status"><StatusBadge status={u.status} /></td>
                <td data-label="Last Active" className="subtext">{u.lastActive}</td>
                <td data-label="Actions" className="text-right">
                  {u.status === "Pending" ? (
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button className="btn btn-success btn-sm" onClick={() => updateUserStatus(u.id, "Active")}>
                        Approve
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => updateUserStatus(u.id, "Rejected")}>
                        Reject
                      </button>
                    </div>
                  ) : u.status === "Active" ? (
                    <button className="btn btn-ghost btn-sm" onClick={() => updateUserStatus(u.id, "Suspended")} style={{ color: "var(--danger)" }}>
                      Suspend Access
                    </button>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={() => updateUserStatus(u.id, "Active")}>
                      Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
