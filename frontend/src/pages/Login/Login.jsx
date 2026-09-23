import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import "./Login.css";
import { API_BASE_URL } from "../../config";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => new URLSearchParams(window.location.search).get("googleError") || "");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");

    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(normalizedEmail)) {
      setError("Please use a valid Gmail address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password");
        return;
      }

      // Store authentication data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Go to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Left Side */}
      <div className="login-left">

        <Link to="/" className="login-logo">
          <FaShieldAlt />
          <span>AI CYBER</span>
        </Link>

        <div className="login-intro">

          <div className="login-badge">
            <span></span>
            SECURE ACCESS
          </div>

          <h1>
            Protect Your
            <strong> Digital World.</strong>
          </h1>

          <p>
            Access your AI-powered cyber threat intelligence
            platform and monitor your security environment.
          </p>

          <div className="security-points">

            <div>
              <span>✓</span>
              AI-powered threat detection
            </div>

            <div>
              <span>✓</span>
              Real-time security monitoring
            </div>

            <div>
              <span>✓</span>
              Intelligent threat analysis
            </div>

          </div>
        </div>

      </div>

      {/* Right Side */}
      <div className="login-right">

        <div className="login-card">

          <div className="mobile-logo">
            <FaShieldAlt />
            AI CYBER
          </div>

          <h2>Welcome Back</h2>

          <p className="login-subtitle">
            Sign in to your security dashboard
          </p>

          <form onSubmit={handleLogin}>

            {/* Email */}
            <div className="input-group">

              <label>Email Address</label>

              <div className="input-wrapper">
                <FaEnvelope />

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

            </div>

            {/* Password */}
            <div className="input-group">

              <div className="password-label">
                <label>Password</label>

                <a href="#forgot">
                  Forgot password?
                </a>
              </div>

              <div className="input-wrapper">

                <FaLock />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="eye-button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>

              </div>

            </div>

            {/* Error */}
            {error && (
              <div className="login-error">
                ⚠️ {error}
              </div>
            )}

            {/* Remember */}
            <label className="remember">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            {/* Login */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
              {!loading && <span>→</span>}
            </button>

          </form>

          <p className="signup-text">
            Don't have an account?
            <Link to="/signup"> Create an account</Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;