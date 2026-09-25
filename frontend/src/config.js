export const API_BASE_URL = "https://ai-cyber-threat-intelligence-platform-sxv8.onrender.com";

export const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});