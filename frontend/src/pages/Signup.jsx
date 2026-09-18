import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import supabase from "../lib/supabase";

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

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function signUp() {
    if (!name.trim() || !email.trim() || !password) {
      alert("Enter your name, email, and password.");
      return;
    }
    if (password.length < 8) {
      alert("Your password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: { data: { full_name: name.trim() } },
      });
      if (error) throw error;

      alert(data.session ? "Account created successfully!" : "Account created. Check your email to confirm it, then sign in.");
      navigate("/");
    } catch (error) {
      console.error("Signup failed:", error);
      alert(error.message || "Unable to sign up. Check your Supabase connection and try again.");
    } finally {
      setSubmitting(false);
    }
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
        <div style={{ position: "fixed", bottom: -200, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(96,200,245,0.06) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <div style={{ width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "40px 36px", position: "relative", zIndex: 1, backdropFilter: "blur(16px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #60c8f5)", display: "grid", placeItems: "center", flexShrink: 0, boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                <path d="M3 2h4a1 1 0 0 1 1 1v1H3V2zm0 4h6v2H3V6zm0 4h4v2H3v-2zm7-6 3 3-3 3V4z" />
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#f0ede8", letterSpacing: "-0.02em" }}>CodeReview<span style={{ color: "#818cf8" }}>AI</span></span>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f0ede8", letterSpacing: "-0.03em", marginBottom: 6 }}>Create account</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 28, fontFamily: "'JetBrains Mono', monospace" }}>// join thousands of devs shipping safer code</p>

          <AuthInput label="Full Name" placeholder="Ada Lovelace" value={name} onChange={e => setName(e.target.value)} />
          <AuthInput label="Email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          <AuthInput
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="min. 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            right={
              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(value => !value)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            }
          />

          <div style={{ marginTop: 4, marginBottom: 20 }}>
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5 }}>
              By creating an account you agree to our{" "}
              <span style={{ color: "#818cf8", cursor: "pointer" }}>Terms</span> and{" "}
              <span style={{ color: "#818cf8", cursor: "pointer" }}>Privacy Policy</span>.
            </p>
          </div>

          <button
            onClick={signUp}
            disabled={submitting}
            style={{
              width: "100%", padding: "12px 20px",
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
              color: "#fff", border: "none", borderRadius: 10,
              fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif",
              cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, letterSpacing: "-0.01em",
              boxShadow: "0 0 24px rgba(99,102,241,0.35)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(99,102,241,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(99,102,241,0.35)"; }}
          >
            {submitting ? "Creating account…" : "Create free account"}
          </button>

          <div style={{ margin: "24px 0", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          </div>

          <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            Already have an account?{" "}
            <Link to="/" style={{ color: "#818cf8", textDecoration: "none", fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
              onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Signup;
