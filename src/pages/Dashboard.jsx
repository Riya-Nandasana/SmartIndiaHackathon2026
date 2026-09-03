import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  ShieldCheck,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  UserCheck,
  Users,
  FileSearch,
  Eye,
  Plus,
  Search,
  UploadCloud,
  FileCheck,
  UserPlus,
  Activity,
  Calendar,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import StatusBadge from "../components/common/StatusBadge";

export default function Dashboard() {
  const { currentUser } = useApp();
  const role = currentUser?.role;

  if (role === "Forensic Officer") {
    return <ForensicDashboard />;
  } else if (role === "Judicial Officer" || role === "Court Authority") {
    return <JudicialDashboard />;
  } else if (role === "Administrator") {
    return <AdminDashboard />;
  } else {
    return <LegalDashboard />;
  }
}

/* ---------------------------------------------------------
   Legal Officer — Case-centric dashboard
   --------------------------------------------------------- */
function LegalDashboard() {
  const { currentUser, cases } = useApp();
  const navigate = useNavigate();

  const activeCount = cases.filter((c) => c.status === "Active").length;
  const criticalCount = cases.filter((c) => c.priority === "Critical" || c.priority === "High").length;

  return (
    <div className="stack animate-fade-in">
      <div className="card row">
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 700 }}>
            Welcome back, {currentUser?.name || "Legal Officer"}
          </h1>
          <p className="page-subtext">Authorized Legal Officer Workspace · Active Case Management</p>
        </div>
      </div>

      <div className="grid-4">
        <StatCard label="Total Cases" value={String(cases.length).padStart(2, "0")} icon={FolderKanban} foot="Registered in system" footClass="foot-muted" />
        <StatCard label="Active Cases" value={String(activeCount).padStart(2, "0")} icon={ShieldCheck} foot="Under active investigation" footClass="foot-success" />
        <StatCard label="Critical Priority" value={String(criticalCount).padStart(2, "0")} icon={AlertTriangle} foot="Requires immediate action" footClass="foot-amber" />
        <StatCard label="Pending Assignments" value="01" icon={Clock} foot="Awaiting Forensic Officer" footClass="foot-muted" />
      </div>

      <div className="card">
        <div className="row" style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--navy)" }}>Active Cases</h2>
          <Link to="/cases" className="link-gold" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontFamily: "var(--font-sans)" }}>
            View All Cases <ArrowUpRight size={14} />
          </Link>
        </div>
        <CaseTable cases={cases} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Forensic Officer — Simple evidence & report dashboard
   --------------------------------------------------------- */
