import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Shield, LogOut, CheckCircle2, Key } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ProfilePage() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="stack animate-fade-in" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div className="card row">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div className="avatar" style={{ width: 56, height: 56, fontSize: 22, borderRadius: "var(--radius)" }}>
            {currentUser?.name?.charAt(0) || "U"}
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700 }}>
              {currentUser?.name || "Officer Profile"}
            </h1>
            <p className="page-subtext" style={{ fontSize: 13 }}>
              {currentUser?.role} · {currentUser?.department || "Gov Division"}
            </p>
          </div>
        </div>

        <span className="system-secure-badge">
          <span className="pulse-dot" /> Active Session
        </span>
      </div>

      <div className="card">
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          Officer Credentials &amp; Clearance
        </h2>

        <div className="grid-2" style={{ gap: 16, fontSize: 13 }}>
          <div style={{ padding: 14, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
            <span className="subtext" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Full Name</span>
            <p style={{ fontWeight: 700, marginTop: 2 }}>{currentUser?.name}</p>
          </div>

          <div style={{ padding: 14, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
            <span className="subtext" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Email Address</span>
            <p style={{ fontWeight: 700, marginTop: 2 }}>{currentUser?.email}</p>
          </div>

          <div style={{ padding: 14, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
            <span className="subtext" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Assigned Role</span>
            <p style={{ fontWeight: 700, marginTop: 2, color: "var(--gold-dark)" }}>{currentUser?.role}</p>
          </div>

          <div style={{ padding: 14, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
            <span className="subtext" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Department / Division</span>
            <p style={{ fontWeight: 700, marginTop: 2 }}>{currentUser?.department || "Central Division"}</p>
          </div>

          <div style={{ padding: 14, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
            <span className="subtext" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Government ID</span>
            <p className="mono" style={{ fontWeight: 700, marginTop: 2 }}>GOV-IND-2026-9921</p>
          </div>

          <div style={{ padding: 14, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
            <span className="subtext" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Clearance Level</span>
            <p style={{ fontWeight: 700, marginTop: 2, color: "var(--success)" }}>
              Level 4 — Encrypted Access
            </p>
          </div>
        </div>

        <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-danger" onClick={handleLogout} style={{ gap: 8 }}>
            <LogOut size={15} /> End Authorized Session
          </button>
        </div>
      </div>
    </div>
  );
}
