import { useEffect, useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { getAuthStatus, login, logout } from "./api.js";

export function useAccessGate() {
  const [access, setAccess] = useState({ loading: true, configured: false, granted: true });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await getAuthStatus();
        if (!cancelled) {
          setAccess({
            loading: false,
            configured: Boolean(status.configured),
            granted: status.configured ? Boolean(status.granted) : true,
          });
        }
      } catch {
        if (!cancelled) setAccess({ loading: false, configured: false, granted: true });
      }
    })();

    const onRequired = () => {
      setAccess({ loading: false, configured: true, granted: false });
    };
    window.addEventListener("hulukipedia:access-required", onRequired);
    return () => {
      cancelled = true;
      window.removeEventListener("hulukipedia:access-required", onRequired);
    };
  }, []);

  const handleLogin = async (password) => {
    await login(password);
    setAccess({ loading: false, configured: true, granted: true });
  };

  const handleLock = async () => {
    await logout();
    setAccess({ loading: false, configured: true, granted: false });
  };

  return { access, handleLogin, handleLock };
}

export function AccessOverlay({ theme, onSubmit }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError("");
    try {
      await onSubmit(password);
    } catch (err) {
      setError(err.message || "Incorrect password");
      setPassword("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(48, 36, 21, 0.45)",
        padding: "1.5rem",
      }}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-sm p-6 shadow-lg"
        style={{
          background: theme.bgContainer,
          border: `1px solid ${theme.border}`,
          borderRadius: "0.75rem",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Lock size={18} style={{ color: theme.accentGold }} />
          <h2 className="font-bold" style={{ color: theme.accentGold, letterSpacing: "0.08em" }}>
            UNLOCK HULUKIPEDIA
          </h2>
        </div>
        <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>
          Enter the shared password to use the archive's AI tools. The site stays open; paid requests stay locked until you do.
        </p>
        <label htmlFor="hulukipedia-password" className="block text-xs font-bold mb-2" style={{ color: theme.textSecondary, letterSpacing: "0.05em" }}>
          PASSWORD
        </label>
        <input
          id="hulukipedia-password"
          type="password"
          name="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-md px-4 py-2 mb-3 outline-none"
          style={{
            backgroundColor: theme.bgMain,
            border: `1px solid ${theme.border}`,
            color: theme.textPrimary,
          }}
        />
        {error && (
          <p className="text-sm mb-3" style={{ color: "#8a2a0a" }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={busy || !password}
          className="w-full flex items-center justify-center font-bold py-2 px-4 rounded-md"
          style={{ backgroundColor: theme.accentGold, color: "#fffdf7", opacity: busy || !password ? 0.6 : 1 }}
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : "Unlock"}
        </button>
      </form>
    </div>
  );
}
