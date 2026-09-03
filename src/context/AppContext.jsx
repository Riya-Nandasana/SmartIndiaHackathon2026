import React, { createContext, useContext, useState, useEffect } from "react";
import {
  INITIAL_USERS,
  INITIAL_CASES,
  INITIAL_EVIDENCE,
  INITIAL_AUDIT_LOGS,
  PERMISSION_MATRIX,
} from "../data/mockData";

const AppContext = createContext(null);

function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() =>
    loadFromStorage("lextrace_user", null)
  );
  const [cases, setCases] = useState(() =>
    loadFromStorage("lextrace_cases", INITIAL_CASES)
  );
  const [evidenceList, setEvidenceList] = useState(() =>
    loadFromStorage("lextrace_evidence", INITIAL_EVIDENCE)
  );
  const [auditLogs, setAuditLogs] = useState(() =>
    loadFromStorage("lextrace_logs", INITIAL_AUDIT_LOGS)
  );
  const [users, setUsers] = useState(() =>
    loadFromStorage("lextrace_users", INITIAL_USERS)
  );

  useEffect(() => {
    if (currentUser) localStorage.setItem("lextrace_user", JSON.stringify(currentUser));
    else localStorage.removeItem("lextrace_user");
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("lextrace_cases", JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem("lextrace_evidence", JSON.stringify(evidenceList));
  }, [evidenceList]);

  useEffect(() => {
    localStorage.setItem("lextrace_logs", JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem("lextrace_users", JSON.stringify(users));
  }, [users]);

  const addAuditLog = (action, caseId = "System") => {
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp:
        "02 Sep 2026 • " +
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      user: `${currentUser?.name ?? "Unknown"} (${currentUser?.role ?? "—"})`,
      action,
      caseId,
      ip: "192.168.1.45",
      status: "Success",
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addCase = (newCase) => {
    const created = {
      ...newCase,
      id: `CASE-2026-${String(cases.length + 5).padStart(3, "0")}`,
      status: "Active",
      updated: "02 Sep 2026",
      timeline: [{ event: "Case Registered", date: "02 Sep 2026", time: "Now" }],
      documents: newCase.documents || [
        {
          name: "Initial FIR",
          file: "FIR.pdf",
          type: "FIR",
          access: "Available",
          hash: "SHA256:c0ffee112233445566778899aabbccdd",
          status: "Verified",
        },
      ],
    };
    setCases((prev) => [created, ...prev]);
    addAuditLog(`Created new case ${created.id}`, created.id);
    return created;
  };

  const updateUserStatus = (userId, status) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)));
    addAuditLog(`Updated user ${userId} status to ${status}`);
  };

  const login = (user) => {
    setCurrentUser(user);
    addAuditLog(`Logged in as ${user.role}`);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        cases,
        addCase,
        evidenceList,
        auditLogs,
        addAuditLog,
        users,
        updateUserStatus,
        permissionMatrix: PERMISSION_MATRIX,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
