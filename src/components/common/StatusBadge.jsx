import React from "react";

export default function StatusBadge({ status }) {
  const key = (status || "").toLowerCase();

  let className = "badge badge-neutral";
  if (["active", "verified", "success"].includes(key)) className = "badge badge-success";
  else if (["under review", "pending", "pending analysis", "pending review"].includes(key))
    className = "badge badge-warning";
  else if (["critical", "blocked", "restricted", "encrypted"].includes(key))
    className = "badge badge-danger";

  return <span className={className}>{status}</span>;
}
