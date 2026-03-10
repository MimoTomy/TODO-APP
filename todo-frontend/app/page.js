"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = "http://127.0.0.1:8000";

export default function Home() {
  const router = useRouter();
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTask, setEditTask] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [dark, setDark] = useState(false);

  // ── Tag state ──────────────────────────────────────
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");
  const [filterTag, setFilterTag] = useState(null);
  const [showTagManager, setShowTagManager] = useState(false);

  // ── NEW: Search state ──────────────────────────────
  const [searchInput, setSearchInput] = useState("");   // what user types
  const [searchQuery, setSearchQuery] = useState("");   // debounced value sent to API
  // ───────────────────────────────────────────────────

  function getToken() { return localStorage.getItem("token"); }

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setDark(true);
    const token = getToken();
    if (!token) router.push("/login");
    else { loadTodos(); loadTags(); }
  }, []);

  useEffect(() => { if (!loading) loadTodos(filterTag, searchQuery); }, [filterTag]);

  // ── NEW: Debounce — wait 300ms after user stops typing ──
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer); // cancel if user keeps typing
  }, [searchInput]);

  // ── NEW: Re-fetch when debounced search value changes ──
  useEffect(() => { if (!loading) loadTodos(filterTag, searchQuery); }, [searchQuery]);
  // ───────────────────────────────────────────────────────

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  // ── UPDATED: now accepts both tagFilter and search ──
  async function loadTodos(tagFilter = filterTag, search = searchQuery) {
    const params = new URLSearchParams();
    if (tagFilter) params.set("tag", tagFilter);
    if (search)    params.set("search", search);
    const url = `${API}/todos${params.toString() ? "?" + params.toString() : ""}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.status === 401) { router.push("/login"); return; }
    const data = await res.json();
    setTodos(data);
    setLoading(false);
  }

  // ── Tag functions ──────────────────────────────────

  async function loadTags() {
    const res = await fetch(`${API}/tags`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    setTags(data);
  }

  async function createTag() {
    if (!newTagName.trim()) return;
    await fetch(`${API}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ name: newTagName.trim(), color: newTagColor }),
    });
    setNewTagName("");
    loadTags();
  }

  async function deleteTag(tagId) {
    await fetch(`${API}/tags/${tagId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (filterTag) setFilterTag(null);
    loadTags();
    loadTodos();
  }

  async function toggleTagOnTodo(todoId, tagId, hasTag) {
    const method = hasTag ? "DELETE" : "POST";
    await fetch(`${API}/todos/${todoId}/tags/${tagId}`, {
      method,
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    loadTodos();
  }

  async function addTodo() {
    if (!task.trim()) return;
    await fetch(`${API}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ task, priority, due_date: dueDate || null }),
    });
    setTask(""); setPriority("medium"); setDueDate("");
    loadTodos();
  }

  async function deleteTodo(id) {
    await fetch(`${API}/todos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    loadTodos();
  }

  async function toggleComplete(id) {
    await fetch(`${API}/todos/${id}/complete`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    loadTodos();
  }

  async function saveEdit(id) {
    await fetch(`${API}/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ task: editTask, priority: editPriority, due_date: editDueDate || null }),
    });
    setEditingId(null);
    loadTodos();
  }

  function startEdit(todo) {
    setEditingId(todo.id);
    setEditTask(todo.task);
    setEditPriority(todo.priority);
    setEditDueDate(todo.due_date || "");
  }

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  const priorityConfig = {
    high:   { label: "High",   bg: dark ? "rgba(239,68,68,0.15)"  : "#fee2e2", text: "#ef4444" },
    medium: { label: "Medium", bg: dark ? "rgba(245,158,11,0.15)" : "#fef3c7", text: "#d97706" },
    low:    { label: "Low",    bg: dark ? "rgba(34,197,94,0.15)"  : "#dcfce7", text: "#16a34a" },
  };

  const th = dark ? themes.dark : themes.light;
  const filteredTodos = todos.filter(todo => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });
  const completedCount = todos.filter(t => t.completed).length;

  if (loading) return (
    <main style={{ minHeight: "100vh", background: th.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 36, height: 36, border: `3px solid ${th.border}`, borderTop: `3px solid ${th.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </main>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${th.bg}; font-family: 'DM Sans', sans-serif; transition: background 0.3s; }
        ::placeholder { color: ${th.placeholder}; }
        input:focus, select:focus { outline: none; border-color: ${th.accent} !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .todo-item { animation: slideIn 0.2s ease forwards; }
        .todo-row:hover { background: ${th.rowHover} !important; }
        .todo-row:hover .action-btns { opacity: 1 !important; }
        .add-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .add-btn:active { transform: translateY(0); }
        .filter-btn:hover { color: ${th.accent} !important; }
        .theme-toggle:hover { background: ${th.border} !important; }
        .logout-btn:hover { color: #ef4444 !important; }
        .save-btn:hover { filter: brightness(1.1); }
        .cancel-btn:hover { color: ${th.textSecondary} !important; }
        .delete-btn:hover { color: #ef4444 !important; }
        .edit-btn:hover { color: ${th.accent} !important; }
        .tag-chip:hover { opacity: 0.75; }
        .tag-filter-btn:hover { opacity: 0.85; }
        .search-clear:hover { color: ${th.textPrimary} !important; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: ${dark ? "invert(0.5)" : "none"}; cursor: pointer; }
      `}</style>

      <main style={{ minHeight: "100vh", background: th.bg, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "48px 16px", transition: "background 0.3s" }}>
        <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 24, padding: "40px", width: "100%", maxWidth: 580, animation: "fadeUp 0.4s ease forwards", boxShadow: th.shadow, transition: "background 0.3s, border-color 0.3s" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: th.textPrimary, fontWeight: 700, lineHeight: 1.1 }}>My Tasks</h1>
              <p style={{ color: th.textMuted, fontSize: 13, marginTop: 4 }}>{completedCount} of {todos.length} completed</p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="theme-toggle" onClick={() => setShowTagManager(p => !p)}
                title="Manage tags"
                style={{ background: showTagManager ? th.accentBg : "none", border: `1px solid ${th.border}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16, transition: "background 0.2s" }}>
                🏷️
              </button>
              <button className="theme-toggle" onClick={toggleTheme}
                style={{ background: "none", border: `1px solid ${th.border}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16, transition: "background 0.2s" }}>
                {dark ? "☀️" : "🌙"}
              </button>
              <button className="logout-btn" onClick={logout}
                style={{ background: "none", border: "none", color: th.textMuted, fontSize: 13, cursor: "pointer", transition: "color 0.2s", fontFamily: "'DM Sans', sans-serif" }}>
                Sign out
              </button>
            </div>
          </div>

          {/* Tag Manager Panel */}
          {showTagManager && (
            <div style={{ background: th.inputBg, border: `1px solid ${th.border}`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: th.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Manage Tags
              </p>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && createTag()}
                  placeholder="Tag name..."
                  style={{ flex: 1, background: th.card, border: `1.5px solid ${th.border}`, borderRadius: 8, padding: "7px 12px", color: th.textPrimary, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}
                />
                <input
                  type="color" value={newTagColor}
                  onChange={e => setNewTagColor(e.target.value)}
                  style={{ width: 38, height: 36, border: `1.5px solid ${th.border}`, borderRadius: 8, padding: 2, cursor: "pointer", background: th.card }}
                />
                <button className="add-btn" onClick={createTag}
                  style={{ background: th.accent, color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Add
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {tags.length === 0 && <p style={{ fontSize: 12, color: th.textMuted }}>No tags yet — create one above.</p>}
                {tags.map(tag => (
                  <div key={tag.id} style={{ display: "flex", alignItems: "center", gap: 4, background: tag.color + "22", border: `1px solid ${tag.color}55`, borderRadius: 20, padding: "3px 8px 3px 10px" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: tag.color, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: tag.color }}>{tag.name}</span>
                    <button onClick={() => deleteTag(tag.id)}
                      style={{ background: "none", border: "none", color: tag.color, cursor: "pointer", fontSize: 14, lineHeight: 1, marginLeft: 2, opacity: 0.7, padding: "0 2px", fontFamily: "'DM Sans', sans-serif" }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress bar */}
          {todos.length > 0 && (
            <div style={{ height: 4, background: th.border, borderRadius: 2, marginBottom: 32, overflow: "hidden" }}>
              <div style={{ height: "100%", background: `linear-gradient(90deg, ${th.accent}, ${th.accentDark})`, borderRadius: 2, width: `${(completedCount / todos.length) * 100}%`, transition: "width 0.5s ease" }} />
            </div>
          )}

          {/* Add todo form */}
          <div style={{ marginBottom: 24 }}>
            <input type="text" value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              placeholder="Add a new task..."
              style={{ width: "100%", background: th.inputBg, border: `1.5px solid ${th.border}`, borderRadius: 12, padding: "12px 16px", color: th.textPrimary, fontSize: 14, marginBottom: 10, fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s, background 0.3s" }}
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}
                style={{ flex: 1, minWidth: 110, background: th.inputBg, border: `1.5px solid ${th.border}`, borderRadius: 12, padding: "10px 12px", color: th.textPrimary, fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "background 0.3s" }}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                style={{ flex: 1, minWidth: 140, background: th.inputBg, border: `1.5px solid ${th.border}`, borderRadius: 12, padding: "10px 12px", color: th.textPrimary, fontSize: 13, fontFamily: "'DM Sans', sans-serif", transition: "background 0.3s" }} />
              <button className="add-btn" onClick={addTodo}
                style={{ background: th.accent, color: "#fff", border: "none", borderRadius: 12, padding: "10px 22px", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "filter 0.2s, transform 0.15s", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
                + Add
              </button>
            </div>
          </div>

          {/* ── NEW: Search bar ────────────────────────── */}
          <div style={{ position: "relative", marginBottom: 20 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: th.textMuted, pointerEvents: "none" }}>🔍</span>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search tasks..."
              style={{ width: "100%", background: th.inputBg, border: `1.5px solid ${searchInput ? th.accent : th.border}`, borderRadius: 12, padding: "10px 36px 10px 36px", color: th.textPrimary, fontSize: 13, fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s, background 0.3s" }}
            />
            {searchInput && (
              <button className="search-clear" onClick={() => setSearchInput("")}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: th.textMuted, transition: "color 0.2s" }}>
                ×
              </button>
            )}
          </div>
          {/* ─────────────────────────────────────────── */}

          {/* Filter tabs */}
          <div style={{ display: "flex", borderBottom: `1.5px solid ${th.border}`, marginBottom: 12 }}>
            {["all", "active", "completed"].map(f => (
              <button key={f} className="filter-btn" onClick={() => setFilter(f)}
                style={{ background: "none", border: "none", padding: "8px 16px", fontSize: 13, cursor: "pointer", fontWeight: 500, fontFamily: "'DM Sans', sans-serif", marginBottom: -1.5, transition: "color 0.2s",
                  color: filter === f ? th.accent : th.textMuted,
                  borderBottom: filter === f ? `2px solid ${th.accent}` : "2px solid transparent" }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span style={{ marginLeft: 6, fontSize: 11, background: filter === f ? th.accentBg : th.border, color: filter === f ? th.accent : th.textMuted, padding: "1px 6px", borderRadius: 10 }}>
                  {f === "all" ? todos.length : f === "active" ? todos.filter(x => !x.completed).length : todos.filter(x => x.completed).length}
                </span>
              </button>
            ))}
          </div>

          {/* Tag filter chips */}
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16, paddingTop: 10 }}>
              {tags.map(tag => (
                <button key={tag.id} className="tag-filter-btn"
                  onClick={() => setFilterTag(prev => prev === tag.name ? null : tag.name)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    background: filterTag === tag.name ? tag.color : tag.color + "22",
                    border: `1px solid ${tag.color}66`, borderRadius: 20,
                    padding: "3px 12px 3px 8px", cursor: "pointer",
                    transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif"
                  }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: filterTag === tag.name ? "#fff" : tag.color, display: "inline-block" }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: filterTag === tag.name ? "#fff" : tag.color }}>
                    {tag.name}
                  </span>
                </button>
              ))}
              {filterTag && (
                <button onClick={() => setFilterTag(null)}
                  style={{ fontSize: 11, color: th.textMuted, background: "none", border: "none", cursor: "pointer", padding: "3px 6px", fontFamily: "'DM Sans', sans-serif" }}>
                  ✕ clear
                </button>
              )}
            </div>
          )}

          {/* Todo list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {filteredTodos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <p style={{ fontSize: 28, marginBottom: 12 }}>{searchInput ? "🔍" : filter === "completed" ? "🎯" : "✨"}</p>
                <p style={{ color: th.textMuted, fontSize: 13 }}>
                  {searchInput ? `No tasks matching "${searchInput}"` : filter === "completed" ? "Nothing completed yet." : "All clear — add a task above."}
                </p>
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <div key={todo.id} className="todo-item todo-row"
                  style={{ borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "background 0.15s", cursor: "default" }}>
                  {editingId === todo.id ? (
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                      <input value={editTask} onChange={(e) => setEditTask(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit(todo.id)} autoFocus
                        style={{ width: "100%", background: th.inputBg, border: `1.5px solid ${th.accent}`, borderRadius: 8, padding: "8px 12px", color: th.textPrimary, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }} />
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}
                          style={{ background: th.inputBg, border: `1.5px solid ${th.border}`, borderRadius: 8, padding: "6px 10px", color: th.textPrimary, fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                          <option value="low">🟢 Low</option>
                          <option value="medium">🟡 Medium</option>
                          <option value="high">🔴 High</option>
                        </select>
                        <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)}
                          style={{ flex: 1, background: th.inputBg, border: `1.5px solid ${th.border}`, borderRadius: 8, padding: "6px 10px", color: th.textPrimary, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }} />
                        <button className="save-btn" onClick={() => saveEdit(todo.id)}
                          style={{ background: th.accent, color: "#fff", border: "none", borderRadius: 8, padding: "6px 16px", fontWeight: 600, fontSize: 12, cursor: "pointer", transition: "filter 0.2s", fontFamily: "'DM Sans', sans-serif" }}>Save</button>
                        <button className="cancel-btn" onClick={() => setEditingId(null)}
                          style={{ background: "none", border: "none", color: th.textMuted, fontSize: 12, cursor: "pointer", padding: "6px 10px", transition: "color 0.2s", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                        <button onClick={() => toggleComplete(todo.id)}
                          style={{ width: 22, height: 22, border: `2px solid ${todo.completed ? th.accent : th.border}`, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0, background: todo.completed ? th.accent : "transparent" }}>
                          {todo.completed && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                        </button>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, color: todo.completed ? th.textMuted : th.textPrimary, textDecoration: todo.completed ? "line-through" : "none", transition: "all 0.2s", lineHeight: 1.4 }}>
                            {todo.task}
                          </p>
                          <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.05em", background: priorityConfig[todo.priority]?.bg, color: priorityConfig[todo.priority]?.text }}>
                              {priorityConfig[todo.priority]?.label}
                            </span>
                            {todo.due_date && (
                              <span style={{ fontSize: 11, color: th.textMuted }}>📅 {todo.due_date}</span>
                            )}
                            {todo.tags && todo.tags.map(tag => (
                              <span key={tag.id} className="tag-chip"
                                onClick={() => toggleTagOnTodo(todo.id, tag.id, true)}
                                title={`Remove tag: ${tag.name}`}
                                style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: tag.color + "22", color: tag.color, border: `1px solid ${tag.color}55`, cursor: "pointer", transition: "opacity 0.15s" }}>
                                {tag.name}
                              </span>
                            ))}
                            {tags.length > 0 && (
                              <select
                                onChange={e => { if (e.target.value) { toggleTagOnTodo(todo.id, parseInt(e.target.value), false); e.target.value = ""; }}}
                                style={{ fontSize: 10, background: "none", border: `1px dashed ${th.border}`, borderRadius: 20, padding: "2px 6px", color: th.textMuted, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                                <option value="">+ tag</option>
                                {tags.filter(t => !todo.tags.find(tt => tt.id === t.id)).map(tag => (
                                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="action-btns" style={{ display: "flex", gap: 2, opacity: 0, transition: "opacity 0.2s" }}>
                        <button className="edit-btn" onClick={() => startEdit(todo)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, padding: "4px 6px", borderRadius: 6, transition: "color 0.2s", color: th.textMuted }}>✏️</button>
                        <button className="delete-btn" onClick={() => deleteTodo(todo.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, padding: "4px 6px", borderRadius: 6, transition: "color 0.2s", color: th.textMuted }}>🗑️</button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {todos.length > 0 && (
            <p style={{ textAlign: "center", color: th.textMuted, fontSize: 12, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${th.border}` }}>
              {todos.filter(t => !t.completed).length} task{todos.filter(t => !t.completed).length !== 1 ? "s" : ""} remaining
            </p>
          )}
        </div>
      </main>
    </>
  );
}

const themes = {
  light: {
    bg: "#f5f7ff",
    card: "#ffffff",
    border: "#e8eaf6",
    inputBg: "#f8f9ff",
    rowHover: "#f5f7ff",
    accent: "#6366f1",
    accentDark: "#4f46e5",
    accentBg: "#eef2ff",
    textPrimary: "#1e1e2e",
    textSecondary: "#4b5563",
    textMuted: "#9ca3af",
    placeholder: "#c4c9e2",
    shadow: "0 8px 40px rgba(99,102,241,0.08)",
  },
  dark: {
    bg: "#0f0f13",
    card: "#15151c",
    border: "#1e1e28",
    inputBg: "#0f0f13",
    rowHover: "#1a1a22",
    accent: "#818cf8",
    accentDark: "#6366f1",
    accentBg: "rgba(129,140,248,0.1)",
    textPrimary: "#f0f0f0",
    textSecondary: "#9ca3af",
    textMuted: "#4b5563",
    placeholder: "#3a3a4a",
    shadow: "0 32px 80px rgba(0,0,0,0.5)",
  },
};