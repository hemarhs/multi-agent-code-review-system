import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import supabase from "../lib/supabase";

const S = {
  root: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#080b10",
    padding: 24,
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Syne', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: "40px 36px",
    position: "relative",
    zIndex: 1,
    backdropFilter: "blur(16px)",
  },
};

function AuthInput({ label, type = "text", placeholder, value, onChange, right }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 7, letterSpacing: "0.04em", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>
        {label}
      </label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          type={type}
          autoComplete={
          type === "password"
          ? "new-password"
          : "off"
          }
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 10,
            padding: right ? "11px 44px 11px 14px" : "11px 14px",
            fontSize: 13.5,
            fontFamily: "'Syne', sans-serif",
            color: "#f0ede8",
            outline: "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onFocus={e => { e.target.style.borderColor = "rgba(129,140,248,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(129,140,248,0.08)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; e.target.style.boxShadow = "none"; }}
        />
        {right && <div style={{ position: "absolute", right: 12 }}>{right}</div>}
      </div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  setEmail("");
  setPassword("");
  checkUser();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) navigate("/review");
  }

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { alert(error.message); return; }
    navigate("/review");
  }

  async function forgotPassword() {
    if (!email) { alert("Enter your email first"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: "http://localhost:5173/reset-password" });
    if (error) { alert(error.message); return; }
    alert("Password reset email sent!");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080b10; }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
        @keyframes auth-spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={S.root}>
        {/* Orbs */}
        <div style={{ position: "fixed", top: -200, left: "50%", transform: "translateX(-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", bottom: -200, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(96,200,245,0.06) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
        {/* Grid */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <div style={S.card}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #60c8f5)", display: "grid", placeItems: "center", flexShrink: 0, boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                <path d="M3 2h4a1 1 0 0 1 1 1v1H3V2zm0 4h6v2H3V6zm0 4h4v2H3v-2zm7-6 3 3-3 3V4z" />
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#f0ede8", letterSpacing: "-0.02em" }}>CodeReview<span style={{ color: "#818cf8" }}>AI</span></span>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f0ede8", letterSpacing: "-0.03em", marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 28, fontFamily: "'JetBrains Mono', monospace" }}>// sign in to your workspace</p>

          <AuthInput label="Email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          <AuthInput
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            right={
              <button onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", padding: 0, transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            }
          />

          <div style={{ textAlign: "right", marginBottom: 20, marginTop: -6 }}>
            <button onClick={forgotPassword} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#818cf8", fontFamily: "'JetBrains Mono', monospace", opacity: 0.8, transition: "opacity 0.15s", padding: 0 }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.8}>
              Forgot password?
            </button>
          </div>

          <button
            onClick={login}
            style={{
              width: "100%", padding: "12px 20px",
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
              color: "#fff", border: "none", borderRadius: 10,
              fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif",
              cursor: "pointer", letterSpacing: "-0.01em",
              boxShadow: "0 0 24px rgba(99,102,241,0.35)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(99,102,241,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(99,102,241,0.35)"; }}
          >
            Sign in
          </button>

          <div style={{ margin: "24px 0", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          </div>

          <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            No account?{" "}
            <Link to="/signup" style={{ color: "#818cf8", textDecoration: "none", fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
              onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
