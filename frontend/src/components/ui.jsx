/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useRef, useState } from "react";

/* ── Icons (stroke, 1.6) ──────────────────────────────────────── */
const I = ({ size = 16, children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
    {children}
  </svg>
);

export const Icon = {
  grid:    (p) => <I {...p}><rect x="3" y="3" width="7" height="9" rx="2" /><rect x="14" y="3" width="7" height="5" rx="2" /><rect x="14" y="12" width="7" height="9" rx="2" /><rect x="3" y="16" width="7" height="5" rx="2" /></I>,
  code:    (p) => <I {...p}><path d="m16 18 6-6-6-6" /><path d="m8 6-6 6 6 6" /></I>,
  clock:   (p) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></I>,
  logout:  (p) => <I {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></I>,
  mail:    (p) => <I {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></I>,
  lock:    (p) => <I {...p}><rect x="4" y="10" width="16" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></I>,
  user:    (p) => <I {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></I>,
  eye:     (p) => <I {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></I>,
  eyeOff:  (p) => <I {...p}><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.1 4" /><path d="M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /><path d="m2 2 20 20" /></I>,
  arrow:   (p) => <I {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></I>,
  play:    (p) => <I {...p}><path d="M7 4.5v15l13-7.5-13-7.5Z" fill="currentColor" stroke="none" /></I>,
  shield:  (p) => <I {...p}><path d="M12 3 4 6v6c0 5 3.4 8.3 8 9 4.6-.7 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></I>,
  bolt:    (p) => <I {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></I>,
  brain:   (p) => <I {...p}><path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1Z" /><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1" /></I>,
  brush:   (p) => <I {...p}><path d="M18 3 9 12l3 3 9-9-3-3Z" /><path d="M9 12c-3 0-5 2-5 5 0 1-1 2-2 2 2 2 7 2 9-1 1-1.5 1-3 1-3" /></I>,
  spark:   (p) => <I {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></I>,
  check:   (p) => <I {...p}><path d="m5 12 5 5 9-10" /></I>,
  alert:   (p) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.01" /></I>,
  chevron: (p) => <I {...p}><path d="m6 9 6 6 6-6" /></I>,
  copy:    (p) => <I {...p}><rect x="9" y="9" width="12" height="12" rx="2.5" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></I>,
  trash:   (p) => <I {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></I>,
  search:  (p) => <I {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></I>,
  layers:  (p) => <I {...p}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></I>,
  file:    (p) => <I {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5" /></I>,
};

export function Spinner({ size = 14 }) {
  return (
    <svg className="spin" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Brand ────────────────────────────────────────────────────── */
export function BrandMark({ small }) {
  const s = small ? 15 : 17;
  return (
    <span className={`brand__mark${small ? " brand__mark--sm" : ""}`} style={{ color: "var(--brand-ink, #fff)" }}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m8.5 7-5 5 5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m15.5 7 5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="1.8" fill="#fde68a" />
      </svg>
    </span>
  );
}

export function Brand({ small }) {
  return (
    <span className="brand">
      <BrandMark small={small} />
      <span className="brand__name">CodeReview<em className="grad-text">AI</em></span>
    </span>
  );
}

/* ── Ambient backdrop ─────────────────────────────────────────── */
export function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient__orb ambient__orb--a" />
      <div className="ambient__orb ambient__orb--b" />
      <div className="ambient__orb ambient__orb--c" />
      <div className="ambient__grid" />
      <div className="ambient__grain" />
    </div>
  );
}

/* ── Boot / loading screen ────────────────────────────────────── */
export function BootScreen() {
  return (
    <div className="boot">
      <Ambient />
      <div className="boot__inner">
        <span className="boot__mark"><BrandMark /></span>
        <div className="boot__bar"><i /></div>
      </div>
    </div>
  );
}

/* ── Toast ────────────────────────────────────────────────────── */
export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef();
  const show = useCallback((message, type = "success") => {
    clearTimeout(timer.current);
    setToast({ message, type, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 4200);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  const node = toast ? (
    <div key={toast.id} className={`toast toast--${toast.type}`} role="status">
      {toast.type === "error" ? <Icon.alert size={16} /> : <Icon.check size={16} />}
      {toast.message}
    </div>
  ) : null;
  return [node, show];
}

/* ── Domain config ────────────────────────────────────────────── */
export const SEVERITY = {
  critical: { label: "Critical", color: "#e11d48", rank: 0 },
  high:     { label: "High",     color: "#f43f5e", rank: 1 },
  medium:   { label: "Medium",   color: "#f59e0b", rank: 2 },
  low:      { label: "Low",      color: "#10b981", rank: 3 },
  info:     { label: "Info",     color: "#0ea5e9", rank: 4 },
};
export const getSev = (s = "") => SEVERITY[String(s).toLowerCase()] || SEVERITY.info;

export const AGENTS = [
  { key: "security",    name: "Security",    desc: "Vulnerabilities, injection & unsafe patterns", color: "#f43f5e", icon: Icon.shield },
  { key: "performance", name: "Performance", desc: "Complexity, hot paths & wasted work",        color: "#0ea5e9", icon: Icon.bolt },
  { key: "logic",       name: "Logic",       desc: "Edge cases, bugs & incorrect behaviour",     color: "#f59e0b", icon: Icon.brain },
  { key: "style",       name: "Style",       desc: "Readability, naming & maintainability",      color: "#8b5cf6", icon: Icon.brush },
  { key: "synthesis",   name: "Synthesis",   desc: "De-duplicates & ranks the final report",     color: "#ec4899", icon: Icon.layers },
];
export const getAgent = (agent = "") =>
  AGENTS.find((a) => String(agent).toLowerCase().includes(a.key)) ||
  { key: "agent", name: agent || "Agent", color: "#7a7396", icon: Icon.spark };

export const tint = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

export function SevTag({ severity }) {
  const s = getSev(severity);
  return (
    <span className="tag" style={{ color: s.color, borderColor: tint(s.color, 0.25), background: tint(s.color, 0.1) }}>
      <i />{severity || "info"}
    </span>
  );
}

export function AgentTag({ agent }) {
  const a = getAgent(agent);
  const A = a.icon;
  return (
    <span className="tag" style={{ color: a.color, borderColor: tint(a.color, 0.22), background: tint(a.color, 0.06) }}>
      <A size={11} />{agent || "agent"}
    </span>
  );
}

export function AgentIcon({ agent, size = 34, iconSize = 16, radius = 10 }) {
  const A = agent.icon;
  return (
    <span style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      display: "grid", placeItems: "center", color: agent.color,
      background: tint(agent.color, 0.12), border: `1px solid ${tint(agent.color, 0.22)}`,
    }}>
      <A size={iconSize} />
    </span>
  );
}
