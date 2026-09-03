import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

const TITLES = [
  { match: "/dashboard", title: "Dashboard" },
  { match: "/cases", title: "Case Management" },
  { match: "/evidence", title: "Evidence Vault" },
  { match: "/documents", title: "Secure Document Repository" },
  { match: "/reports", title: "Investigation Reports" },
  { match: "/users", title: "User Administration" },
  { match: "/permissions", title: "Access Control & Permissions" },
  { match: "/audit-log", title: "Tamper-Resistant Audit Trail" },
  { match: "/security", title: "Security Center" },
];

export default function MainLayout() {
  const location = useLocation();
  const found = TITLES.find((t) => location.pathname.includes(t.match));
  const title = found ? found.title : "NyayaVault Portal";

  return (
    <div className="app-shell">
      <Sidebar />
      <TopNavbar title={title} />
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}
