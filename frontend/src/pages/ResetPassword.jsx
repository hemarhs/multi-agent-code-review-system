import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function updatePassword() {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { alert(error.message); return; }
    alert("Password updated successfully!");
    navigate("/");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080b10; }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
      `}</style>
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#080b10", padding: 24, position: "relative", overflow: "hidden", fontFamily: "'Syne', sans-serif" }}>
        <div style={{ position: "fixed", top: -200, left: "50%", transform: "translateX(-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <div style={{ width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "40px 36px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #60c8f5)", display: "grid", placeItems: "center", boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                <path d="M8 1a4 4 0 0 0-4 4v1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1V5a4 4 0 0 0-4-4zm0 1.5A2.5 2.5 0 0 1 10.5 5v1h-5V5A2.5 2.5 0 0 1 8 2.5zM8 9a1.5 1.5 0 1 1 0 3A1.5 1.5 0 0 1 8 9z" />
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#f0ede8", letterSpacing: "-0.02em" }}>CodeReview<span style={{ color: "#818cf8" }}>AI</span></span>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f0ede8", letterSpacing: "-0.03em", marginBottom: 6 }}>Reset password</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 28, fontFamily: "'JetBrains Mono', monospace" }}>// choose a strong new password</p>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 7, letterSpacing: "0.04em", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>
              New Password
            </label>
            <input
              type="password"
              placeholder="min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: "100%", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10,
                padding: "11px 14px", fontSize: 13.5, fontFamily: "'Syne', sans-serif",
                color: "#f0ede8", outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={e => { e.target.style.borderColor = "rgba(129,140,248,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(129,140,248,0.08)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <button
            onClick={updatePassword}
            style={{
              width: "100%", padding: "12px 20px",
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
              color: "#fff", border: "none", borderRadius: 10,
              fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif",
              cursor: "pointer", letterSpacing: "-0.01em",
              boxShadow: "0 0 24px rgba(99,102,241,0.35)", transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(99,102,241,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(99,102,241,0.35)"; }}
          >
            Update password
          </button>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;
