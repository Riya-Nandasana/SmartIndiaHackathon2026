import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, ApiError } from "../api/client";
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
  const [token, setToken] = useState(() => localStorage.getItem("lextrace_token") || null);
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
  const [accessRequests, setAccessRequests] = useState([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const clearSession = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    setIsBackendConnected(false);
    localStorage.removeItem("lextrace_token");
    localStorage.removeItem("lextrace_user");
  }, []);

  // Normalize user object for frontend consumption
  const normalizeUser = (u) => {
    if (!u) return null;
    return {
      ...u,
      id: u.id || u.user_id || "U-01",
      name: u.name || u.full_name || "Authorized User",
      full_name: u.full_name || u.name || "Authorized User",
      govId: u.govId || u.government_id || "GOV-IND-2026-0000",
      government_id: u.government_id || u.govId || "GOV-IND-2026-0000",
      role: u.role || "Legal Officer",
      department: u.department || "HQ Secure Division",
    };
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem("lextrace_token", token);
    } else {
      localStorage.removeItem("lextrace_token");
    }
  }, [token]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("lextrace_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("lextrace_user");
    }
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

  // Map API cases format to UI format
  const mapApiCaseToUi = (c) => ({
    id: c.case_number || c.id,
    apiId: c.id,
    name: c.title || c.name || "Untitled Case",
    title: c.title || c.name || "Untitled Case",
    category: c.category || "General",
    description: c.description || "",
    priority: c.priority || "Medium",
    status: c.status || "Active",
    created: c.created_at ? new Date(c.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Recently",
    assignedForensicOfficer: c.forensic_officer?.full_name || c.assignedForensicOfficer || "To be assigned by Administrator",
    forensicOfficerId: c.assigned_forensic_officer || c.forensic_officer?.id,
    legalOfficer: c.legal_officer?.full_name || "Legal Officer",
    documents: c.documents || [
      {
        name: "Initial FIR",
        file: "FIR.pdf",
        type: "FIR",
        access: "Available",
        hash: "SHA256:c0ffee112233445566778899aabbccdd",
        status: "Verified",
      },
    ],
  });

  // Load backend data when authenticated
  const refreshBackendData = useCallback(async () => {
    if (!token) {
      setIsBackendConnected(false);
      return;
    }

    let activeUser;
    try {
      const userRes = await api.getCurrentUser();
      if (userRes?.id) {
        activeUser = normalizeUser(userRes);
        setCurrentUser(activeUser);
        setIsBackendConnected(true);
      }
    } catch (err) {
      setIsBackendConnected(false);
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        clearSession();
      }
      return;
    }

    try {
      const casesRes = await api.getCases();
      if (Array.isArray(casesRes)) {
        setCases(casesRes.length > 0 ? casesRes.map(mapApiCaseToUi) : []);
      }
    } catch (err) {
      console.warn("Failed to load cases:", err.message);
    }

    try {
      const usersRes = await api.getUsers();
      if (Array.isArray(usersRes) && usersRes.length > 0) {
        setUsers(
          usersRes.map((u) => ({
            id: u.id,
            name: u.full_name,
            email: u.email,
            mobile: u.mobile,
            govId: u.government_id,
            department: u.department,
            role: u.role,
            status: u.status,
          }))
        );
      }
    } catch (err) {
      console.warn("Failed to load users:", err.message);
    }

    if (activeUser?.role === "Administrator") {
      try {
        const reqsRes = await api.getAccessRequests();
        if (Array.isArray(reqsRes)) {
          setAccessRequests(reqsRes);
        }
      } catch (err) {
        console.warn("Failed to load access requests:", err.message);
      }
    }

    try {
      const logsRes = await api.getAuditLogs();
      if (Array.isArray(logsRes) && logsRes.length > 0) {
        setAuditLogs(
          logsRes.map((l) => ({
            id: l.id || `LOG-${Date.now()}`,
            timestamp: l.created_at ? new Date(l.created_at).toLocaleString() : "Recently",
            user: l.user_id || "System",
            action: l.action,
            caseId: l.case_id || "System",
            ip: l.ip_address || "—",
            status: l.status || "Success",
          }))
        );
      }
    } catch (err) {
      console.warn("Failed to load audit logs:", err.message);
    }
  }, [token, clearSession]);

  useEffect(() => {
    if (!token) {
      setAuthChecked(true);
      return;
    }

    let cancelled = false;
    (async () => {
      await refreshBackendData();
      if (!cancelled) setAuthChecked(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [token, refreshBackendData]);

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

  const loginWithBackend = async (role, govId, mobile) => {
    const res = await api.login({ role, government_id: govId, mobile });
    return res; // returns { user_id, email, message, otp (if dev_return_otp) }
  };

  const verifyOtpWithBackend = async (userId, otp) => {
    const res = await api.verifyOtp(userId, otp);
    if (!res.access_token) {
      throw new Error("Invalid response from verification server.");
    }

    localStorage.setItem("lextrace_token", res.access_token);
    setToken(res.access_token);

    const user = normalizeUser(res.user);
    setCurrentUser(user);
    setIsBackendConnected(true);
    setAuthChecked(true);

    try {
      const casesRes = await api.getCases();
      if (Array.isArray(casesRes)) {
        setCases(casesRes.length > 0 ? casesRes.map(mapApiCaseToUi) : []);
      }
    } catch (err) {
      console.warn("Failed to load cases after login:", err.message);
    }

    return user;
  };

  const logout = () => {
    clearSession();
    setAuthChecked(true);
  };

  const addCase = async (newCase) => {
    let createdCase;
    try {
      const apiRes = await api.createCase(newCase);
      if (apiRes && apiRes.id) {
        createdCase = mapApiCaseToUi(apiRes);
      }
    } catch (e) {
      console.warn("Backend case creation failed, saving locally:", e.message);
    }

    if (!createdCase) {
      createdCase = {
        ...newCase,
        id: newCase.case_number || `CASE-2026-${String(cases.length + 5).padStart(3, "0")}`,
        name: newCase.title || newCase.name || "Untitled Case",
        title: newCase.title || newCase.name || "Untitled Case",
        status: "Active",
        updated: "02 Sep 2026",
        assignedForensicOfficer: newCase.assignedForensicOfficer || "To be assigned by Administrator",
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
    }

    setCases((prev) => [createdCase, ...prev]);
    addAuditLog(`Created new case ${createdCase.id}`, createdCase.id);
    return createdCase;
  };

  const updateUserStatus = async (userId, status) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)));
    addAuditLog(`Updated user ${userId} status to ${status}`);
  };

  const decideAccessRequest = async (requestId, action, rejectionReason = null) => {
    try {
      await api.decideAccessRequest(requestId, action, rejectionReason);
    } catch (e) {
      console.warn("Backend access request decision failed, updating locally:", e.message);
    }
    setAccessRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: action, rejection_reason: rejectionReason } : r))
    );
    addAuditLog(`Decided access request ${requestId}: ${action}`);
  };

  const assignForensicOfficer = async (caseId, officerId) => {
    try {
      const res = await api.assignForensicOfficer(caseId, officerId);
      if (res && res.case) {
        refreshBackendData();
        return res;
      }
    } catch (e) {
      console.warn("Backend forensic assignment failed, updating locally:", e.message);
    }

    const officerObj = users.find((u) => u.id === officerId);
    const officerName = officerObj ? officerObj.name || officerObj.full_name : "Forensic Officer";
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId || c.apiId === caseId
          ? { ...c, assignedForensicOfficer: officerName, forensicOfficerId: officerId }
          : c
      )
    );
    addAuditLog(`Assigned forensic officer ${officerName} to case ${caseId}`);
  };

  return (
    <AppContext.Provider
      value={{
        token,
        authChecked,
        currentUser: normalizeUser(currentUser),
        loginWithBackend,
        verifyOtpWithBackend,
        logout,
        cases,
        addCase,
        evidenceList,
        auditLogs,
        addAuditLog,
        users,
        updateUserStatus,
        accessRequests,
        decideAccessRequest,
        assignForensicOfficer,
        refreshBackendData,
        isBackendConnected,
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
