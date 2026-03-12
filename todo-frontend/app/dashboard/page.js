"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Chart,
  LineElement, PointElement, LineController,
  BarElement, BarController,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Filler,
} from "chart.js";

Chart.register(
  LineElement, PointElement, LineController,
  BarElement, BarController,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Filler,
);

function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return value;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const lineRef  = useRef(null);
  const barRef   = useRef(null);
  const donutRef = useRef(null);
  const lineChart  = useRef(null);
  const barChart   = useRef(null);
  const donutChart = useRef(null);

  const total     = useCountUp(data?.total || 0);
  const completed = useCountUp(data?.completed || 0);
  const pending   = useCountUp(data?.pending || 0);
  const overdue   = useCountUp(data?.overdue || 0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetch("http://localhost:8000/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => setData(d))
      .catch(() => setError("Could not load dashboard."));
  }, []);

  useEffect(() => {
    if (!data) return;
    [lineChart, barChart, donutChart].forEach(r => { if (r.current) { r.current.destroy(); r.current = null; } });

    lineChart.current = new Chart(lineRef.current, {
      type: "line",
      data: {
        labels: data.completions_per_day.map(d =>
          new Date(d.date).toLocaleDateString("en-US", { weekday: "short" })
        ),
        datasets: [{
          data: data.completions_per_day.map(d => d.count),
          borderColor: "#6366f1",
          backgroundColor: "rgba(99,102,241,0.07)",
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: "#6366f1",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true,
        }],
      },
      options: {
        plugins: { legend: { display: false }, tooltip: {
          backgroundColor: "#fff", borderColor: "#e8eaf6", borderWidth: 1,
          titleColor: "#6366f1", bodyColor: "#4b5563", padding: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }},
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, color: "#9ca3af", font: { size: 11, family: "'DM Sans'" } }, grid: { color: "rgba(0,0,0,0.04)" }, border: { display: false } },
          x: { ticks: { color: "#9ca3af", font: { size: 11, family: "'DM Sans'" } }, grid: { display: false }, border: { display: false } },
        },
      },
    });

    barChart.current = new Chart(barRef.current, {
      type: "bar",
      data: {
        labels: ["High", "Medium", "Low"],
        datasets: [{
          data: [data.by_priority.high, data.by_priority.medium, data.by_priority.low],
          backgroundColor: ["rgba(239,68,68,0.15)", "rgba(245,158,11,0.15)", "rgba(34,197,94,0.15)"],
          borderColor: ["#ef4444", "#d97706", "#16a34a"],
          borderWidth: 1.5,
          borderRadius: 8,
        }],
      },
      options: {
        plugins: { legend: { display: false }, tooltip: {
          backgroundColor: "#fff", borderColor: "#e8eaf6", borderWidth: 1,
          titleColor: "#1e1e2e", bodyColor: "#4b5563", padding: 10,
        }},
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, color: "#9ca3af", font: { size: 11, family: "'DM Sans'" } }, grid: { color: "rgba(0,0,0,0.04)" }, border: { display: false } },
          x: { ticks: { color: "#6b7280", font: { size: 12, family: "'DM Sans'" } }, grid: { display: false }, border: { display: false } },
        },
      },
    });

    donutChart.current = new Chart(donutRef.current, {
      type: "doughnut",
      data: {
        labels: ["Completed", "Pending", "Overdue"],
        datasets: [{
          data: [data.completed, Math.max(0, data.pending - data.overdue), data.overdue],
          backgroundColor: ["rgba(99,102,241,0.85)", "rgba(99,102,241,0.25)", "rgba(239,68,68,0.7)"],
          borderColor: ["#6366f1", "#c7d2fe", "#ef4444"],
          borderWidth: 1,
          hoverOffset: 4,
        }],
      },
      options: {
        cutout: "75%",
        plugins: { legend: { display: false }, tooltip: {
          backgroundColor: "#fff", borderColor: "#e8eaf6", borderWidth: 1,
          titleColor: "#1e1e2e", bodyColor: "#4b5563", padding: 10,
        }},
      },
    });
  }, [data]);

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#f5f7ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <p style={{ color: "#ef4444" }}>{error}</p>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: "100vh", background: "#f5f7ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 32, height: 32, border: "3px solid #e8eaf6", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  const rate = data.completion_rate;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f7ff; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card {
          background: #ffffff;
          border: 1px solid #e8eaf6;
          border-radius: 20px;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
          box-shadow: 0 2px 12px rgba(99,102,241,0.04);
        }
        .card:hover {
          border-color: #c7d2fe;
          box-shadow: 0 8px 30px rgba(99,102,241,0.1);
          transform: translateY(-2px);
        }
        .back-link:hover { color: #6366f1 !important; }
        .s1{animation:fadeUp 0.4s ease forwards;animation-delay:0.05s;opacity:0}
        .s2{animation:fadeUp 0.4s ease forwards;animation-delay:0.1s;opacity:0}
        .s3{animation:fadeUp 0.4s ease forwards;animation-delay:0.15s;opacity:0}
        .s4{animation:fadeUp 0.4s ease forwards;animation-delay:0.2s;opacity:0}
        .s5{animation:fadeUp 0.4s ease forwards;animation-delay:0.25s;opacity:0}
        .s6{animation:fadeUp 0.4s ease forwards;animation-delay:0.3s;opacity:0}
      `}</style>

      <main style={{ minHeight: "100vh", background: "#f5f7ff", fontFamily: "'DM Sans', sans-serif", padding: "40px 24px", maxWidth: 1080, margin: "0 auto" }}>

        {/* Header */}
        <div className="s1" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: "0.12em", color: "#9ca3af", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>Overview</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: "#1e1e2e", lineHeight: 1 }}>Analytics</h1>
          </div>
          <Link href="/" className="back-link" style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none", transition: "color 0.2s", fontWeight: 500 }}>
            ← Back to tasks
          </Link>
        </div>

        {/* Metric cards */}
        <div className="s2" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
          {[
            { label: "Total",      value: total,      accent: "#6366f1", light: "#eef2ff" },
            { label: "Completed",  value: completed,  accent: "#16a34a", light: "#dcfce7" },
            { label: "Pending",    value: pending,    accent: "#2563eb", light: "#dbeafe" },
            { label: "Overdue",    value: overdue,    accent: "#ef4444", light: "#fee2e2" },
          ].map((m, i) => (
            <div key={i} className="card" style={{ padding: "22px 20px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -16, right: -16, width: 80, height: 80, background: m.light, borderRadius: "50%", opacity: 0.8 }} />
              <p style={{ fontSize: 10, color: "#9ca3af", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>{m.label}</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 700, color: m.accent, lineHeight: 1 }}>{m.value}</p>
              <div style={{ marginTop: 14, height: 2, background: "#f3f4f6", borderRadius: 1 }}>
                <div style={{ height: "100%", width: `${m.label === "Completed" ? rate : m.label === "Overdue" && data.total > 0 ? Math.round(data.overdue / data.total * 100) : 100}%`, background: m.accent, borderRadius: 1, opacity: 0.4 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Row 1: Line + Donut */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12, marginBottom: 12 }}>
          <div className="card s3" style={{ padding: "26px" }}>
            <p style={{ fontSize: 10, color: "#9ca3af", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>Activity</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#1e1e2e", marginBottom: 22 }}>Completions this week</p>
            <canvas ref={lineRef} height={130} />
          </div>

          <div className="card s4" style={{ padding: "26px", display: "flex", flexDirection: "column" }}>
            <p style={{ fontSize: 10, color: "#9ca3af", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>Status</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#1e1e2e", marginBottom: 20 }}>Completion rate</p>
            <div style={{ position: "relative", width: 130, height: 130, margin: "0 auto 20px" }}>
              <canvas ref={donutRef} width={130} height={130} style={{ position: "absolute", top: 0, left: 0 }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#1e1e2e" }}>{rate}%</span>
                <span style={{ fontSize: 10, color: "#9ca3af", marginTop: 2, fontWeight: 500 }}>done</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Completed", color: "#6366f1", value: data.completed },
                { label: "Pending",   color: "#c7d2fe", value: Math.max(0, data.pending - data.overdue) },
                { label: "Overdue",   color: "#ef4444", value: data.overdue },
              ].map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                    <span style={{ fontSize: 12, color: "#6b7280" }}>{l.label}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{l.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Bar + Subtasks */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="card s5" style={{ padding: "26px" }}>
            <p style={{ fontSize: 10, color: "#9ca3af", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>Distribution</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#1e1e2e", marginBottom: 22 }}>By priority</p>
            <canvas ref={barRef} height={140} />
          </div>

          <div className="card s6" style={{ padding: "26px" }}>
            <p style={{ fontSize: 10, color: "#9ca3af", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>Breakdown</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#1e1e2e", marginBottom: 20 }}>Subtasks</p>

            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 14 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 700, lineHeight: 1, color: "#6366f1" }}>
                {data.subtasks.rate}%
              </span>
              <span style={{ fontSize: 13, color: "#9ca3af", paddingBottom: 10 }}>complete</span>
            </div>

            <div style={{ height: 5, background: "#f3f4f6", borderRadius: 3, overflow: "hidden", marginBottom: 24 }}>
              <div style={{ height: "100%", width: `${data.subtasks.rate}%`, background: "linear-gradient(90deg, #6366f1, #818cf8)", borderRadius: 3, transition: "width 1s ease" }} />
            </div>

            {[
              { label: "Total",     value: data.subtasks.total,                           color: "#6b7280" },
              { label: "Done",      value: data.subtasks.completed,                       color: "#16a34a" },
              { label: "Left",      value: data.subtasks.total - data.subtasks.completed, color: "#2563eb" },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? "1px solid #f3f4f6" : "none" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>{row.label}</span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </>
  );
}