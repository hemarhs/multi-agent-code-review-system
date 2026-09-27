import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../lib/supabase";
import { AuthLayout, Field, Notice, PasswordStrength } from "../components/AuthLayout";
import { Icon, Spinner } from "../components/ui";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const navigate = useNavigate();

  async function updatePassword() {
    if (password.length < 8) {
      setNotice({ type: "error", text: "Your password must be at least 8 characters." });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) { setNotice({ type: "error", text: error.message }); return; }
    navigate("/", { state: { notice: { type: "success", text: "Password updated successfully. Sign in with your new password." } } });
  }

  return (
    <AuthLayout>
      <h1>Reset <span className="serif-i grad-text">password</span></h1>
      <p className="auth__lead">Choose a strong new password for your account.</p>

      <Notice notice={notice} />

      <form onSubmit={(e) => { e.preventDefault(); updatePassword(); }} noValidate>
        <Field label="New password" icon={Icon.lock} type="password" placeholder="Minimum 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" autoFocus />
        <PasswordStrength password={password} />

        <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={submitting}>
          {submitting ? <><Spinner /> Updating…</> : <>Update password <Icon.arrow size={16} /></>}
        </button>
      </form>

      <div className="auth__divider">or</div>
      <p className="auth__alt"><Link to="/">Back to sign in</Link></p>
    </AuthLayout>
  );
}

export default ResetPassword;
