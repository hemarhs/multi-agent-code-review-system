import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import { Brand, Icon } from "./ui";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: Icon.grid },
  { to: "/review",    label: "Review",    icon: Icon.code },
  { to: "/history",   label: "History",   icon: Icon.clock },
];

function Navbar() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserName(user.user_metadata?.full_name || user.email || "User");
    });
  }, []);

  async function logout() {
    // Remove legacy shared keys created before drafts were scoped per user.
    sessionStorage.removeItem("review-draft");
    sessionStorage.removeItem("review-result");
    await supabase.auth.signOut();
    navigate("/");
  }

  const initials = userName
    ? userName.split(/[\s@]/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "·";

  return (
    <div className="nav-wrap">
      <nav className="nav">
        <Link to="/dashboard" style={{ textDecoration: "none" }} aria-label="CodeReviewAI home">
          <Brand small />
        </Link>

        <div className="nav__links">
          {LINKS.map(({ to, label, icon: Ico }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav__link${isActive ? " is-active" : ""}`}>
              <Ico size={15} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="nav__right">
          <div className="nav__user" title={userName}>
            <span className="avatar">{initials}</span>
            <span className="nav__user-name">{userName.split(" ")[0] || "User"}</span>
          </div>
          <button className="nav__signout" onClick={logout} title="Sign out" aria-label="Sign out">
            <Icon.logout size={16} />
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