function ForensicDashboard() {
  const { currentUser, cases } = useApp();
  const navigate = useNavigate();

  const assignedCases = cases.filter(
    (c) =>
      c.assignedForensicOfficer === currentUser?.name ||
      c.assignedForensicOfficer?.includes("Ananya") ||
      c.assignedForensicOfficer !== "To be assigned by Administrator"
  );

  const displayCases = assignedCases.length > 0 ? assignedCases : cases;

  const pendingCount = displayCases.filter((c) => !c.documents?.some((d) => d.isForensicReport)).length;
  const submittedCount = displayCases.filter((c) => c.documents?.some((d) => d.isForensicReport)).length;

  return (
    <div className="stack animate-fade-in">
      <div className="card row">
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 700 }}>Forensic Workspace</h1>
          <p className="page-subtext">Welcome, {currentUser?.name || "Forensic Officer"} · Evidence extraction &amp; analysis workspace.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/reports")}>
          <FileCheck size={16} /> My Reports
        </button>
      </div>

      <div className="grid-3">
        <StatCard label="Assigned Cases" value={String(displayCases.length).padStart(2, "0")} icon={FolderKanban} foot="Assigned investigations" footClass="foot-muted" />
        <StatCard label="Pending Reports" value={String(pendingCount).padStart(2, "0")} icon={Clock} foot="Awaiting lab analysis" footClass="foot-amber" />
        <StatCard label="Submitted Reports" value={String(submittedCount).padStart(2, "0")} icon={ShieldCheck} foot="Signed &amp; verified" footClass="foot-success" />
      </div>

      <div className="card">
        <div className="row" style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 700 }}>Assigned Investigation Cases</h2>
          <Link to="/reports" className="link-gold" style={{ fontSize: 12.5 }}>Manage Reports →</Link>
        </div>

        <div className="table-wrap" style={{ boxShadow: "none", border: "1px solid var(--border)" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Case Name</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayCases.map((c) => {
                const hasReport = c.documents?.some((d) => d.isForensicReport);
                return (
                  <tr key={c.id}>
                    <td data-label="Case ID" className="mono" style={{ fontWeight: 700 }}>
                      <span className="evidence-id-badge">{c.id}</span>
                    </td>
                    <td data-label="Case Name" style={{ fontWeight: 600 }}>{c.name}</td>
                    <td data-label="Category" className="subtext">{c.category}</td>
                    <td data-label="Priority">
                      <span style={{ fontWeight: 700, fontSize: 11.5, color: c.priority === "Critical" ? "var(--danger)" : "var(--text)" }}>
                        {c.priority}
                      </span>
                    </td>
                    <td data-label="Status"><StatusBadge status={c.status} /></td>
                    <td data-label="Action" className="text-right">
                      <Link to="/reports" className={hasReport ? "btn btn-secondary btn-sm" : "btn btn-primary btn-sm"}>
                        {hasReport ? "[View Report]" : "[Upload Report]"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Judicial Officer — Search & Court Filings Dashboard
   --------------------------------------------------------- */
function JudicialDashboard() {
  const { currentUser, cases } = useApp();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId) {
      navigate(`/search-cases?q=${encodeURIComponent(searchId)}`);
    }
  };

  return (
    <div className="stack animate-fade-in">
      <div className="card row">
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 700 }}>Judicial Review Dashboard</h1>
          <p className="page-subtext">Welcome, {currentUser?.name || "Justice Malhotra"} · High Court Registry &amp; Case Review</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/my-uploads")}>
          <UploadCloud size={16} /> My Court Filings
        </button>
      </div>

      <div className="card" style={{ background: "var(--navy)", color: "#fff" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--gold)", marginBottom: 8 }}>
          Instant Case Record Search
        </h2>
        <p style={{ fontSize: 12.5, color: "#9AA5B1", marginBottom: 14 }}>
          Search cases by Case ID to inspect FIRs, Witness Statements, Evidence, and attach Court Orders.
        </p>

        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 10 }}>
          <div className="topbar-search" style={{ flex: 1 }}>
            <Search size={15} />
            <input
              type="text"
              placeholder="Enter Case ID (e.g. CASE-2026-001)..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={{ width: "100%", background: "#fff", color: "var(--text)" }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ background: "var(--gold)", color: "var(--navy)" }}>
            Search Cases
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          Cases Ready for Judicial Review
        </h2>
        <CaseTable cases={cases} readOnly />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Administrator — Control center dashboard
   --------------------------------------------------------- */
function AdminDashboard() {
  const { users, cases, updateUserStatus } = useApp();
  const navigate = useNavigate();

  const pendingRequests = users.filter((u) => u.status === "Pending");
  const unassignedCases = cases.filter((c) => c.assignedForensicOfficer === "To be assigned by Administrator");

  return (
    <div className="stack animate-fade-in">
      <div className="card row">
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 700 }}>Admin Control Dashboard</h1>
          <p className="page-subtext">System Administration · User Clearance &amp; Case Assignments</p>
        </div>
      </div>

      <div className="grid-3">
        <StatCard label="Total Users" value={String(users.length).padStart(2, "0")} icon={Users} foot="Across 4 primary roles" footClass="foot-muted" />
        <StatCard label="Pending User Requests" value={String(pendingRequests.length).padStart(2, "0")} icon={UserCheck} foot="Clearance review required" footClass="foot-amber" />
        <StatCard label="Active Cases" value={String(cases.length).padStart(2, "0")} icon={FolderKanban} foot="Registered in system" footClass="foot-success" />
      </div>

      <div className="grid-2">
        {/* PENDING USERS CARD */}
        <div className="card">
          <div className="row" style={{ marginBottom: 14 }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 700 }}>Pending User Requests</h2>
            <Link to="/user-approval" className="link-gold" style={{ fontSize: 12 }}>Manage All →</Link>
          </div>

          {pendingRequests.length === 0 ? (
            <p className="subtext" style={{ fontSize: 12.5 }}>No pending user access requests.</p>
          ) : (
            <div className="stack" style={{ gap: 10 }}>
              {pendingRequests.map((u) => (
                <div key={u.id} style={{ padding: 12, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                  <div className="row">
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</p>
                      <p style={{ fontSize: 11, color: "var(--subtext)" }}>Requested: {u.role} · {u.department}</p>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-success btn-sm" onClick={() => updateUserStatus(u.id, "Active")}>
                        Approve
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => updateUserStatus(u.id, "Rejected")}>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* UNASSIGNED CASES CARD */}
        <div className="card">
          <div className="row" style={{ marginBottom: 14 }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 700 }}>Pending Forensic Assignments</h2>
            <Link to="/assign-forensic" className="link-gold" style={{ fontSize: 12 }}>Assign Queue →</Link>
          </div>

          {unassignedCases.length === 0 ? (
            <p className="subtext" style={{ fontSize: 12.5 }}>All active cases have assigned Forensic Officers.</p>
          ) : (
            <div className="stack" style={{ gap: 10 }}>
              {unassignedCases.map((c) => (
                <div key={c.id} style={{ padding: 12, background: "var(--amber-bg)", border: "1px solid var(--amber-border)", borderRadius: "var(--radius-sm)" }}>
                  <div className="row">
                    <div>
                      <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--gold-dark)" }}>{c.id}</span>
                      <p style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</p>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate("/assign-forensic")}>
                      <UserPlus size={13} /> Assign Officer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Shared Components
   --------------------------------------------------------- */
function StatCard({ label, value, icon: Icon, foot, footClass }) {
  return (
    <div className="stat-card" style={{ padding: "18px 20px" }}>
      <div className="stat-card-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, color: "var(--subtext)" }}>
          {label}
        </span>
        {Icon && <Icon size={18} color="var(--gold-dark)" />}
      </div>
      <p className="stat-card-value" style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 700, color: "var(--text)", margin: "4px 0 6px 0", lineHeight: 1 }}>
        {value}
      </p>
      {foot && (
        <p className={`stat-card-foot ${footClass}`} style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, margin: "6px 0 0 0" }}>
          {foot}
        </p>
      )}
    </div>
  );
}

function CaseTable({ cases, readOnly }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Case ID</th>
            <th>Case Title</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th className="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id}>
              <td data-label="Case ID" className="mono" style={{ fontWeight: 600, color: "var(--text)", fontSize: 13 }}>
                {c.id}
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
              <td data-label="Status"><StatusBadge status={c.status} /></td>
              <td data-label="Action" className="text-right">
                <Link to={`/cases/${c.id}`} className="link-gold">
                  {readOnly ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Eye size={13} /> View Record
                    </span>
                  ) : (
                    "View Details →"
                  )}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
