export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  "Content-Type": "application/json",
});
