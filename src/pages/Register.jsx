import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { api, getErrorMessage } from "../api/client";

export default function Register() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    govId: "",
    department: "",
    requestedRole: "Legal Officer",
    reason: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    let roleToSubmit = formData.requestedRole;
    if (roleToSubmit === "Court Authority / Judicial Officer") {
      roleToSubmit = "Court Authority";
    }

    try {
      const res = await api.requestAccess({
        full_name: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        government_id: formData.govId,
        department: formData.department,
        requested_role: roleToSubmit,
        reason: formData.reason,
      });
      setSuccessMsg(
        res?.message ||
          "Access request submitted successfully. Please wait for Administrator approval."
      );
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-screen">
      <div className="register-card">
        <Link to="/login" className="back-link">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>

        {submitted ? (
          <div className="confirm-block">
            <CheckCircle2 size={46} color="var(--success)" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 20, fontWeight: 700 }}>
              Access request submitted successfully.
            </h3>
            <p className="page-subtext" style={{ marginTop: 8, maxWidth: 380, marginInline: "auto" }}>
              {successMsg ||
                "Your request is pending administrator approval. You'll be notified once your access has been reviewed."}
            </p>
            <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => navigate("/login")}>
              Return to Login
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Request Access</h2>
            <p className="page-subtext">Submit your details for administrator review.</p>

            {errorMsg && (
              <div
                style={{
                  background: "var(--danger-bg, #fef2f2)",
                  border: "1px solid var(--danger-border, #fecaca)",
                  color: "var(--danger, #dc2626)",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm, 6px)",
                  fontSize: 12.5,
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
              <div className="field-row">
                <div className="field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="Officer Name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@nyayavault.gov.in"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    name="mobile"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Government ID</label>
                  <input
                    type="text"
                    name="govId"
                    required
                    placeholder="e.g. GOV-IND-2026-9812"
                    value={formData.govId}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    required
                    placeholder="Cyber Cell / Forensics"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Requested Role</label>
                  <select
                    name="requestedRole"
                    value={formData.requestedRole}
                    onChange={handleChange}
                  >
                    <option value="Legal Officer">Legal Officer</option>
                    <option value="Forensic Officer">Forensic Officer</option>
                    <option value="Court Authority">Court Authority / Judicial Officer</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Reason for Access</label>
                <textarea
                  name="reason"
                  rows={3}
                  required
                  placeholder="Specify mandate and investigation unit..."
                  value={formData.reason}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Authorization Document</label>
                <div className="dropzone">
                  <p className="dropzone-title">Drag &amp; drop file, or click to upload</p>
                  <p className="dropzone-sub">PDF up to 10MB</p>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? "Submitting Request..." : "Submit Request"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
