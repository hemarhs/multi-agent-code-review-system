const configuredUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");

// `/api` is proxied to FastAPI during local Vite development.  Deployments can
// set VITE_BACKEND_URL to their public API URL at build time.
export const API_BASE_URL = configuredUrl || "/api";

export async function apiFetch(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (error) {
    throw new Error(
      "The review service could not be reached. Start the FastAPI server and check VITE_BACKEND_URL.",
      { cause: error }
    );
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // A non-JSON reverse-proxy error should still report the HTTP status.
    }
    throw new Error(message);
  }

  return response.json();
}
