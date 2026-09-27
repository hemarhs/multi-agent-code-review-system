import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import supabase from "../lib/supabase";
import { AuthLayout, Field, Notice } from "../components/AuthLayout";
import { Icon, Spinner } from "../components/ui";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(location.state?.notice || null);

  useEffect(() => {
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) navigate("/review");
  }

  async function login() {
    if (!email.trim() || !password) {
      setNotice({ type: "error", text: "Enter your email and password." });
      return;
    }
    setSubmitting(true);
    setNotice(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      navigate("/review");
    } catch (error) {
      console.error("Login failed:", error);
      setNotice({ type: "error", text: error.message || "Unable to sign in. Check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  async function forgotPassword() {
    if (!email.trim()) {
      setNotice({ type: "info", text: "Enter your email above first, then click “Forgot password?”." });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { setNotice({ type: "error", text: error.message }); return; }
    setNotice({ type: "success", text: "Password reset link sent — check your inbox." });
  }

  return (
    <AuthLayout>
      <h1>Welcome <span className="serif-i grad-text">back</span></h1>
      <p className="auth__lead">Sign in to continue to your review workspace.</p>

      <Notice notice={notice} />

      <form onSubmit={(e) => { e.preventDefault(); login(); }} noValidate>
        <Field
          label="Email"
          icon={Icon.mail}
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Field
          label="Password"
          icon={Icon.lock}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          aside={<button type="button" className="btn-link" onClick={forgotPassword}>Forgot password?</button>}
        />

        <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={submitting} style={{ marginTop: 8 }}>
          {submitting ? <><Spinner /> Signing in…</> : <>Sign in <Icon.arrow size={16} /></>}
        </button>
      </form>

      <div className="auth__divider">new here</div>
      <p className="auth__alt">
        Don’t have an account? <Link to="/signup">Create one free</Link>
      </p>
    </AuthLayout>
  );
}

export default Login;
