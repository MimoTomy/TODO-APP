"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = "http://127.0.0.1:8000";

export default function Home() {
  const router = useRouter();
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("medium");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // get token from localStorage
  function getToken() {
    return localStorage.getItem("token");
  }

  // check if user is logged in on page load
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");  // redirect to login if no token
    } else {
      loadTodos();
    }
  }, []);

  // fetch all todos from the API with token
  async function loadTodos() {
    const res = await fetch(`${API}/todos`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (res.status === 401) {
      router.push("/login");  // token expired → redirect to login
      return;
    }

    const data = await res.json();
    setTodos(data);
    setLoading(false);
  }

  // add a new todo
  async function addTodo() {
    if (!task.trim()) return;
    await fetch(`${API}/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ task, priority }),
    });
    setTask("");
    setPriority("medium");
    loadTodos();
  }

  // delete a todo by id
  async function deleteTodo(id) {
    await fetch(`${API}/todos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    loadTodos();
  }

  // logout
  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  // priority color
  function priorityColor(p) {
    if (p === "high") return "text-red-500";
    if (p === "medium") return "text-yellow-500";
    return "text-green-500";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center py-16 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📝 My Todos</h1>
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-red-500"
          >
            Logout
          </button>
        </div>

        {/* input row */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="What needs to be done?"
            className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={addTodo}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Add
          </button>
        </div>

        {/* priority selector */}
        <div className="mb-8">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 text-gray-700"
          >
            <option value="low">🟢 Low Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="high">🔴 High Priority</option>
          </select>
        </div>

        {/* todo list */}
        {todos.length === 0 ? (
          <p className="text-center text-gray-400">No todos yet! Add one above.</p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-3"
            >
              <div>
                <span className="text-gray-700">{todo.task}</span>
                <span className={`ml-2 text-xs font-medium ${priorityColor(todo.priority)}`}>
                  {todo.priority}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}