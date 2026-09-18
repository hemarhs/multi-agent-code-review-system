import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import supabase from "../lib/supabase";
import { apiFetch } from "../lib/api";

function History() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { loadReviews(); loadUser(); }, []);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setName(user?.user_metadata?.full_name || "User");
  }

  async function loadReviews() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    try {
      const savedReviews = await apiFetch(`/reviews/user/${user.id}`);
      const reviewsWithFindings = await Promise.all(savedReviews.map(async (review) => ({
        ...review,
        findings: await apiFetch(`/reviews/${review.id}`),
      })));
      setReviews(reviewsWithFindings);
    } catch (error) {
      console.error("Unable to load review history:", error);
    }
  }

  function toggle(id) {
    setExpanded(v => v === id ? null : id);
  }

  function formatDate(str) {
    const d = new Date(str);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080b10; }
        @keyframes hist-fadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
        .hist-item { animation: hist-fadeIn 0.35s ease forwards; }
        .hist-code::-webkit-scrollbar { width: 4px; height: 4px; }
        .hist-code::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
      <div style={{ minHeight: "100vh", background: "#080b10", position: "relative", overflow: "hidden", fontFamily: "'Syne', sans-serif" }}>
        {/* Orbs */}
        <div style={{ position: "fixed", top: -200, right: -100, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <Navbar />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "44px 24px 100px" }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "4px 12px", background: "rgba(96,200,245,0.08)",
              border: "1px solid rgba(96,200,245,0.2)", borderRadius: 99,
              fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace",
              color: "#60c8f5", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 14,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60c8f5", boxShadow: "0 0 8px #60c8f5", display: "inline-block" }} />
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </div>
            <h1 style={{ fontSize: 34, fontWeight: 800, color: "#f0ede8", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 8 }}>
              Review{" "}
              <span style={{ background: "linear-gradient(110deg, #60c8f5 0%, #818cf8 60%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                History
              </span>
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
              // all past reviews for {name}
            </p>
          </div>

          {/* Content */}
          {reviews.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", padding: "80px 24px",
              background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, textAlign: "center",
            }}>
              <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.2 }}>◎</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>No reviews yet</p>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6 }}>
                Head to the Review workspace and run your first analysis.
              </p>
              <a href="/review" style={{
                marginTop: 24, display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 22px", background: "rgba(129,140,248,0.1)",
                border: "1px solid rgba(129,140,248,0.25)", color: "#818cf8",
                borderRadius: 99, fontSize: 13, fontWeight: 600,
                fontFamily: "'Syne', sans-serif", textDecoration: "none",
                transition: "all 0.2s ease",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(129,140,248,0.18)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(129,140,248,0.1)"}
              >
                Go to Review →
              </a>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {reviews.map((review, idx) => {
                const isOpen = expanded === review.id;
                const lineCount = review.code ? review.code.split("\n").length : 0;
                return (
                  <div
                    key={review.id}
                    className="hist-item"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div
                      style={{
                        background: isOpen ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isOpen ? "rgba(129,140,248,0.25)" : "rgba(255,255,255,0.07)"}`,
                        borderRadius: 14, overflow: "hidden",
                        transition: "all 0.2s ease",
                        boxShadow: isOpen ? "0 4px 24px rgba(129,140,248,0.1)" : "none",
                      }}
                    >
                      {/* Card header */}
                      <button
                        onClick={() => toggle(review.id)}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 14,
                          padding: "16px 20px", background: "transparent", border: "none",
                          cursor: "pointer", textAlign: "left",
                        }}
                      >
                        {/* Index badge */}
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.2)",
                          display: "grid", placeItems: "center",
                          fontSize: 11, fontWeight: 700, color: "#818cf8",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                          #{String(idx + 1).padStart(2, "0")}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#e2e8f0", fontFamily: "'JetBrains Mono', monospace" }}>
                              Review #{idx + 1}
                            </span>
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: "2px 8px",
                              background: "rgba(96,200,245,0.08)", border: "1px solid rgba(96,200,245,0.2)",
                              color: "#60c8f5", borderRadius: 99, fontFamily: "'JetBrains Mono', monospace",
                            }}>
                              {lineCount} lines
                            </span>
                          </div>
                          <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
                            {formatDate(review.created_at)}
                          </span>
                        </div>

                        <span style={{
                          fontSize: 11, color: "rgba(255,255,255,0.2)",
                          transition: "transform 0.25s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          flexShrink: 0,
                        }}>▾</span>
                      </button>

                      {/* Expanded code block */}
                      {isOpen && (
                        <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                            <span style={{
                              fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em",
                              textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
                              fontFamily: "'JetBrains Mono', monospace",
                            }}>Submitted Code</span>
                          </div>
                          <pre
                            className="hist-code"
                            style={{
                              background: "#0d1117",
                              border: "1px solid rgba(255,255,255,0.07)",
                              borderRadius: 10,
                              padding: "16px 18px",
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 12.5,
                              color: "#c9d1d9",
                              lineHeight: 1.7,
                              whiteSpace: "pre-wrap",
                              overflowX: "auto",
                              maxHeight: 280,
                              overflowY: "auto",
                              margin: 0,
                            }}
                          >
                            {review.code}
                          </pre>
                          <div style={{ marginTop: 22 }}>
                            <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>
                              Review Results · {review.findings?.length || 0} finding{review.findings?.length === 1 ? "" : "s"}
                            </p>
                            {review.findings?.length ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {review.findings.map((finding) => (
                                  <div key={finding.id} style={{ background: "rgba(129,140,248,0.05)", border: "1px solid rgba(129,140,248,0.18)", borderLeft: "3px solid #818cf8", borderRadius: 10, padding: "14px 16px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 7 }}>
                                      <strong style={{ color: "#e2e8f0", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>{finding.title}</strong>
                                      <span style={{ color: "#818cf8", fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{finding.severity} · {finding.agent}</span>
                                    </div>
                                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12.5, lineHeight: 1.6, margin: "0 0 9px" }}>{finding.explanation}</p>
                                    <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, lineHeight: 1.6, margin: 0, fontFamily: "'JetBrains Mono', monospace" }}><span style={{ color: "#60c8f5" }}>Fix: </span>{finding.suggested_fix}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>No issues were found in this review.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default History;
