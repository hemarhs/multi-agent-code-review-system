import Editor from "@monaco-editor/react";
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import supabase from "../lib/supabase";
import { apiFetch } from "../lib/api";

/* ─── Load Monaco once ──────────────────────────────────────────────── */
let monacoLoaded = false;
function loadMonaco() {
  if (monacoLoaded) return Promise.resolve();
  monacoLoaded = true;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js";
    script.onload = () => {
      window.require.config({
        paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs" },
      });
      window.require(["vs/editor/editor.main"], resolve);
    };
    document.head.appendChild(script);
  });
}

const SEV = {
  critical: { color: "#ff6b81", glow: "rgba(255,107,129,0.3)",  bg: "rgba(255,107,129,0.08)", border: "rgba(255,107,129,0.25)", icon: "⬡", rank: 0 },
  high:     { color: "#ff6b81", glow: "rgba(255,107,129,0.3)",  bg: "rgba(255,107,129,0.08)", border: "rgba(255,107,129,0.25)", icon: "◈", rank: 1 },
  medium:   { color: "#f7c948", glow: "rgba(247,201,72,0.25)",  bg: "rgba(247,201,72,0.07)",  border: "rgba(247,201,72,0.22)",  icon: "◇", rank: 2 },
  low:      { color: "#4ade80", glow: "rgba(74,222,128,0.25)",  bg: "rgba(74,222,128,0.07)",  border: "rgba(74,222,128,0.22)",  icon: "○", rank: 3 },
  info:     { color: "#60c8f5", glow: "rgba(96,200,245,0.25)",  bg: "rgba(96,200,245,0.07)",  border: "rgba(96,200,245,0.22)",  icon: "◎", rank: 4 },
};
const getSev = (s = "") => SEV[s.toLowerCase()] || SEV.info;

const AGENT_COLORS = {
  "security":     { bg: "rgba(255,107,129,0.1)", color: "#ff6b81", border: "rgba(255,107,129,0.2)" },
  "performance":  { bg: "rgba(96,200,245,0.1)",  color: "#60c8f5", border: "rgba(96,200,245,0.2)" },
  "style":        { bg: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "rgba(167,139,250,0.2)" },
  "logic":        { bg: "rgba(247,201,72,0.1)",  color: "#f7c948", border: "rgba(247,201,72,0.2)" },
  "best-practice":{ bg: "rgba(74,222,128,0.1)",  color: "#4ade80", border: "rgba(74,222,128,0.2)" },
};
const getAgentColor = (agent = "") => {
  const key = Object.keys(AGENT_COLORS).find(k => agent.toLowerCase().includes(k));
  return key ? AGENT_COLORS[key] : { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", border: "rgba(255,255,255,0.12)" };
};

function MonacoEditor({ value, onChange }) {
  return (
    <Editor
      height="320px"
      defaultLanguage="javascript"
      theme="vs-dark"
      value={value}
      onChange={(value) => onChange(value || "")}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        wordWrap: "on",
        automaticLayout: true,
        scrollBeyondLastLine: false,
      }}
    />
  );
}

function ConfidenceBar({ confidence }) {
  const pct = Math.round((confidence || 0.85) * 100);
  const color = pct >= 90 ? "#4ade80" : pct >= 70 ? "#f7c948" : "#ffa552";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>CONFIDENCE</span>
      <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", minWidth: 60 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, boxShadow: `0 0 8px ${color}80`, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color, minWidth: 28 }}>{pct}%</span>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const cfg = getSev(severity);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 99,
      fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
      boxShadow: `0 0 10px ${cfg.glow}`,
    }}>
      <span style={{ fontSize: 11 }}>{cfg.icon}</span>
      {severity || "info"}
    </span>
  );
}

function AgentBadge({ agent }) {
  const cfg = getAgentColor(agent);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 9px", borderRadius: 6,
      fontSize: 9.5, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase",
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
    }}>
      ⬡ {agent || "agent"}
    </span>
  );
}

