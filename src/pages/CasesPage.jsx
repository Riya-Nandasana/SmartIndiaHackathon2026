import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Filter, FolderKanban } from "lucide-react";
import { useApp } from "../context/AppContext";
import StatusBadge from "../components/common/StatusBadge";

export default function CasesPage() {
  const { cases, currentUser } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const isLegalOfficer = currentUser?.role === "Legal Officer" || currentUser?.role === "Administrator";

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === "All" || c.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="stack animate-fade-in">
      <div className="card row">
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700 }}>My Cases</h1>
          <p className="page-subtext">Manage, register, and monitor all active case files and document repositories.</p>
        </div>

        {isLegalOfficer && (
          <button className="btn btn-primary" onClick={() => navigate("/cases/new")}>
            <Plus size={16} /> Create New Case
          </button>
        )}
      </div>

      <div className="card row" style={{ gap: 14, padding: "16px 24px" }}>
        <div className="topbar-search" style={{ flex: 1 }}>
          <Search size={15} />
          <input
            type="text"
            placeholder="Search cases by Case ID, Title, or Officer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Filter size={14} color="var(--subtext)" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg)", fontSize: 12.5 }}
          >
            <option value="All">All Categories</option>
            <option value="Criminal Investigation">Criminal Investigation</option>
            <option value="Cyber Crime">Cyber Crime</option>
            <option value="Financial Crime">Financial Crime</option>
            <option value="Missing Person">Missing Person</option>
            <option value="Other">Other</option>
          </select>
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
              <th>Status</th>
              <th>Created Date</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((c) => (
              <tr key={c.id}>
                <td data-label="Case ID" className="mono" style={{ fontWeight: 600, color: "var(--text)" }}>
                  {c.id}
                </td>
                <td data-label="Case Title" style={{ fontWeight: 600, fontSize: 13.5 }}>
                  {c.name}
                </td>
                <td data-label="Category" className="subtext">
                  {c.category}
                </td>
                <td data-label="Priority">
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 11.5,
                      color:
                        c.priority === "Critical"
                          ? "var(--danger)"
                          : c.priority === "High"
                          ? "var(--amber)"
                          : "var(--text)",
                    }}
                  >
                    {c.priority}
                  </span>
                </td>
                <td data-label="Status">
                  <StatusBadge status={c.status} />
                </td>
                <td data-label="Created Date" className="mono subtext" style={{ fontSize: 11.5 }}>
                  {c.createdDate || c.updated || "01 Sep 2026"}
                </td>
                <td data-label="Action" className="text-right">
                  <Link to={`/cases/${c.id}`} className="btn btn-secondary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <FolderKanban size={13} /> View Case Details
                  </Link>
                </td>
              </tr>
            ))}

            {filteredCases.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center subtext" style={{ padding: 40 }}>
                  No cases matching the query criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
