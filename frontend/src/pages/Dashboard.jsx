import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import supabase from "../lib/supabase";

const CARDS = [
  {
    key: "total_reviews",
    label: "Total Reviews",
    icon: "▦",
    color: "#818cf8",
    glow: "rgba(129,140,248,0.25)",
    bg: "rgba(129,140,248,0.07)",
    border: "rgba(129,140,248,0.2)",
    sub: "all time",
  },
  {
    key: "total_findings",
    label: "Total Findings",
    icon: "◈",
    color: "#60c8f5",
    glow: "rgba(96,200,245,0.25)",
    bg: "rgba(96,200,245,0.07)",
    border: "rgba(96,200,245,0.2)",
    sub: "across reviews",
  },
  {
    key: "high",
    label: "High Severity",
    icon: "⬡",
    color: "#ff6b81",
    glow: "rgba(255,107,129,0.3)",
    bg: "rgba(255,107,129,0.07)",
    border: "rgba(255,107,129,0.2)",
    sub: "needs attention",
  },
  {
    key: "medium",
    label: "Medium",
    icon: "◇",
    color: "#f7c948",
    glow: "rgba(247,201,72,0.25)",
    bg: "rgba(247,201,72,0.07)",
    border: "rgba(247,201,72,0.2)",
    sub: "review soon",
  },
  {
    key: "low",
    label: "Low Severity",
    icon: "○",
    color: "#4ade80",
    glow: "rgba(74,222,128,0.25)",
    bg: "rgba(74,222,128,0.07)",
    border: "rgba(74,222,128,0.2)",
    sub: "minor issues",
  },
];

function StatCard({ cfg, value, loading }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid rgba(255,255,255,0.07)`,
        borderTop: `1px solid ${cfg.border}`,
        borderRadius: 14,
        padding: "22px 20px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.2s, transform 0.15s, box-shadow 0.2s",
        cursor: "default",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = cfg.border;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 32px ${cfg.glow}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${cfg.color}80, transparent)` }} />

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          display: "grid", placeItems: "center",
          fontSize: 14, color: cfg.color,
          boxShadow: `0 0 12px ${cfg.glow}`,
          flexShrink: 0,
        }}>
          {cfg.icon}
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase", letterSpacing: "0.08em",
          fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.2,
        }}>
          {cfg.label}
        </span>
      </div>

      <div style={{
        fontSize: 38, fontWeight: 800, color: "#f0ede8",
        letterSpacing: "-0.05em", lineHeight: 1, fontFamily: "'Syne', sans-serif",
      }}>
        {loading ? (
          <div style={{
            width: 52, height: 32,
            background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
            backgroundSize: "200% 100%",
            animation: "db-shimmer 1.4s infinite",
            borderRadius: 6,
          }} />
        ) : value ?? "—"}
      </div>

      <span style={{ fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", color: cfg.color, opacity: 0.6 }}>
        {cfg.sub}
      </span>
    </div>
  );
}

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => { loadAnalytics(); loadUser(); }, []);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setName(user?.user_metadata?.full_name || "User");
  }

  async function loadAnalytics() {

   const {
     data: { user },
   } = await supabase.auth.getUser();

   const response = await fetch(
     `http://127.0.0.1:8000/analytics/${user.id}`
   );

   const data = await response.json();

    setAnalytics(data);
 }

  const loading = !analytics;
  const firstName = name.split(" ")[0] || "there";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080b10; }
        @keyframes db-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes db-fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .db-card-anim { animation: db-fadeIn 0.4s ease forwards; }
      `}</style>
      <div style={{ minHeight: "100vh", background: "#080b10", position: "relative", overflow: "hidden", fontFamily: "'Syne', sans-serif" }}>
        {/* Orbs */}
        <div style={{ position: "fixed", top: -200, right: -100, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", bottom: -200, left: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <Navbar />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "44px 24px 100px" }}>

          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "4px 12px", background: "rgba(129,140,248,0.08)",
              border: "1px solid rgba(129,140,248,0.2)", borderRadius: 99,
              fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace",
              color: "#818cf8", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 14,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80", display: "inline-block" }} />
              dashboard
            </div>
            <h1 style={{ fontSize: 34, fontWeight: 800, color: "#f0ede8", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 8 }}>
              Hey,{" "}
              <span style={{ background: "linear-gradient(110deg, #818cf8 0%, #60c8f5 60%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {firstName}
              </span>{" "}
              👋
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
              // here's a snapshot of your review activity
            </p>
          </div>

          {/* Stats grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 12,
            marginBottom: 40,
          }}
          className="db-card-anim"
          >
            {CARDS.map((cfg, i) => (
              <StatCard
                key={cfg.key}
                cfg={cfg}
                value={analytics?.[cfg.key]}
                loading={loading}
              />
            ))}
          </div>

          {/* Secondary section: activity hint */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, padding: "28px 28px",
            display: "flex", alignItems: "center", gap: 20,
            animation: "db-fadeIn 0.5s ease 0.1s both",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.2)",
              display: "grid", placeItems: "center", fontSize: 22,
              boxShadow: "0 0 24px rgba(129,140,248,0.15)",
            }}>⬡</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#f0ede8", marginBottom: 5, letterSpacing: "-0.02em" }}>
                Ready to run a new review?
              </p>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5 }}>
                Paste your code into the Review workspace and let the AI agents find issues before they reach production.
              </p>
            </div>
            <a
              href="/review"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 22px",
                background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
                color: "#fff", border: "none", borderRadius: 99,
                fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif",
                textDecoration: "none", flexShrink: 0,
                boxShadow: "0 0 20px rgba(99,102,241,0.3)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 0 36px rgba(99,102,241,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(99,102,241,0.3)"; }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 1.5l7 3.5-7 3.5V1.5z" fill="white" /></svg>
              New Review
            </a>
          </div>

        </div>
      </div>
    </>
  );
}

export default Dashboard;