function FindingCard({ finding, index }) {
  const [open, setOpen] = useState(false);
  const cfg = getSev(finding.severity);
  return (
    <div style={{
      background: open ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.018)",
      border: `1px solid ${open ? cfg.border : "rgba(255,255,255,0.07)"}`,
      borderLeft: `3px solid ${cfg.color}`,
      borderRadius: 12, overflow: "hidden",
      transition: "all 0.25s ease",
      boxShadow: open ? `0 4px 32px ${cfg.glow}` : "none",
    }}>
      <button onClick={() => setOpen(v => !v)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 14,
        padding: "15px 20px", background: "transparent", border: "none",
        cursor: "pointer", textAlign: "left",
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: cfg.color,
          fontFamily: "'JetBrains Mono', monospace",
          boxShadow: `0 0 12px ${cfg.glow}`,
        }}>{String(index + 1).padStart(2, "0")}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: "block", fontSize: 13.5, fontWeight: 600,
            color: "#e2e8f0", fontFamily: "'JetBrains Mono', monospace",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4,
          }}>{finding.title}</span>
          <AgentBadge agent={finding.agent} />
        </span>
        <SeverityBadge severity={finding.severity} />
        <span style={{
          fontSize: 11, color: "rgba(255,255,255,0.2)",
          transition: "transform 0.25s", transform: open ? "rotate(180deg)" : "rotate(0deg)",
          marginLeft: 4, flexShrink: 0,
        }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ marginTop: 16, marginBottom: 14 }}>
            <ConfidenceBar confidence={finding.confidence} />
          </div>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.62)", lineHeight: 1.75, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>
            {finding.explanation}
          </p>
          <div style={{ background: "rgba(0,0,0,0.35)", border: `1px solid ${cfg.border}`, borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }} />
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: cfg.color, fontFamily: "'JetBrains Mono', monospace" }}>Suggested Fix</span>
            </div>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.72)", margin: 0, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
              {finding.suggested_fix}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({ label, count, cfg }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7,
      padding: "5px 13px",
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 99, fontSize: 11.5, color: cfg.color,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, boxShadow: `0 0 8px ${cfg.glow}`, flexShrink: 0 }} />
      <strong style={{ fontWeight: 700 }}>{count}</strong>
      <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10.5 }}>{label}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "64px 24px",
      background: "rgba(74,222,128,0.03)", border: "1px solid rgba(74,222,128,0.12)",
      borderRadius: 16, marginTop: 32, textAlign: "center",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, marginBottom: 20, boxShadow: "0 0 32px rgba(74,222,128,0.15)",
      }}>✓</div>
      <p style={{ fontSize: 17, fontWeight: 700, color: "#4ade80", fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>All Clear</p>
      <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6 }}>
        No issues detected in your code.<br />Clean, well-structured, production-ready.
      </p>
    </div>
  );
}

