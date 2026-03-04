"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API = "http://127.0.0.1:8000";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      // auto login after register
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

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create account 🚀</h1>
        <p className="text-gray-400 mb-8">Sign up to get started</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            placeholder="Choose a username"
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            placeholder="Choose a password"
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 hover:underline font-medium">
            Login
          </a>
        </p>
      </div>
    </main>
  );
}