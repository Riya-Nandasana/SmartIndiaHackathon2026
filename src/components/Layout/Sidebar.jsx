// import React from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import {
//   LayoutDashboard,
//   FolderKanban,
//   Database,
//   FileText,
//   ShieldCheck,
//   Users,
//   Lock,
//   ScrollText,
//   ShieldAlert,
//   User,
//   LogOut,
//   Scale,
// } from "lucide-react";
// import { useApp } from "../../context/AppContext";

// const NAV_ITEMS = [
//   { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },

//   { label: "Documents", path: "/documents", icon: FileText },
//   { label: "View Evidence", path: "/evidence", icon: Database },
//   { label: "Cases", path: "/cases", icon: FolderKanban },

//   { label: "Users", path: "/users", icon: Users, adminOnly: true },
//   { label: "Permissions", path: "/permissions", icon: Lock, adminOnly: true },
//   { label: "Audit Log", path: "/audit-log", icon: ScrollText },
//   { label: "Security Center", path: "/security", icon: ShieldAlert },
//   { label: "Profile", path: "/profile", icon: User },
// ];

// export default function Sidebar() {
//   const { currentUser, logout } = useApp();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   return (
//     <aside className="sidebar">
//       <div>
//         <div className="sidebar-brand">
//           <div className="sidebar-mark">
//             <Scale size={20} />
//           </div>
//           <div>
//             <h1 className="sidebar-title">NyayaVault</h1>
//             <p className="sidebar-tagline">Secure • Verified • Traceable</p>
//           </div>
//         </div>

//         <nav className="sidebar-nav">
//           {NAV_ITEMS.map((item) => {
//             if (item.adminOnly && currentUser?.role !== "Administrator") return null;
//             const Icon = item.icon;
//             return (
//               <NavLink
//                 key={item.path}
//                 to={item.path}
//                 className={({ isActive }) =>
//                   "sidebar-link" + (isActive ? " active" : "")
//                 }
//               >
//                 <Icon size={17} />
//                 <span>{item.label}</span>
//               </NavLink>
//             );
//           })}
//         </nav>
//       </div>

//       <div className="sidebar-footer">
//         <div className="sidebar-user">
//           <div style={{ minWidth: 0 }}>
//             <p className="sidebar-user-name">{currentUser?.name}</p>
//             <p className="sidebar-user-role">{currentUser?.role}</p>
//           </div>
//           <button className="icon-btn" title="Logout" onClick={handleLogout}>
//             <LogOut size={16} />
//           </button>
//         </div>
//       </div>
//     </aside>
//   );
// }
import { NavLink, useNavigate } from "react-router-dom";
import {
  PlusCircle,
  FolderKanban,
  Search,
  FileText,
  Database,
  ShieldCheck,
  FolderOpen,
  ClipboardList,
  Upload,
  Users,
  UserCheck,
  Settings,
  LayoutDashboard,
  LogOut,
  Lock,
  Scale,
  X,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

const menuByRole = {
  "Legal Officer": [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Create Case", path: "/cases/new", icon: PlusCircle },
    { label: "My Cases", path: "/cases", icon: FolderOpen },
    { label: "Audit Log", path: "/audit-log", icon: ClipboardList },
    { label: "Profile", path: "/profile", icon: Users },
  ],
  "Forensic Officer": [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Assigned Cases", path: "/cases", icon: FolderOpen },
    { label: "My Reports", path: "/reports", icon: FileText },
   
    { label: "Audit Log", path: "/audit-log", icon: ClipboardList },
    { label: "Profile", path: "/profile", icon: Users },
  ],
  "Court Authority": [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Search Cases", path: "/judicial-search", icon: Search },
    { label: "Case Documents", path: "/cases", icon: FolderOpen },
    { label: "Upload Court Document", path: "/upload-court-documents", icon: Upload },
    { label: "My Uploads", path: "/judicial-uploads", icon: FileText },
    { label: "Audit Log", path: "/audit-log", icon: ClipboardList },
    { label: "Profile", path: "/profile", icon: Users },
  ],
  "Administrator": [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "User Approvals", path: "/admin-approvals", icon: UserCheck },
    { label: "Assign Forensic Officer", path: "/assign-forensic", icon: ShieldCheck },
    { label: "User Management", path: "/users", icon: Users },
    { label: "Permissions", path: "/permissions", icon: Lock },
    { label: "System Overview", path: "/security", icon: Settings },
    { label: "Profile", path: "/profile", icon: Users },
  ],
};

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  const role = currentUser?.role || "Legal Officer";
  const menuItems = menuByRole[role] || [];

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
    navigate("/login");
  };

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-brand-inner">
            <Scale size={20} color="var(--gold)" />
            <h2>NyayaVault</h2>
          </div>
          {/* <button
            className="icon-btn sidebar-close-btn"
            onClick={onClose}
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button> */}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.path}
                end
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
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