import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from "../lib/supabase";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserName(user.user_metadata?.full_name || user.email || "User");
    });
  }, []);

  async function logout() {
    // Remove legacy shared keys created before drafts were scoped per user.
    sessionStorage.removeItem("review-draft");
    sessionStorage.removeItem("review-result");
    await supabase.auth.signOut();
    navigate("/");
  }

  const initials = userName
    ? userName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const navLinks = [
    {
      to: "/dashboard", label: "Dashboard",
      icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h5v7H2V2zm0 9h5v3H2v-3zm7-5h5v7H9V6zm0-4h5v3H9V2z" /></svg>,
    },
    {
      to: "/review", label: "Review",
      icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v1.5H2V3zm1 3h10v1.5H3V6zm1 3h8v1.5H4V9z" /></svg>,
    },
    {
      to: "/history", label: "History",
      icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.75 3.5v4l2.5 1.5-.75 1.25L7.5 9.5V4.5h1.25z" /></svg>,
    },
  ];

  return (
    <nav style={{
      display: "flex", alignItems: "center",
      padding: "0 28px", height: 52,
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(8,11,16,0.85)",
      backdropFilter: "blur(16px)",
      position: "sticky", top: 0, zIndex: 100,
      fontFamily: "'Syne', sans-serif",
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginRight: 28 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: "linear-gradient(135deg, #6366f1, #60c8f5)",
          display: "grid", placeItems: "center", flexShrink: 0,
          boxShadow: "0 0 14px rgba(99,102,241,0.35)",
        }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="white">
            <path d="M3 2h4a1 1 0 0 1 1 1v1H3V2zm0 4h6v2H3V6zm0 4h4v2H3v-2zm7-6 3 3-3 3V4z" />
          </svg>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#f0ede8", letterSpacing: "-0.02em" }}>
          CodeReview<span style={{ color: "#818cf8" }}>AI</span>
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)", marginRight: 24 }} />

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
        {navLinks.map(({ to, label, icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "6px 12px", borderRadius: 8,
                fontSize: 13, fontWeight: 500,
                color: active ? "#f0ede8" : "rgba(255,255,255,0.38)",
                textDecoration: "none",
                background: active ? "rgba(255,255,255,0.07)" : "transparent",
                transition: "color 0.15s, background 0.15s",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "rgba(255,255,255,0.38)"; e.currentTarget.style.background = "transparent"; }}}
            >
              <span style={{ opacity: active ? 1 : 0.6 }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "5px 10px", borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "grid", placeItems: "center",
            fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {initials}
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: "'JetBrains Mono', monospace" }}>
            {userName.split(" ")[0] || "User"}
          </span>
        </div>

        <button
          onClick={logout}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "none", color: "rgba(255,255,255,0.35)",
            fontSize: 12, fontFamily: "'Syne', sans-serif",
            cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#ff6b81"; e.currentTarget.style.borderColor = "rgba(255,107,129,0.3)"; e.currentTarget.style.background = "rgba(255,107,129,0.07)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "none"; }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3v-1.5H3.5v-9H6V2zm4.5 2.5L14 8l-3.5 3.5-1.06-1.06L11.19 9H6V7h5.19L9.44 5.56 10.5 4.5z" />
          </svg>
          Sign out
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
