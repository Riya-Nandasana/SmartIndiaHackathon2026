import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";

import MainLayout from "./components/Layout/MainLayout";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";

// Common Pages
import Dashboard from "./pages/Dashboard";
import CasesPage from "./pages/CasesPage";
import CaseDetail from "./pages/CaseDetail";
import DocumentsPage from "./pages/DocumentsPage";
import AuditLogPage from "./pages/AuditLogPage";
import ProfilePage from "./pages/ProfilePage";
import EvidencePage from "./pages/EvidencePage";

// Legal Officer
import CreateCasePage from "./pages/CreateCasePage";

// Forensic Officer
import ReportsPage from "./pages/ReportsPage";

// Judicial Officer
import JudicialSearchPage from "./pages/JudicialSearchPage";
import JudicialUploadsPage from "./pages/JudicialUploadsPage";
import UploadCourtDocuments from "./pages/uploadCourtDocuments";

// Administrator
import UsersPage from "./pages/UsersPage";
import PermissionsPage from "./pages/PermissionsPage";
import SecurityPage from "./pages/SecurityPage";
import AdminApprovalsPage from "./pages/AdminApprovalsPage";
import AssignForensicPage from "./pages/AssignForensicPage";


function ProtectedRoute({ children }) {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />


      {/* PROTECTED APPLICATION */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >

        {/* COMMON */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/evidence" element={<EvidencePage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/cases/:id" element={<CaseDetail />} />
        <Route path="/audit-log" element={<AuditLogPage />} />
        <Route path="/profile" element={<ProfilePage />} />


        {/* LEGAL OFFICER */}
        <Route path="/cases/new" element={<CreateCasePage />} />
        <Route path="/documents" element={<DocumentsPage />} />


        {/* FORENSIC OFFICER */}
        <Route path="/reports" element={<ReportsPage />} />


        {/* JUDICIAL OFFICER */}
        <Route path="/judicial-search" element={<JudicialSearchPage />} />

        <Route
          path="/upload-court-documents"
          element={<UploadCourtDocuments />}
        />

        <Route
          path="/judicial-uploads"
          element={<JudicialUploadsPage />}
        />


        {/* ADMINISTRATOR */}
        <Route
          path="/admin-approvals"
          element={<AdminApprovalsPage />}
        />

        <Route
          path="/assign-forensic"
          element={<AssignForensicPage />}
        />

        <Route path="/users" element={<UsersPage />} />

        <Route
          path="/permissions"
          element={<PermissionsPage />}
        />

        <Route
          path="/security"
          element={<SecurityPage />}
        />

      </Route>


      {/* DEFAULT */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}


export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}