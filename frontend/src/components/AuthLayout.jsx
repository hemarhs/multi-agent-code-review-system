import { useState } from "react";
import { Ambient, Brand, Icon, AGENTS, AgentIcon } from "./ui";

export function AuthLayout({ children }) {
  return (
    <>
      <Ambient />
      <div className="auth">
        <aside className="auth__showcase">
          <Brand />

          <div className="auth__hero">
            <span className="eyebrow"><span className="eyebrow__dot" />Multi-agent review engine</span>
            <h2>
              Five specialists.<br />
              <span className="serif-i grad-text">One flawless</span> review.
            </h2>
            <p>
              Security, performance, logic and style agents inspect your code in parallel —
              then a synthesis agent distils everything into one ranked, actionable report.
            </p>

            <div className="pipeline">
              {AGENTS.map((a, i) => (
                <div className="pipeline__row" key={a.key} style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
                  <AgentIcon agent={a} />
                  <div>
                    <div className="pipeline__name">{a.name} agent</div>
                    <div className="pipeline__desc">{a.desc}</div>
                  </div>
                  <span className="pipeline__status" style={{ color: a.key === "synthesis" ? "var(--gold)" : undefined }}>
                    <i />{a.key === "synthesis" ? "merge" : "ready"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="auth__foot">
            <span>FastAPI · LangGraph · Groq</span>
            <span>© {new Date().getFullYear()} CodeReviewAI</span>
          </div>
        </aside>

        <section className="auth__panel">
          <div className="auth__card glass glass--sheen">
            <div className="auth__mobile-brand"><Brand /></div>
            {children}
          </div>
        </section>
      </div>
    </>
  );
}

export function Field({ label, icon: Ico, type = "text", aside, value, onChange, placeholder, autoComplete, onEnter, autoFocus }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <label className="field">
      <span className="field__label">{label}{aside}</span>
      <span className="field__wrap">
        {Ico && <span className="field__icon"><Ico size={16} /></span>}
        <input
          className="field__input"
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }}
        />
        {isPassword && (
          <button
            type="button"
            className="field__action"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={(e) => { e.preventDefault(); setShow((v) => !v); }}
          >
            {show ? <Icon.eyeOff size={16} /> : <Icon.eye size={16} />}
          </button>
        )}
      </span>
    </label>
  );
}

export function Notice({ notice }) {
  if (!notice) return null;
  const Ico = notice.type === "error" ? Icon.alert : notice.type === "success" ? Icon.check : Icon.mail;
  return (
    <div className={`notice notice--${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>
      <Ico size={16} />
      <span>{notice.text}</span>
    </div>
  );
}

export function PasswordStrength({ password }) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 14) score++;
  const colors = ["#ff5c7a", "#f5c451", "#a29bfe", "#5ee0a0"];
  return (
    <div className="strength" aria-hidden="true" style={{ marginTop: -6, marginBottom: 16 }}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} style={{ background: password && i < score ? colors[score - 1] : undefined }} />
      ))}
    </div>
  );
}