function AnalysingOverlay() {
  const steps = ["Parsing AST…", "Running security scan…", "Checking performance…", "Reviewing style…", "Compiling findings…"];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      margin: "24px 0", background: "rgba(129,140,248,0.04)",
      border: "1px solid rgba(129,140,248,0.15)", borderRadius: 12,
      padding: "20px 24px", display: "flex", alignItems: "center", gap: 18,
    }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width="36" height="36" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(129,140,248,0.15)" strokeWidth="2.5" />
          <circle cx="18" cy="18" r="14" fill="none" stroke="#818cf8" strokeWidth="2.5"
            strokeDasharray="20 68" strokeLinecap="round"
            style={{ animation: "rv-spin 1.2s linear infinite", transformOrigin: "18px 18px" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#818cf8" }}>⬡</div>
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", fontFamily: "'Syne', sans-serif", marginBottom: 4 }}>AI Review in Progress</p>
        <p style={{ fontSize: 11.5, color: "#818cf8", fontFamily: "'JetBrains Mono', monospace" }}>{steps[step]}</p>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: "35%", background: "linear-gradient(90deg, transparent, #818cf8, #60c8f5, transparent)", animation: "rv-sweep 1.5s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  );
}

function Review() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => { loadUser(); }, []);
  useEffect(() => {
    if (draftLoaded && userId) sessionStorage.setItem(`review-draft-${userId}`, code);
  }, [code, userId, draftLoaded]);
  useEffect(() => {
    if (draftLoaded && userId && result) sessionStorage.setItem(`review-result-${userId}`, JSON.stringify(result));
  }, [result, userId, draftLoaded]);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setName(user?.user_metadata?.full_name || "User");
    if (!user) return;

    setUserId(user.id);
    setCode(sessionStorage.getItem(`review-draft-${user.id}`) || "");
    try {
      setResult(JSON.parse(sessionStorage.getItem(`review-result-${user.id}`)) || null);
    } catch {
      setResult(null);
    }
    setDraftLoaded(true);
  }

  async function reviewCode() {
  try {
    setLoading(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Your session has expired. Please sign in again.");

    const data = await apiFetch("/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          user_id: user.id,
        }),
      });

    console.log("Review Response:", data);

    setResult(data);

  } catch (error) {
    console.error(error);

    alert(error.message || "Review failed. Please try again.");

  } finally {
    setLoading(false);
  }
}

  const findings = result?.findings ?? [];
  const sorted = [...findings].sort((a, b) => getSev(a.severity).rank - getSev(b.severity).rank);
  const counts = findings.reduce((acc, f) => {
    const k = f.severity?.toLowerCase() || "info";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Syne:wght@400;500;600;700;800&display=swap');
        @keyframes rv-spin { to { transform: rotate(360deg); } }
        @keyframes rv-sweep { 0% { transform: translateX(-200%); } 100% { transform: translateX(500%); } }
        @keyframes rv-fadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
        .rv-results { animation: rv-fadeIn 0.35s ease forwards; }
        .rv-finding:hover { border-color: rgba(255,255,255,0.12) !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#080b10", position: "relative", overflow: "hidden" }}>
        {/* Ambient orbs */}
        <div style={{ position: "fixed", top: -180, right: -80, width: 560, height: 560, borderRadius: "50%", pointerEvents: "none", zIndex: 0, background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)" }} />
        <div style={{ position: "fixed", bottom: -220, left: -100, width: 640, height: 640, borderRadius: "50%", pointerEvents: "none", zIndex: 0, background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 65%)" }} />
        {/* Grid */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <Navbar />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "44px 24px 100px" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "4px 12px", background: "rgba(129,140,248,0.08)",
              border: "1px solid rgba(129,140,248,0.2)", borderRadius: 99,
              fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace",
              color: "#818cf8", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 14,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#818cf8", boxShadow: "0 0 8px #818cf8", display: "inline-block" }} />
              AI Workspace · {name}
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: "#f0ede8", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>
              Code{" "}
              <span style={{ background: "linear-gradient(110deg, #818cf8 0%, #60c8f5 60%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Review
              </span>
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
              // paste → analyse → ship with confidence
            </p>
          </div>

          {/* Editor shell */}
          <div style={{
            background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s",
          }}>
            {/* Mac-style titlebar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(0,0,0,0.3)",
            }}>
              <div style={{ display: "flex", gap: 7 }}>
                {["#ff5f57","#febc2e","#28c840"].map((c, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.18)" }}>
                <span style={{ padding: "2px 9px", borderRadius: 5, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", background: "rgba(129,140,248,0.1)", color: "rgba(129,140,248,0.7)", border: "1px solid rgba(129,140,248,0.2)" }}>Monaco</span>
                <span>review.js</span>
              </div>
            </div>

            <MonacoEditor value={code} onChange={setCode} />

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.2)",
            }}>
              <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>
                {code.length > 0 ? `${code.split("\n").length} lines · ${code.length} chars` : "ready"}
              </span>
              {loading && (
                <span style={{ fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", color: "#818cf8", display: "flex", alignItems: "center", gap: 6 }}>
                  <svg style={{ animation: "rv-spin 0.8s linear infinite" }} width="10" height="10" viewBox="0 0 10 10">
                    <circle cx="5" cy="5" r="4" fill="none" stroke="rgba(129,140,248,0.3)" strokeWidth="1.5" />
                    <circle cx="5" cy="5" r="4" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="6 18" strokeLinecap="round" />
                  </svg>
                  analysing
                </span>
              )}
            </div>
          </div>

          {loading && <AnalysingOverlay />}

          {/* Button row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.18)" }}>
              {result ? `↳ ${findings.length} finding${findings.length !== 1 ? "s" : ""} returned` : "↳ ready to analyse"}
            </span>
            <button
              onClick={reviewCode}
              disabled={loading || !code.trim()}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "12px 28px",
                background: "linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #60c8f5 100%)",
                color: "#fff", border: "none", borderRadius: 99,
                fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700,
                cursor: loading || !code.trim() ? "not-allowed" : "pointer",
                opacity: loading || !code.trim() ? 0.4 : 1,
                transition: "all 0.3s ease",
                boxShadow: "0 0 28px rgba(99,102,241,0.35), 0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              {loading ? (
                <>
                  <svg style={{ animation: "rv-spin 0.8s linear infinite" }} width="14" height="14" viewBox="0 0 14 14">
                    <circle cx="7" cy="7" r="5.5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                    <circle cx="7" cy="7" r="5.5" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="8 26" strokeLinecap="round" />
                  </svg>
                  Analysing…
                </>
              ) : (
                <>
                  <span style={{ width: 26, height: 26, borderRadius: 99, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 1.5l7 3.5-7 3.5V1.5z" fill="white" />
                    </svg>
                  </span>
                  Run Review
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="rv-results">
              {findings.length > 0 ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "36px 0 14px", flexWrap: "wrap", gap: 10 }}>
                    <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {findings.length} finding{findings.length !== 1 ? "s" : ""} · sorted by severity
                    </span>
                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                      {Object.entries(counts).sort((a, b) => getSev(a[0]).rank - getSev(b[0]).rank).map(([k, n]) => (
                        <StatPill key={k} label={k} count={n} cfg={getSev(k)} />
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {sorted.map((f, i) => <FindingCard key={i} finding={f} index={i} />)}
                  </div>
                </>
              ) : (
                <EmptyState />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Review;
