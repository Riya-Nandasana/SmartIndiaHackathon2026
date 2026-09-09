export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

export class ApiError extends Error {
  constructor(message, { status = 0, type = "unknown", detail = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.type = type;
    this.detail = detail;
  }
}

function parseDetail(detail) {
  if (!detail) return null;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const field = item.loc?.slice(-1)[0];
        return field ? `${field}: ${item.msg}` : item.msg;
      })
      .join("; ");
  }
  return String(detail);
}

function classifyError(status, message) {
  if (status === 0) return "network";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 422) return "validation";
  if (status >= 500) return "server";
  return "client";
}

export function getErrorMessage(err) {
  if (err instanceof ApiError) return err.message;
  if (err instanceof TypeError && /fetch|network/i.test(err.message)) {
    return "Cannot reach the backend. Make sure the API server is running.";
  }
  return err?.message || "Something went wrong. Please try again.";
}

function getAuthHeaders() {
  const token = localStorage.getItem("lextrace_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...getAuthHeaders(),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    throw new ApiError("Cannot reach the backend. Make sure the API server is running.", {
      status: 0,
      type: "network",
    });
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = parseDetail(data.detail) || data.message || null;
    const message =
      detail ||
      (response.status === 401
        ? "Session expired. Please sign in again."
        : response.status === 403
          ? "You do not have permission for this action."
          : response.status === 404
            ? "The requested resource was not found."
            : response.status === 422
              ? "Invalid request. Please check your input."
              : response.status >= 500
                ? "Server error. Please try again later."
                : `Request failed (${response.status}).`);

    throw new ApiError(message, {
      status: response.status,
      type: classifyError(response.status, message),
      detail: data.detail ?? null,
    });
  }

  return data;
}

export const api = {
  health: () => request("/health"),

  login: (data) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        role: data.role,
        government_id: data.government_id || data.govId,
        mobile: data.mobile,
      }),
    }),

  verifyOtp: (user_id, otp) =>
    request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ user_id, otp }),
    }),

  requestAccess: (data) =>
    request("/auth/access-request", {
      method: "POST",
      body: JSON.stringify({
        full_name: data.full_name || data.fullName,
        email: data.email,
        mobile: data.mobile,
        government_id: data.government_id || data.govId,
        department: data.department,
        requested_role: data.requested_role || data.role,
        reason: data.reason,
      }),
    }),

  getCurrentUser: () => request("/users/me"),

  getCases: () => request("/cases"),

  getCaseById: (caseId) => request(`/cases/${caseId}`),

  createCase: (data) =>
    request("/cases", {
      method: "POST",
      body: JSON.stringify({
        case_number:
          data.case_number ||
          data.id ||
          `CASE-2026-${Math.floor(100 + Math.random() * 900)}`,
        title: data.title || data.name,
        category: data.category || "General",
        description: data.description || "",
        priority: data.priority || "Medium",
      }),
    }),

  assignForensicOfficer: (caseId, forensicOfficerId) =>
    request(`/cases/${caseId}/assign-forensic`, {
      method: "PATCH",
      body: JSON.stringify({ forensic_officer_id: forensicOfficerId }),
    }),

  getCaseDocuments: (caseId) => request(`/documents/case/${caseId}`),

  uploadDocument: (caseId, file, category = "Other Documents") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    return request(`/documents/case/${caseId}/upload`, {
      method: "POST",
      body: formData,
    });
  },

  viewDocument: (documentId) => request(`/documents/${documentId}/view`),

  getAccessRequests: () => request("/admin/access-requests"),

  decideAccessRequest: (requestId, action, rejectionReason = null) =>
    request(`/admin/access-requests/${requestId}`, {
      method: "PATCH",
      body: JSON.stringify({ action, rejection_reason: rejectionReason }),
    }),

  getDashboardStats: () => request("/dashboard/stats"),

  getUsers: () => request("/users"),

  getAuditLogs: () => request("/audit"),
};

export default api;
