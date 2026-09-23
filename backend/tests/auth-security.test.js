const request = require("supertest");
const app = require("../server");
const { fallbackResponse } = require("../controllers/aiController");

describe("API security and auth guard rails", () => {
  test("rejects requests without auth on threat routes", async () => {
    const response = await request(app).get("/api/threats");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Authentication required|Invalid or expired/i);
  });

  test("rejects invalid login payloads", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@example.com" });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Email and password are required|valid Gmail/i);
  });

  test("rate limiting is available on API", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/AI Cyber Threat Intelligence Backend/i);
  });

  test("uses a Gemini-style fallback persona for cybersecurity help", () => {
    const response = fallbackResponse("hello", []);

    expect(response).toMatch(/Gemini|gemini/i);
    expect(response).toMatch(/cybersecurity|security/i);
  });
});
