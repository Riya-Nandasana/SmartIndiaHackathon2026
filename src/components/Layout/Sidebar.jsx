import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Database,
  FileText,
  ShieldCheck,
  Users,
  Lock,
  ScrollText,
  ShieldAlert,
  User,
  LogOut,
  Scale,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },

  { label: "Documents", path: "/documents", icon: FileText },
  { label: "Investigation Reports", path: "/reports", icon: ShieldCheck },
  { label: "Users", path: "/users", icon: Users, adminOnly: true },
  { label: "Permissions", path: "/permissions", icon: Lock, adminOnly: true },
  { label: "Audit Log", path: "/audit-log", icon: ScrollText },
  { label: "Security Center", path: "/security", icon: ShieldAlert },
  { label: "Profile", path: "/profile", icon: User },
];

export default function Sidebar() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">
          <div className="sidebar-mark">
            <Scale size={20} />
          </div>
          <div>
            <h1 className="sidebar-title">NyayaVault</h1>
            <p className="sidebar-tagline">Secure • Verified • Traceable</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            if (item.adminOnly && currentUser?.role !== "Administrator") return null;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  "sidebar-link" + (isActive ? " active" : "")
                }
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div style={{ minWidth: 0 }}>
            <p className="sidebar-user-name">{currentUser?.name}</p>
            <p className="sidebar-user-role">{currentUser?.role}</p>
          </div>
          <button className="icon-btn" title="Logout" onClick={handleLogout}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
