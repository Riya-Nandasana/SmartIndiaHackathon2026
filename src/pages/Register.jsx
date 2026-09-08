import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
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
              Your request is pending administrator approval. You'll be notified once your
              access has been reviewed.
            </p>
            <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => navigate("/login")}>
              Return to Login
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Request Access</h2>
            <p className="page-subtext">Submit your details for administrator review.</p>

            <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
              <div className="field-row">
                <div className="field">
                  <label>Full Name</label>
                  <input type="text" required placeholder="Officer Name" />
                </div>
                <div className="field">
                  <label>Email Address</label>
                  <input type="email" required placeholder="name@nyayavault.gov.in" />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Mobile Number</label>
                  <input type="tel" required placeholder="+91 98765 43210" />
                </div>
                <div className="field">
                  <label>Government ID</label>
                  <input type="text" required placeholder="e.g. GOV-IND-2026-9812" />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Department</label>
                  <input type="text" required placeholder="Cyber Cell / Forensics" />
                </div>
                <div className="field">
                  <label>Requested Role</label>
                  <select defaultValue="Legal Officer">
                    <option>Legal Officer</option>
                    <option>Forensic Officer</option>
                    <option>Court Authority / Judicial Officer</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Reason for Access</label>
                <textarea rows={3} required placeholder="Specify mandate and investigation unit..." />
              </div>

              <div className="field">
                <label>Authorization Document</label>
                <div className="dropzone">
                  <p className="dropzone-title">Drag &amp; drop file, or click to upload</p>
                  <p className="dropzone-sub">PDF up to 10MB</p>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 8 }}>
                Submit Request
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
