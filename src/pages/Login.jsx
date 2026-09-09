import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Scale,
  Shield,
  Phone,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Lock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { getErrorMessage } from "../api/client";

const ROLE_GOV_IDS = {
  "Legal Officer": "GOV-IND-2026-9812",
  "Forensic Officer": "GOV-IND-2026-4412",
  "Court Authority": "GOV-IND-2026-1002",
  Administrator: "GOV-IND-2026-0001",
};

const ROLE_MOBILES = {
  "Legal Officer": "+91 98765 43210",
  "Forensic Officer": "+91 98765 43211",
  "Court Authority": "+91 98765 43212",
  Administrator: "+91 98765 43213",
};

export default function Login() {
  const { loginWithBackend, verifyOtpWithBackend } = useApp();
  const navigate = useNavigate();

  const [role, setRole] = useState("Legal Officer");
  const [govId, setGovId] = useState(ROLE_GOV_IDS["Legal Officer"]);
  const [mobile, setMobile] = useState(ROLE_MOBILES["Legal Officer"]);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setGovId(ROLE_GOV_IDS[selectedRole]);
    setMobile(ROLE_MOBILES[selectedRole]);
    setErrorMsg("");
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!govId || !mobile) {
      setErrorMsg("Please enter Government ID and Mobile Number.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await loginWithBackend(role, govId, mobile);
      if (res?.user_id) {
        setUserId(res.user_id);
        setOtp("");
        setStep(2);
      } else {
        setErrorMsg("Unexpected response from server. Please try again.");
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLogin = async (e) => {
    e.preventDefault();
    if (!otp) {
      setErrorMsg("Please enter the OTP.");
      return;
    }
    if (!userId) {
      setErrorMsg("Session expired. Please request a new OTP.");
      setStep(1);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await verifyOtpWithBackend(userId, otp);
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-left">
        <Scale className="login-watermark" size={420} strokeWidth={0.6} />

        <div className="login-brand">
          <div className="sidebar-mark">
            <Scale size={20} />
          </div>
          <div>
            <span className="login-wordmark">NyayaVault</span>
            <p className="login-wordmark-sub">Digital Case &amp; Evidence Management</p>
          </div>
        </div>

        <div className="login-hero">
          <span className="login-eyebrow">SECURE PLATFORM</span>
          <h1 className="login-headline">
            Every record.
            <br />
            Every piece of evidence.
            <br />
            <span className="gold-text">Securely accounted for.</span>
          </h1>
          <p className="login-desc">
            A unified platform for legal officers, forensic teams, court authorities, and
            administrators to manage cases and evidence with integrity and accountability.
          </p>
        </div>

        <div className="login-trustrow">
          <span>
            <ShieldCheck size={14} color="var(--gold)" /> AES-256 Encrypted
          </span>
          <span>
            <Lock size={14} color="var(--gold)" /> Role-Based Access
          </span>
          <span>
            <CheckCircle2 size={14} color="var(--gold)" /> Audit Compliant
          </span>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-head">
            <span className="login-form-eyebrow">
              <span className="login-form-eyebrow-bar" /> SECURE ACCESS
            </span>
            <h2 className="login-form-title">
              {step === 1 ? "Welcome back" : "OTP Verification"}
            </h2>
            <p className="page-subtext">
              {step === 1
                ? "Sign in to access your secure workspace."
                : `Enter the 6-digit OTP sent to ${mobile}`}
            </p>
          </div>

          {errorMsg && (
            <div
              style={{
                background: "var(--danger-bg, #fef2f2)",
                border: "1px solid var(--danger-border, #fecaca)",
                color: "var(--danger, #dc2626)",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm, 6px)",
                fontSize: 12.5,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp}>
              <div className="field">
                <label>Select Role</label>
                <select value={role} onChange={(e) => handleRoleSelect(e.target.value)}>
                  <option value="Legal Officer">Legal Officer</option>
                  <option value="Forensic Officer">Forensic Officer</option>
                  <option value="Court Authority">Court Authority / Judicial Officer</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>

              <div className="field">
                <label>Government ID</label>
                <div className="input-icon-wrap">
                  <Shield size={16} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. GOV-IND-2026-9812"
                    value={govId}
                    onChange={(e) => setGovId(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label>Registered Mobile Number</label>
                <div className="input-icon-wrap">
                  <Phone size={16} />
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? "Sending OTP..." : "Send OTP"}{" "}
                <ArrowRight size={14} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyLogin}>
              <div
                style={{
                  background: "var(--success-bg)",
                  border: "1px solid var(--success-border)",
                  color: "var(--success)",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 12,
                  marginBottom: 16,
                }}
              >
                ✓ OTP sent to <strong>{mobile}</strong>. Check your SMS and enter the code below.
              </div>

              <div className="field">
                <label>Enter 6-Digit OTP</label>
                <div className="input-icon-wrap">
                  <KeyRound size={16} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter OTP"
                    className="mono"
                    style={{ letterSpacing: "0.2em", fontWeight: 700, fontSize: 16 }}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              </div>

              <div className="login-remember-row" style={{ marginTop: 4 }}>
                <span style={{ fontSize: 11.5, color: "var(--subtext)" }}>
                  Role: <strong>{role}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setUserId(null);
                    setOtp("");
                    setErrorMsg("");
                  }}
                  className="link-gold"
                  style={{ fontSize: 12, background: "none", border: "none", padding: 0 }}
                >
                  <RefreshCw size={12} style={{ display: "inline", marginRight: 4 }} /> Edit Details
                </button>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 12 }}>
                {loading ? "Verifying..." : "Verify OTP & Sign In"} <ShieldCheck size={15} />
              </button>
            </form>
          )}

          <div className="login-footer">
            <Link to="/register">
              Need access? <strong style={{ color: "var(--gold-dark)" }}>Request an account</strong>
            </Link>
          </div>

          <div className="login-security-note">
            <ShieldCheck size={13} /> Protected by enterprise-grade security
          </div>
        </div>
      </div>
    </div>
  );
}
