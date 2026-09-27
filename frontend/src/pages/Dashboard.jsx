import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../lib/supabase";
import AppShell from "../components/AppShell";
import { apiFetch } from "../lib/api";
import { Icon, AGENTS, AgentIcon, SEVERITY } from "../components/ui";

function useCountUp(target, run) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run || typeof target !== "number") return;
    let raf;
    const start = performance.now();
    const dur = 1100;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return n;
}

function Num({ value, loading, w = 64, h = 48 }) {
  const n = useCountUp(value ?? 0, !loading);
  if (loading) return <span className="skeleton" style={{ width: w, height: h }} />;
  return typeof value === "number" ? n : "—";
}

function Spark({ color }) {
  return (
    <svg className="stat__spark" width="220" height="90" viewBox="0 0 220 90" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`sp-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 70 C30 64 40 40 70 46 S110 72 140 44 S190 18 220 12 V90 H0Z" fill={`url(#sp-${color.slice(1)})`} />
      <path d="M0 70 C30 64 40 40 70 46 S110 72 140 44 S190 18 220 12" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

const SEV_CARDS = [
  { key: "high",   sev: SEVERITY.high,   hint: "fix first" },
  { key: "medium", sev: SEVERITY.medium, hint: "plan soon" },
  { key: "low",    sev: SEVERITY.low,    hint: "polish" },
];

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => { loadAnalytics(); loadUser(); }, []);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setName(user?.user_metadata?.full_name || "User");
  }

  async function loadAnalytics() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    try {
      setAnalytics(await apiFetch(`/analytics/${user.id}`));
    } catch (error) {
      console.error("Unable to load analytics:", error);
      setAnalytics({});
    }
  }

  const loading = !analytics;
  const firstName = name.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const high = analytics?.high ?? 0;
  const medium = analytics?.medium ?? 0;
  const low = analytics?.low ?? 0;
  const sevTotal = high + medium + low;
  const pct = (v) => (sevTotal ? Math.round((v / sevTotal) * 100) : 0);
  const perReview = analytics?.total_reviews ? (analytics.total_findings / analytics.total_reviews).toFixed(1) : "0.0";

  return (
    <AppShell>
      <header className="phead">
        <div className="phead__text rise">
          <span className="eyebrow"><span className="eyebrow__dot" />Overview</span>
          <h1 className="page-title">
            {greeting}, <span className="serif-i grad-text">{firstName}</span>
          </h1>
          <p className="page-sub">A snapshot of every review your agents have run — and where your code needs attention.</p>
        </div>
        <Link to="/review" className="btn btn--primary btn--lg rise d1">
          <Icon.play size={12} /> New review
        </Link>
      </header>

      {/* Primary stats */}
      <section className="stats">
        <div className="stat stat--hero glass glass--sheen rise d1">
          <div className="stat__top">
            <span className="label">Total reviews</span>
            <span className="stat__icon" ><Icon.code size={17} /></span>
          </div>
          <div className="stat__value"><Num value={analytics?.total_reviews} loading={loading} w={90} h={64} /></div>
          <div className="stat__foot">All-time code submissions analysed</div>
          <Spark color="#ffffff" />
        </div>

        <div className="stat glass rise d2">
          <div className="stat__top">
            <span className="label">Total findings</span>
            <span className="stat__icon"><Icon.search size={17} /></span>
          </div>
          <div className="stat__value"><Num value={analytics?.total_findings} loading={loading} /></div>
          <div className="stat__foot">Issues surfaced across reviews</div>
        </div>

        <div className="stat glass rise d3">
          <div className="stat__top">
            <span className="label">Avg / review</span>
            <span className="stat__icon"><Icon.spark size={17} /></span>
          </div>
          <div className="stat__value">{loading ? <span className="skeleton" style={{ width: 64, height: 48 }} /> : perReview}</div>
          <div className="stat__foot">Findings per submission</div>
        </div>
      </section>

      {/* Severity cards */}
      <section className="sev-grid">
        {SEV_CARDS.map(({ key, sev, hint }, i) => (
          <div key={key} className={`sev glass rise d${i + 2}`}>
            <div className="sev__head">
              <span className="sev__dot" style={{ background: sev.color, boxShadow: `0 0 0 4px ${sev.color}22` }} />
              <span className="sev__name">{sev.label} severity</span>
              <span className="sev__hint">{hint}</span>
            </div>
            <div className="sev__row">
              <span className="sev__value"><Num value={analytics?.[key]} loading={loading} w={48} h={38} /></span>
              {!loading && <span className="sev__pct">{pct(analytics?.[key] ?? 0)}%</span>}
            </div>
            <div className="meter"><i style={{ width: loading ? 0 : `${pct(analytics?.[key] ?? 0)}%`, background: sev.color }} /></div>
          </div>
        ))}
      </section>

      {/* Distribution + agents */}
      <section className="split">
        <div className="panel glass rise d3">
          <div className="panel__head">
            <span className="panel__title">Severity mix</span>
            <span className="label">{sevTotal} classified</span>
          </div>
          <div className="dist">
            {sevTotal === 0 ? (
              <i style={{ flexGrow: 1, background: "rgba(28,21,55,0.06)" }} />
            ) : (
              SEV_CARDS.map(({ key, sev }) => (
                <i key={key} style={{ flexGrow: analytics?.[key] || 0, background: sev.color }} />
              ))
            )}
          </div>
          <div className="dist-legend">
            {SEV_CARDS.map(({ key, sev }) => (
              <div className="dist-legend__row" key={key}>
                <span className="sev__dot" style={{ background: sev.color }} />
                {sev.label}
                <b>{loading ? "—" : analytics?.[key] ?? 0}</b>
                <span className="mono">{loading ? "" : `${pct(analytics?.[key] ?? 0)}%`}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel glass rise d4">
          <div className="panel__head">
            <span className="panel__title">Your review team</span>
            <span className="label">{AGENTS.length} agents</span>
          </div>
          <div className="agents">
            {AGENTS.slice(0, 4).map((a) => (
              <div className="agent" key={a.key}>
                <AgentIcon agent={a} />
                <div>
                  <div className="agent__name">{a.name}</div>
                  <div className="agent__desc">{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta glass glass--sheen rise d5">
        <div className="cta__text">
          <h3>Ready for your next <span className="serif-i grad-text">review</span>?</h3>
          <p>Paste your code and let five agents find the issues before your users do.</p>
        </div>
        <Link to="/review" className="btn btn--gold btn--lg">
          Open workspace <Icon.arrow size={16} />
        </Link>
      </section>
    </AppShell>
  );
}

export default Dashboard;
