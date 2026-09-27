import Editor from "@monaco-editor/react";
import { useState, useEffect, useRef } from "react";
import supabase from "../lib/supabase";
import AppShell from "../components/AppShell";
import { apiFetch } from "../lib/api";
import {
  Icon, Spinner, useToast,
  AGENTS, AgentIcon, SevTag, AgentTag, getSev, getAgent, tint, SEVERITY,
} from "../components/ui";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript", ext: "js" },
  { id: "typescript", label: "TypeScript", ext: "ts" },
  { id: "python",     label: "Python",     ext: "py" },
  { id: "java",       label: "Java",       ext: "java" },
  { id: "go",         label: "Go",         ext: "go" },
  { id: "cpp",        label: "C++",        ext: "cpp" },
  { id: "csharp",     label: "C#",         ext: "cs" },
  { id: "php",        label: "PHP",        ext: "php" },
  { id: "sql",        label: "SQL",        ext: "sql" },
];

const SAMPLE = `const express = require("express");
const db = require("./db");
const app = express();

app.get("/user", async (req, res) => {
  const id = req.query.id;
  // look up the user
  const rows = await db.query("SELECT * FROM users WHERE id = " + id);
  let result = [];
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows.length; j++) {
      if (rows[i].id == rows[j].id) result.push(rows[i]);
    }
  }
  res.send(result[0].password);
});

app.listen(3000);
`;

