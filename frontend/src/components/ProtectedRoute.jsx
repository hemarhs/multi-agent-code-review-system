import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setAuthenticated(!!session);
    setLoading(false);
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!authenticated) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;