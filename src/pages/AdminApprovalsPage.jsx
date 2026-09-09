import React, { useEffect, useState } from "react";
import { UserCheck, CheckCircle2, XCircle, RefreshCw, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getErrorMessage } from "../api/client";
import StatusBadge from "../components/common/StatusBadge";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminApprovalsPage() {
  const {
    accessRequests,
    accessRequestsLoading,
    accessRequestsError,
    fetchAccessRequests,
    decideAccessRequest,
  } = useApp();

  const [actionError, setActionError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchAccessRequests();
  }, [fetchAccessRequests]);

  const pendingRequests = accessRequests.filter((r) => r.status === "Pending");
  const processedRequests = accessRequests.filter((r) => r.status !== "Pending");

  const handleDecision = async (requestId, action) => {
    setActionError(null);
    setProcessingId(requestId);

    let rejectionReason = null;
    if (action === "Rejected") {
      rejectionReason = window.prompt("Rejection reason (optional):") || null;
    }

    try {
      await decideAccessRequest(requestId, action, rejectionReason);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="stack animate-fade-in">
      <div className="card row">
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700 }}>
            User Approval Requests
          </h1>
          <p className="page-subtext">
            Review officer credentials and approve or deny access requests for NyayaVault platform
            clearance.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={fetchAccessRequests}
          disabled={accessRequestsLoading}
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <RefreshCw size={14} />
          {accessRequestsLoading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {(accessRequestsError || actionError) && (
        <div
          className="card"
          style={{
            background: "var(--danger-bg, #fef2f2)",
            border: "1px solid var(--danger-border, #fecaca)",
            color: "var(--danger, #dc2626)",
            padding: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
          }}
        >
          <AlertCircle size={18} />
          <span>{actionError || accessRequestsError}</span>
        </div>
      )}

      <div className="card">
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          Pending Requests ({pendingRequests.length})
        </h2>

        {accessRequestsLoading && accessRequests.length === 0 ? (
          <p className="subtext" style={{ padding: 24, textAlign: "center" }}>
            Loading access requests…
          </p>
        ) : pendingRequests.length === 0 ? (
          <div
            style={{
              padding: 24,
              background: "var(--bg)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              textAlign: "center",
            }}
          >
            <UserCheck size={28} color="var(--success)" style={{ marginInline: "auto", marginBottom: 6 }} />
            <p style={{ fontWeight: 600 }}>All user clearance requests have been reviewed.</p>
          </div>
        ) : (
          <div className="grid-2">
            {pendingRequests.map((r) => (
              <div
                key={r.id}
                className="card card-tight"
                style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
              >
                <div className="row">
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{r.full_name}</h3>
                    <p style={{ fontSize: 12, color: "var(--subtext)" }}>{r.email}</p>
                  </div>
                  <StatusBadge status="Pending" />
                </div>

                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: "1px solid var(--border)",
                    fontSize: 12.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div>
                    <span className="subtext">Requested Role:</span>{" "}
                    <strong style={{ color: "var(--gold-dark)" }}>{r.requested_role}</strong>
                  </div>
                  <div>
                    <span className="subtext">Department:</span> <strong>{r.department}</strong>
                  </div>
                  <div>
                    <span className="subtext">Government ID:</span>{" "}
                    <strong className="mono">{r.government_id}</strong>
                  </div>
                  <div>
                    <span className="subtext">Mobile:</span> <strong>{r.mobile}</strong>
                  </div>
                  {r.reason && (
                    <div>
                      <span className="subtext">Reason:</span> <span>{r.reason}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button
                    className="btn btn-success btn-sm"
                    style={{ flex: 1 }}
                    disabled={processingId === r.id}
                    onClick={() => handleDecision(r.id, "Approved")}
                  >
                    <CheckCircle2 size={14} /> Approve Access
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1 }}
                    disabled={processingId === r.id}
                    onClick={() => handleDecision(r.id, "Rejected")}
                  >
                    <XCircle size={14} /> Reject Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          Recent Approvals History
        </h2>

        <div className="table-wrap" style={{ boxShadow: "none", border: "1px solid var(--border)" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Officer Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {processedRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center subtext" style={{ padding: 32 }}>
                    No processed requests yet.
                  </td>
                </tr>
              ) : (
                processedRequests.map((r) => (
                  <tr key={r.id}>
                    <td data-label="Officer Name" style={{ fontWeight: 600 }}>
                      {r.full_name}
                    </td>
                    <td data-label="Role">{r.requested_role}</td>
                    <td data-label="Department" className="subtext">
                      {r.department}
                    </td>
                    <td data-label="Status">
                      <StatusBadge status={r.status} />
                    </td>
                    <td data-label="Submitted" className="subtext">
                      {formatDate(r.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