function defineTheme(monaco) {
  monaco.editor.defineTheme("obsidian", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "8b84b0", fontStyle: "italic" },
      { token: "keyword", foreground: "f472b6" },
      { token: "string", foreground: "fcd34d" },
      { token: "number", foreground: "67e8f9" },
      { token: "type", foreground: "67e8f9" },
      { token: "identifier", foreground: "ece9ff" },
      { token: "delimiter", foreground: "c4b5fd" },
    ],
    colors: {
      "editor.background": "#17122e",
      "editor.foreground": "#ece9ff",
      "editorLineNumber.foreground": "#4a4270",
      "editorLineNumber.activeForeground": "#f472b6",
      "editor.lineHighlightBackground": "#ffffff0a",
      "editor.lineHighlightBorder": "#00000000",
      "editor.selectionBackground": "#c026d355",
      "editorCursor.foreground": "#fcd34d",
      "editorIndentGuide.background1": "#ffffff0d",
      "editorWidget.background": "#1f1940",
      "scrollbarSlider.background": "#ffffff18",
      "editorGutter.background": "#17122e",
    },
  });
}
/* ── Running state ────────────────────────────────────────────── */
function Running() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => s + 1), 100);
    return () => clearInterval(t);
  }, []);
  const secs = (tick / 10).toFixed(1);
  const active = Math.floor(tick / 9) % (AGENTS.length + 1);
  return (
    <div className="running glass glass--sheen" role="status" aria-live="polite">
      <div className="running__head">
        <Spinner size={16} />
        <span className="running__title">Agents are reviewing your code</span>
        <span className="running__time">{secs}s</span>
      </div>
      <div className="running__track"><i /></div>
      <div className="lanes">
        {AGENTS.map((a, i) => {
          const isSynth = a.key === "synthesis";
          const on = isSynth ? active >= AGENTS.length - 1 : true;
          const hot = isSynth ? on : i === active % (AGENTS.length - 1);
          return (
            <div key={a.key} className={`lane${on ? " is-on" : ""}`} style={{ borderColor: hot ? tint(a.color, 0.4) : undefined }}>
              <AgentIcon agent={a} size={28} iconSize={14} radius={8} />
              <span className="lane__name">{a.name}</span>
              <span className="lane__state" style={{ color: on ? a.color : undefined }}>
                {on ? <><span className="pulse" />{isSynth ? "merging" : "analysing"}</> : "queued"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Finding card ─────────────────────────────────────────────── */
function FindingCard({ finding, index, onCopy }) {
  const [open, setOpen] = useState(index === 0);
  const sev = getSev(finding.severity);
  const pct = Math.round((finding.confidence ?? 0.85) * 100);
  return (
    <article className={`finding glass${open ? " is-open" : ""}`} style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}>
      <span className="finding__stripe" style={{ background: sev.color, }} />
      <button className="finding__head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="finding__idx">{String(index + 1).padStart(2, "0")}</span>
        <span className="finding__main">
          <span className="finding__title" style={{ display: "block" }}>{finding.title}</span>
          <span className="finding__tags">
            <SevTag severity={finding.severity} />
            <AgentTag agent={finding.agent} />
          </span>
        </span>
        <span className="finding__chev"><Icon.chevron size={18} /></span>
      </button>

      {open && (
        <div className="finding__body">
          <div className="conf">
            <span className="label">Confidence</span>
            <div className="meter"><i style={{ width: `${pct}%`, background: "var(--grad-brand)" }} /></div>
            <span className="conf__val">{pct}%</span>
          </div>
          <p className="finding__expl">{finding.explanation}</p>
          {finding.suggested_fix && (
            <div className="fix">
              <div className="fix__head">
                <Icon.check size={13} style={{ color: "#6ee7b7" }} />
                <span className="label">Suggested fix</span>
                <button className="icon-btn fix__copy" onClick={() => onCopy(finding.suggested_fix)}>
                  <Icon.copy size={13} /> Copy
                </button>
              </div>
              <div className="fix__text">{finding.suggested_fix}</div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
function Review() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [sevFilter, setSevFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [toastNode, toast] = useToast();
  const runRef = useRef(() => {});
  const resultsRef = useRef(null);

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
    if (loading || !code.trim()) return;
    try {
      setLoading(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Your session has expired. Please sign in again.");

      const data = await apiFetch("/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, user_id: user.id }),
      });

      setResult(data);
      setSevFilter("all");
      setAgentFilter("all");
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } catch (error) {
      console.error(error);
      toast(error.message || "Review failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { runRef.current = reviewCode; });

  function clearAll() {
    setCode("");
    setResult(null);
    if (userId) sessionStorage.removeItem(`review-result-${userId}`);
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("Fix copied to clipboard");
    } catch {
      toast("Couldn't access the clipboard", "error");
    }
  }

  const findings = result?.findings ?? [];
  const sorted = [...findings].sort((a, b) => getSev(a.severity).rank - getSev(b.severity).rank);
  const counts = findings.reduce((acc, f) => {
    const k = f.severity?.toLowerCase() || "info";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const agentsPresent = [...new Set(findings.map((f) => getAgent(f.agent).name))];
  const visible = sorted.filter((f) =>
    (sevFilter === "all" || (f.severity?.toLowerCase() || "info") === sevFilter) &&
    (agentFilter === "all" || getAgent(f.agent).name === agentFilter)
  );

  const lines = code ? code.split("\n").length : 0;
  const lang = LANGUAGES.find((l) => l.id === language);
  const isMac = typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);

  return (
    <AppShell>
      <header className="phead">
        <div className="phead__text rise">
          <span className="eyebrow"><span className="eyebrow__dot" />Workspace · {name.split(" ")[0]}</span>
          <h1 className="page-title">
            Code <span className="serif-i grad-text">review</span>
          </h1>
          <p className="page-sub">Paste your code, run the agents, and ship with confidence.</p>
        </div>
      </header>

      {/* Editor */}
      <section className="editor glass rise d1">
        <div className="editor__bar">
          <span className="editor__lights"><i /><i /><i /></span>
          <span className="editor__tab"><i />untitled.{lang?.ext}</span>
          <span className="editor__spacer" />
          <select className="select" value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Syntax highlighting language">
            {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
          {!code.trim() ? (
            <button className="icon-btn" onClick={() => setCode(SAMPLE)} disabled={loading}>
              <Icon.file size={13} /> Sample
            </button>
          ) : (
            <button className="icon-btn" onClick={clearAll} disabled={loading}>
              <Icon.trash size={13} /> Clear
            </button>
          )}
        </div>

        <div className="editor__body">
          <Editor
            height="380px"
            language={language}
            theme="obsidian"
            value={code}
            beforeMount={defineTheme}
            onMount={(editor, monaco) => {
              editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current());
            }}
            onChange={(value) => setCode(value || "")}
            loading={<div style={{ height: 380, display: "grid", placeItems: "center", color: "#a78bfa", background: "#17122e" }}><Spinner size={18} /></div>}
            options={{
              minimap: { enabled: false },
              fontSize: 13.5,
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontLigatures: true,
              lineHeight: 22,
              wordWrap: "on",
              automaticLayout: true,
              scrollBeyondLastLine: false,
              padding: { top: 18, bottom: 18 },
              renderLineHighlight: "all",
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              roundedSelection: true,
              guides: { indentation: true },
              overviewRulerBorder: false,
              hideCursorInOverviewRuler: true,
              scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
            }}
          />
        </div>

        <div className="editor__foot">
          <div className="editor__meta">
            <span><b>{lines}</b> lines</span>
            <span><b>{code.length}</b> chars</span>
            <span>{lang?.label}</span>
          </div>
          <button className="btn btn--primary btn--lg" onClick={reviewCode} disabled={loading || !code.trim()}>
            {loading ? <><Spinner /> Analysing…</> : <><Icon.play size={12} /> Run review <span className="kbd">{isMac ? "⌘" : "Ctrl"} ↵</span></>}
          </button>
        </div>
      </section>

      {loading && <Running />}

      {/* Results */}
      {result && !loading && (
        <section className="results" ref={resultsRef}>
          {findings.length > 0 ? (
            <>
              <div className="summary glass glass--sheen">
                <div className="summary__count">
                  <span className="summary__num">{findings.length}</span>
                  <span className="summary__lbl">finding{findings.length !== 1 ? "s" : ""}<br />detected</span>
                </div>
                <div className="summary__bars">
                  <span className="label">Severity breakdown</span>
                  <div className="dist" style={{ margin: 0 }}>
                    {Object.keys(SEVERITY).map((k) => counts[k] ? (
                      <i key={k} style={{ flexGrow: counts[k], background: SEVERITY[k].color }} />
                    ) : null)}
                  </div>
                  <div className="summary__chips">
                    {Object.keys(SEVERITY).filter((k) => counts[k]).map((k) => (
                      <span key={k} className="dist-legend__row" style={{ gap: 7, fontSize: 12.5 }}>
                        <span className="sev__dot" style={{ background: SEVERITY[k].color, width: 7, height: 7 }} />
                        {SEVERITY[k].label} <b style={{ marginLeft: 2 }}>{counts[k]}</b>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="filters">
                <div className="summary__chips">
                  <button className={`chip${sevFilter === "all" ? " is-active" : ""}`} onClick={() => setSevFilter("all")}>
                    All <b>{findings.length}</b>
                  </button>
                  {Object.keys(SEVERITY).filter((k) => counts[k]).map((k) => (
                    <button key={k} className={`chip${sevFilter === k ? " is-active" : ""}`} onClick={() => setSevFilter(k)}>
                      <span className="chip__dot" style={{ background: SEVERITY[k].color }} />
                      {SEVERITY[k].label} <b>{counts[k]}</b>
                    </button>
                  ))}
                </div>
                {agentsPresent.length > 1 && (
                  <select className="select" value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} aria-label="Filter by agent" style={{ height: 30 }}>
                    <option value="all">All agents</option>
                    {agentsPresent.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                )}
              </div>

              <div className="findings">
                {visible.map((f, i) => (
                  <FindingCard key={`${sevFilter}-${agentFilter}-${i}`} finding={f} index={i} onCopy={copy} />
                ))}
                {visible.length === 0 && (
                  <p style={{ color: "var(--text-3)", textAlign: "center", padding: 28 }}>No findings match these filters.</p>
                )}
              </div>
            </>
          ) : (
            <div className="allclear glass glass--sheen">
              <div className="allclear__badge"><Icon.check size={28} /></div>
              <h3>All <span className="serif-i">clear</span></h3>
              <p>No issues detected — clean, well-structured and production-ready.</p>
            </div>
          )}
        </section>
      )}

      {toastNode}
    </AppShell>
  );
}

export default Review;
