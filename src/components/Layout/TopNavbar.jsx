import React from "react";
import { Search, Bell, Shield,Menu } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function TopNavbar({ title, onMenuClick}) {
  const { currentUser } = useApp();

  return (
    <header className="topbar">
      <div className="topbar-left">
      
        <h2 className="topbar-title">{title}</h2>
        <span className="topbar-role">
          <Shield size={12} color="var(--gold)" />
          Role: <strong>{currentUser?.role}</strong>
        </span>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <Search size={15} />
          <input type="text" placeholder="Search cases, evidence, hashes..." />
        </div>
        <button className="topbar-bell" title="Notifications">
          <Bell size={16} />
        </button>
        <div className="avatar">{currentUser?.name?.charAt(0)}</div>
      </div>
    </header>
  );
}