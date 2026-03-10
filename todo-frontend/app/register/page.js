"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = "http://127.0.0.1:8000";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setDark(true);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  async function handleRegister() {
    if (!username || !password) return;
    setLoading(true);
    setError("");
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);
      const loginRes = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });
      const loginData = await loginRes.json();
      localStorage.setItem("token", loginData.access_token);
      router.push("/");
    } else {
      setError(data.detail || "Something went wrong");
    }
    setLoading(false);
  }

  const th = dark ? themes.dark : themes.light;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${th.bg}; font-family: 'DM Sans', sans-serif; }
        ::placeholder { color: ${th.placeholder}; }
        input:focus { outline: none; border-color: ${th.accent} !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .register-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .register-btn:active { transform: translateY(0); }
        .register-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
        .theme-toggle:hover { background: ${th.border} !important; }
      `}</style>

      <main style={{ minHeight: "100vh", background: th.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", position: "relative", transition: "background 0.3s" }}>

        {/* Theme toggle */}
        <button className="theme-toggle" onClick={toggleTheme}
          style={{ position: "absolute", top: 20, right: 20, background: "none", border: `1px solid ${th.border}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16, transition: "background 0.2s" }}>
          {dark ? "☀️" : "🌙"}
        </button>

        {/* Decorative blobs */}
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", top: -100, left: -100, background: `radial-gradient(circle, ${th.blobColor} 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", bottom: -80, right: -80, background: `radial-gradient(circle, ${th.blobColor} 0%, transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 24, padding: "48px 40px", width: "100%", maxWidth: 420, animation: "fadeUp 0.4s ease forwards", boxShadow: th.shadow, position: "relative", zIndex: 1, transition: "background 0.3s" }}>

          <div style={{ width: 40, height: 40, background: th.accentBg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 24 }}>✦</div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: th.textPrimary, fontWeight: 700, marginBottom: 6 }}>Create account</h1>
          <p style={{ color: th.textMuted, fontSize: 13, marginBottom: 32 }}>Start organizing your tasks</p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: 10, padding: "12px 16px", fontSize: 13, marginBottom: 24 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, color: th.textMuted, marginBottom: 6, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Username</label>
            <input type="text" value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              placeholder="Choose a username"
              style={{ width: "100%", background: th.inputBg, border: `1.5px solid ${th.border}`, borderRadius: 12, padding: "12px 16px", color: th.textPrimary, fontSize: 14, transition: "border-color 0.2s, background 0.3s", fontFamily: "'DM Sans', sans-serif" }} />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 11, color: th.textMuted, marginBottom: 6, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Password</label>
            <input type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              placeholder="Choose a password"
              style={{ width: "100%", background: th.inputBg, border: `1.5px solid ${th.border}`, borderRadius: 12, padding: "12px 16px", color: th.textPrimary, fontSize: 14, transition: "border-color 0.2s, background 0.3s", fontFamily: "'DM Sans', sans-serif" }} />
          </div>

          <p style={{ fontSize: 11, color: th.textMuted, marginBottom: 24 }}>Use at least 8 characters for a strong password</p>

          <button className="register-btn" onClick={handleRegister} disabled={loading}
            style={{ width: "100%", background: th.accent, color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "filter 0.2s, transform 0.15s", fontFamily: "'DM Sans', sans-serif" }}>
            {loading ? "Creating account..." : "Get started →"}
          </button>

          <p style={{ textAlign: "center", color: th.textMuted, fontSize: 13, marginTop: 24 }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: th.accent, textDecoration: "none", fontWeight: 600 }}>Sign in</a>
          </p>
        </div>
      </main>
    </>
  );
}

const themes = {
  light: {
    bg: "#f5f7ff", card: "#ffffff", border: "#e8eaf6", inputBg: "#f8f9ff",
    accent: "#6366f1", accentDark: "#4f46e5", accentBg: "#eef2ff",
    textPrimary: "#1e1e2e", textMuted: "#9ca3af", placeholder: "#c4c9e2",
    shadow: "0 8px 40px rgba(99,102,241,0.1)",
    blobColor: "rgba(99,102,241,0.06)",
  },
  dark: {
    bg: "#0f0f13", card: "#15151c", border: "#1e1e28", inputBg: "#0f0f13",
    accent: "#818cf8", accentDark: "#6366f1", accentBg: "rgba(129,140,248,0.1)",
    textPrimary: "#f0f0f0", textMuted: "#4b5563", placeholder: "#3a3a4a",
    shadow: "0 32px 80px rgba(0,0,0,0.5)",
    blobColor: "rgba(129,140,248,0.05)",
  },
};