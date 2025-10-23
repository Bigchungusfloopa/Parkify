// src/api/api.js
const API_BASE = "http://localhost:8080/api/users";

export async function signup(user) {
  const res = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Signup failed");
  return await res.json();
}

export async function login(user) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Invalid credentials");
  return await res.json();
}


