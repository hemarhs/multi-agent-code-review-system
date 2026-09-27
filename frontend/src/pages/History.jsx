import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../lib/supabase";
import AppShell from "../components/AppShell";
import { apiFetch } from "../lib/api";
import { Icon, SevTag, AgentTag, getSev, tint, SEVERITY } from "../components/ui";

function formatTime(str) {
  return new Date(str).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function CodeBlock({ code = "" }) {
  const lines = code.split("\n");
  return (
    <div className="code">
      <div className="code__nums">{lines.map((_, i) => <div key={i}>{i + 1}</div>)}</div>
      <pre className="code__src">{code}</pre>
    </div>
  );
}

function History() {
  const [reviews, setReviews] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => { loadReviews(); loadUser(); }, []);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setName(user?.user_metadata?.full_name || "User");
  }

  async function loadReviews() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoaded(true); return; }
    try {
      const savedReviews = await apiFetch(`/reviews/user/${user.id}`);
      const reviewsWithFindings = await Promise.all(savedReviews.map(async (review) => ({
        ...review,
        findings: await apiFetch(`/reviews/${review.id}`),
      })));
      setReviews(reviewsWithFindings);
    } catch (error) {
      console.error("Unable to load review history:", error);
    } finally {
      setLoaded(true);
    }
  }

  function toggle(id) {
    setExpanded((v) => (v === id ? null : id));
  }

  const q = query.trim().toLowerCase();
  const filtered = q
    ? reviews.filter((r) =>
        r.code?.toLowerCase().includes(q) ||
        r.findings?.some((f) => `${f.title} ${f.agent} ${f.severity}`.toLowerCase().includes(q)))
    : reviews;

  return (
    <AppShell>
      <header className="phead">
        <div className="phead__text rise">
          <span className="eyebrow"><span className="eyebrow__dot" />{reviews.length} review{reviews.length !== 1 ? "s" : ""} archived</span>
          <h1 className="page-title">
            Review <span className="serif-i grad-text">history</span>
          </h1>
          <p className="page-sub">Every submission {name ? `from ${name.split(" ")[0]} ` : ""}with its full agent report — searchable and always at hand.</p>
        </div>
        {reviews.length > 0 && (
          <div className="hist-tools rise d1">
            <label className="search">
              <Icon.search size={15} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search code or findings…" aria-label="Search history" />
            </label>
          </div>
        )}
      </header>

      {!loaded ? (
        <div className="timeline">
          {[0, 1, 2].map((i) => (
            <div key={i} className="hitem glass" style={{ padding: 22, display: "flex", gap: 18, alignItems: "center" }}>
              <span className="skeleton" style={{ width: 58, height: 58, borderRadius: 12 }} />
              <div style={{ flex: 1 }}>
                <span className="skeleton" style={{ width: "40%", height: 14, display: "block", marginBottom: 10 }} />
                <span className="skeleton" style={{ width: "70%", height: 11, display: "block" }} />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="empty glass glass--sheen rise d1">
          <div className="empty__art"><Icon.clock size={30} /></div>
          <h3>No reviews <span className="serif-i">yet</span></h3>
          <p>Run your first analysis in the workspace and it will be archived here with every finding.</p>
          <Link to="/review" className="btn btn--primary btn--lg">
            <Icon.play size={12} /> Start a review
          </Link>
        </div>
      ) : (
        <div className="timeline">
          {filtered.length === 0 && (
            <p style={{ color: "var(--text-3)", textAlign: "center", padding: 40 }}>No reviews match “{query}”.</p>
          )}
          {filtered.map((review, idx) => {
            const isOpen = expanded === review.id;
            const lineCount = review.code ? review.code.split("\n").length : 0;
            const d = new Date(review.created_at);
            const preview = (review.code || "").split("\n").find((l) => l.trim()) || "";
            const counts = (review.findings || []).reduce((acc, f) => {
              const k = f.severity?.toLowerCase() || "info";
              acc[k] = (acc[k] || 0) + 1;
              return acc;
            }, {});
            const number = reviews.length - reviews.indexOf(review);

            return (
              <article key={review.id} className={`hitem glass${isOpen ? " is-open" : ""}`} style={{ animationDelay: `${Math.min(idx, 10) * 0.04}s` }}>
                <button className="hitem__head" onClick={() => toggle(review.id)} aria-expanded={isOpen}>
                  <div className="hitem__date">
                    <div className="hitem__day">{d.getDate()}</div>
                    <div className="hitem__mon">{d.toLocaleDateString("en-US", { month: "short" })}</div>
                  </div>

                  <div className="hitem__main">
                    <div className="hitem__title">
                      <strong>Review #{number}</strong>
                      <span className="label" style={{ letterSpacing: "0.06em" }}>{formatTime(review.created_at)} · {lineCount} lines · {review.findings?.length || 0} findings</span>
                    </div>
                    <div className="hitem__preview">{preview.trim()}</div>
                  </div>

                  <div className="hitem__sev">
                    {Object.keys(SEVERITY).filter((k) => counts[k]).map((k) => (
                      <span key={k} className="tag" style={{ color: SEVERITY[k].color, borderColor: tint(SEVERITY[k].color, 0.3), background: tint(SEVERITY[k].color, 0.08) }}>
                        <i />{counts[k]}
                      </span>
                    ))}
                    {!review.findings?.length && (
                      <span className="tag" style={{ color: "var(--low)", borderColor: tint("#10b981", 0.3), background: tint("#10b981", 0.08) }}>
                        <Icon.check size={11} />clean
                      </span>
                    )}
                  </div>

                  <span className="finding__chev" style={{ transform: isOpen ? "rotate(180deg)" : "none" }}><Icon.chevron size={18} /></span>
                </button>

                {isOpen && (
                  <div className="hitem__body">
                    <div className="hitem__section">
                      <span className="label">Submitted code</span>
                      <CodeBlock code={review.code} />
                    </div>

                    <div className="hitem__section">
                      <span className="label">Agent report · {review.findings?.length || 0} finding{review.findings?.length === 1 ? "" : "s"}</span>
                      {review.findings?.length ? (
                        [...review.findings]
                          .sort((a, b) => getSev(a.severity).rank - getSev(b.severity).rank)
                          .map((finding, i) => {
                            const sev = getSev(finding.severity);
                            return (
                              <div key={finding.id ?? i} className="mini-finding">
                                <span className="mini-finding__bar" style={{ background: sev.color}} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div className="mini-finding__top">
                                    <strong>{finding.title}</strong>
                                    <SevTag severity={finding.severity} />
                                    <AgentTag agent={finding.agent} />
                                  </div>
                                  <p>{finding.explanation}</p>
                                  {finding.suggested_fix && (
                                    <div className="mini-finding__fix"><span>Fix → </span>{finding.suggested_fix}</div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="notice notice--success" style={{ marginBottom: 0 }}>
                          <Icon.check size={16} /> No issues were found in this review.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

export default History;
