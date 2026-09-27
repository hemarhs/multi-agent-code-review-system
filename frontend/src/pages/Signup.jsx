import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../lib/supabase";
import { AuthLayout, Field, Notice, PasswordStrength } from "../components/AuthLayout";
import { Icon, Spinner } from "../components/ui";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const navigate = useNavigate();

  async function signUp() {
    if (!name.trim() || !email.trim() || !password) {
      setNotice({ type: "error", text: "Enter your name, email, and password." });
      return;
    }
    if (password.length < 8) {
      setNotice({ type: "error", text: "Your password must be at least 8 characters." });
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: { data: { full_name: name.trim() } },
      });
      if (error) throw error;

      navigate("/", {
        state: {
          notice: data.session
            ? { type: "success", text: "Account created successfully! Sign in to get started." }
            : { type: "info", text: "Account created. Check your email to confirm it, then sign in." },
        },
      });
    } catch (error) {
      console.error("Signup failed:", error);
      setNotice({ type: "error", text: error.message || "Unable to sign up. Check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h1>Create your <span className="serif-i grad-text">account</span></h1>
      <p className="auth__lead">Start shipping safer code in under a minute.</p>

      <Notice notice={notice} />

      <form onSubmit={(e) => { e.preventDefault(); signUp(); }} noValidate autoComplete="off">
        <Field label="Full name" icon={Icon.user} placeholder="Ada Lovelace" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        <Field label="Email" icon={Icon.mail} type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <Field label="Password" icon={Icon.lock} type="password" placeholder="Minimum 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        <PasswordStrength password={password} />

        <p className="auth__terms">
          By creating an account you agree to our <span>Terms</span> and <span>Privacy Policy</span>.
        </p>

        <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={submitting}>
          {submitting ? <><Spinner /> Creating account…</> : <>Create free account <Icon.arrow size={16} /></>}
        </button>
      </form>

      <div className="auth__divider">already a member</div>
      <p className="auth__alt">
        Have an account? <Link to="/">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

export default Signup;
