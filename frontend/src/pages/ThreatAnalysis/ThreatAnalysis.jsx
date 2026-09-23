import { useEffect, useState } from "react";
import {
  FaShieldAlt,
  FaSearch,
  FaBrain,
  FaBell,
  FaFileAlt,
  FaRobot,
  FaCog,
  FaSignOutAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaServer,
  FaSyncAlt,
} from "react-icons/fa";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./ThreatAnalysis.css";
import { API_BASE_URL, authHeaders } from "../../config";

const getRecommendedActions = (threat, source, indicator) => {
  const threatText = [
    threat.threatName,
    threat.threatType,
    threat.type,
    threat.description,
    indicator,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/phishing|scam|message|email/.test(threatText)) {
    return [
      ["Quarantine the message", `Remove the message from mailboxes and report it to the ${source} security team.`],
      ["Block the sender and URL", "Add the sender address and linked domains to your mail security block list."],
      ["Warn affected users", "Notify recipients and ask them to change credentials if they interacted with the message."],
      ["Review mail activity", "Search for similar messages, clicks, and sign-in events across the environment."],
    ];
  }

  if (/url|phishing|malicious.*link|website/.test(threatText)) {
    return [
      ["Block the destination", `Add ${indicator} to the secure web gateway and DNS block lists.`],
      ["Inspect redirect behavior", "Capture the URL safely and check redirects, certificates, and domain age."],
      ["Search proxy logs", "Identify users or systems that requested the URL and review downloaded content."],
      ["Reset exposed credentials", "Force a password reset and revoke active sessions for users who entered credentials."],
    ];
  }

  if (/ip address|suspicious ip|network attack|network activity|ddos|port|traffic/.test(threatText)) {
    return [
      ["Block the source indicator", `Block ${indicator} at the firewall, WAF, or edge control where appropriate.`],
      ["Review connection logs", `Search ${source} logs for source ports, destinations, protocols, and repeated connections.`],
      ["Check exposed services", "Confirm that vulnerable ports and unnecessary internet-facing services are disabled."],
      ["Monitor for recurrence", "Create an alert for repeated traffic from the indicator and preserve relevant logs."],
    ];
  }

  if (/login|brute.?force|password|credential/.test(threatText)) {
    return [
      ["Lock or protect the account", "Temporarily lock the targeted account and enforce multi-factor authentication."],
      ["Block the source IP", "Rate-limit or block the originating address after confirming it is not a trusted source."],
      ["Review authentication logs", "Check successful logins, affected accounts, locations, and password-spray patterns."],
      ["Rotate exposed credentials", "Reset affected passwords and revoke active sessions or access tokens."],
    ];
  }

  if (/malware|ransomware|trojan|virus|infected/.test(threatText)) {
    return [
      ["Isolate the endpoint", "Disconnect the affected system from the network while preserving its current state."],
      ["Collect forensic evidence", "Capture processes, persistence locations, hashes, and relevant endpoint logs."],
      ["Remove the payload", "Run an updated endpoint scan and remove malicious files only after evidence is collected."],
      ["Restore and monitor", "Patch the system, restore from a trusted backup, and watch for reinfection."],
    ];
  }

  return [
    ["Contain the affected asset", `Restrict ${source} access until the indicator and its impact are confirmed.`],
    ["Validate the finding", "Correlate this event with endpoint, identity, and network logs."],
    ["Record the incident", "Preserve evidence, timestamps, and affected assets for the incident timeline."],
    ["Continue monitoring", "Create a follow-up alert and review the system for related activity."],
  ];
};

function ThreatAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();

  // Threat passed from Threat Detection
  const passedThreat = location.state?.threat;

  // State
  const [threat, setThreat] = useState(passedThreat || null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState("");
  const [analysisMessage, setAnalysisMessage] = useState("");
  const [aiResult, setAiResult] = useState(
    passedThreat?.aiResult || "Analysis not performed yet."
  );

  // =========================================================
  // GET THREAT ID
  // =========================================================

  const threatId =
    passedThreat?._id ||
    passedThreat?.id ||
    "";

  // =========================================================
  // FETCH THREAT FROM BACKEND
  // =========================================================

  const fetchThreat = async () => {
    if (!threatId) {
      setError(
        "No threat selected. Please open a threat from Threat Detection."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/threats/${encodeURIComponent(
          threatId
        )}`,
        { headers: authHeaders() }
      );

      const data = await response.json();

      console.log("Threat analysis response:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load threat"
        );
      }

      setThreat(data.threat);
    } catch (err) {
      console.error(
        "Threat analysis fetch error:",
        err
      );

      setError(
        err.message ||
          "Unable to load threat details."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD THREAT
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      if (threatId) {
        fetchThreat();
      } else {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [threatId]);

  // =========================================================
  // USER
  // =========================================================

  let storedUser = {};

  try {
    storedUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch (err) {
    console.error(
      "Invalid user data:",
      err
    );
  }

  const userName =
    storedUser.name || "User";

  const userInitial =
    userName.charAt(0).toUpperCase();

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =========================================================
  // RE-ANALYZE
  // =========================================================

  const handleReanalysis = async () => {
    if (!threatId) {
      setAnalysisMessage(
        "Threat ID is missing."
      );
      return;
    }

    try {
      setReanalyzing(true);
      setAnalysisMessage("");
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/threats/${encodeURIComponent(
          threatId
        )}/reanalyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
        }
      );

      const data = await response.json();

      console.log(
        "AI re-analysis response:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "AI re-analysis failed"
        );
      }

      // Update threat with backend result
      if (data.threat) {
        setThreat(data.threat);
      }

      setAiResult(
        data.aiResult ||
          "Analysis completed successfully."
      );

      setAnalysisMessage(
        `AI analysis completed. Result: ${
          data.aiResult || "Completed"
        }`
      );
    } catch (err) {
      console.error(
        "Re-analysis error:",
        err
      );

      let message =
        err.message ||
        "Unable to re-analyze threat.";

      if (
        message.includes("ECONNREFUSED")
      ) {
        message =
          "Python AI service is not running. Start the Python AI server on port 5001.";
      }

      setAnalysisMessage(
        `Re-analysis failed: ${message}`
      );
    } finally {
      setReanalyzing(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="analysis-page">
        <div className="analysis-loading">
          <FaSyncAlt className="loading-icon" />
          <h2>Loading Threat Analysis...</h2>
          <p>
            Fetching threat information from
            the backend.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !threat) {
    return (
      <div className="analysis-page">
        <div className="analysis-error">
          <FaExclamationTriangle />

          <h2>
            Unable to Load Threat
          </h2>

          <p>
            {error ||
              "No threat was selected."}
          </p>

          <button
            onClick={() =>
              navigate(
                "/threat-detection"
              )
            }
          >
            Back to Threat Detection
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // THREAT DATA
  // =========================================================

  const currentSeverity =
    threat.severity ||
    threat.riskLevel ||
    "Low";

  const currentStatus =
    threat.status ||
    threat.state ||
    "Active";

  const threatName =
    threat.threatName ||
    threat.threatType ||
    threat.type ||
    "Unknown Threat";

  const threatType =
    threat.threatType ||
    threat.type ||
    "Unknown";

  const indicator =
    threat.indicator ||
    threat.ip ||
    threat.url ||
    threat.hash ||
    threat.threatName ||
    threat.description ||
    "N/A";

  const source =
    threat.source ||
    threat.sourceSystem ||
    "AI Threat Detection System";

  const detectedValue =
    threat.detectedOn ||
    threat.detectedAt ||
    threat.createdAt;

  const detected = detectedValue
    ? new Date(
        detectedValue
      ).toLocaleString()
    : "N/A";

  const mongoThreatId = String(
    threat._id ||
      threat.id ||
      ""
  );

  // =========================================================
  // RISK SCORE
  // =========================================================

  let riskScore;

  if (threat.riskScore) {
    riskScore = Number(threat.riskScore);
  } else if (currentSeverity === "Critical") {
    riskScore = 95;
  } else if (currentSeverity === "High") {
    riskScore = 89;
  } else if (currentSeverity === "Medium") {
    riskScore = 65;
  } else {
    riskScore = 35;
  }

  const riskLabel =
    currentSeverity === "Critical"
      ? "Critical Risk Threat"
      : currentSeverity === "High"
      ? "High Risk Threat"
      : currentSeverity === "Medium"
      ? "Medium Risk Threat"
      : "Low Risk Threat";

  const confidence = Math.min(
    riskScore + 7,
    99
  );

  const recommendedActions = getRecommendedActions(
    threat,
    source,
    indicator
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="analysis-page">

      {/* SIDEBAR */}

      <aside className="analysis-sidebar">

        <div className="analysis-logo">
          <FaShieldAlt />
          <span>AI CYBER</span>
        </div>

        <nav className="analysis-menu">

          <Link to="/dashboard">
            <FaShieldAlt />
            Dashboard
          </Link>

          <Link to="/threat-detection">
            <FaSearch />
            Threat Detection
          </Link>

          <Link to="/alerts">
            <FaBell />
            Alerts
          </Link>

          <Link to="/reports">
            <FaFileAlt />
            Reports
          </Link>

          <Link to="/ai-assistant">
            <FaRobot />
            AI Assistant
          </Link>

          <Link to="/settings">
            <FaCog />
            Settings
          </Link>

        </nav>

        <button
          className="analysis-logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          Logout
        </button>

      </aside>

      {/* MAIN */}

      <main className="analysis-main">

        {/* HEADER */}

        <header className="analysis-header">

          <div>
            <h1>
              Threat Analysis
            </h1>

            <p>
              Analyze detected threats using
              artificial intelligence.
            </p>
          </div>

          <div className="analysis-user">

            <Link
              to="/notifications"
              className="analysis-notification"
            >
              <FaBell />
            </Link>

            <Link
              to="/profile"
              className="analysis-user-profile"
            >
              <div className="analysis-avatar">
                {userInitial}
              </div>

              <div>
                <strong>
                  {userName}
                </strong>

                <small>
                  Security Analyst
                </small>
              </div>
            </Link>

          </div>

        </header>

        {/* SELECTED THREAT */}

        <section className="analysis-selector">

          <div>

            <span className="selector-label">
              SELECTED THREAT
            </span>

            <h2>
              {threatName}
            </h2>

            <p>
              {indicator}
            </p>

          </div>

          <div className="threat-status">
            <span>●</span>
            {currentStatus}
          </div>

        </section>

        {/* ANALYSIS GRID */}

        <section className="analysis-grid">

          {/* THREAT DETAILS */}

          <div className="analysis-card">

            <div className="analysis-card-title">
              <FaShieldAlt />

              <h3>
                Threat Details
              </h3>
            </div>

            <div className="details-list">

              <div className="detail-item">
                <span>
                  Threat Name
                </span>

                <strong>
                  {threatName}
                </strong>
              </div>

              <div className="detail-item">
                <span>
                  Threat Type
                </span>

                <strong>
                  {threatType}
                </strong>
              </div>

              <div className="detail-item">
                <span>
                  Threat Indicator
                </span>

                <strong>
                  {indicator}
                </strong>
              </div>

              <div className="detail-item">
                <span>
                  Severity
                </span>

                <strong className="severity-high">
                  {currentSeverity}
                </strong>
              </div>

              <div className="detail-item">
                <span>
                  Detected On
                </span>

                <strong>
                  {detected}
                </strong>
              </div>

              <div className="detail-item">
                <span>
                  Source
                </span>

                <strong>
                  {source}
                </strong>
              </div>

              <div className="detail-item">
                <span>
                  Status
                </span>

                <strong className="status-active">
                  {currentStatus}
                </strong>
              </div>

            </div>

          </div>

          {/* AI ANALYSIS */}

          <div className="analysis-card ai-analysis-card">

            <div className="analysis-card-title">
              <FaBrain />

              <h3>
                AI Analysis
              </h3>
            </div>

            <div className="ai-risk-box">

              <div className="risk-circle">
                <strong>
                  {riskScore}
                </strong>

                <span>
                  Risk
                </span>
              </div>

              <div>

                <span className="risk-label">
                  AI RISK SCORE
                </span>

                <h3>
                  {riskLabel}
                </h3>

                <p>
                  The AI model has analyzed this
                  security event and identified a{" "}
                  {currentSeverity.toLowerCase()}{" "}
                  risk level.
                </p>

              </div>

            </div>

            <div className="analysis-description">

              <strong>
                Threat Description
              </strong>

              <p>
                {threat.description ||
                  "No additional description is available for this threat."}
              </p>

              <strong>
                Latest AI Result
              </strong>

              <p>
                {aiResult}
              </p>

            </div>

            <div className="ai-findings">

              <div>
                <FaExclamationTriangle />
                <span>
                  Suspicious activity detected
                </span>
              </div>

              <div>
                <FaExclamationTriangle />
                <span>
                  Potential security risk identified
                </span>
              </div>

              <div>
                <FaCheckCircle />
                <span>
                  Threat analyzed by AI system
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* BOTTOM */}

        <section className="analysis-bottom-grid">

          {/* RECOMMENDED ACTIONS */}

          <div className="analysis-card actions-card">

            <div className="analysis-card-title">
              <FaCheckCircle />

              <h3>
                Recommended Actions
              </h3>
            </div>

            <div className="action-list">

              {recommendedActions.map(([title, description], index) => (
                <div className="action-item" key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>

                  <div>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </div>
                </div>
              ))}

            </div>

          </div>

          {/* THREAT INFORMATION */}

          <div className="analysis-card">

            <div className="analysis-card-title">

              <FaServer />

              <h3>
                Threat Information
              </h3>

            </div>

            <div className="info-grid">

              <div>
                <span>
                  Threat ID
                </span>

                <strong>
                  {mongoThreatId || "N/A"}
                </strong>
              </div>

              <div>
                <span>
                  Threat Type
                </span>

                <strong>
                  {threatType}
                </strong>
              </div>

              <div>
                <span>
                  Indicator
                </span>

                <strong>
                  {indicator}
                </strong>
              </div>

              <div>
                <span>
                  Confidence
                </span>

                <strong>
                  {confidence}%
                </strong>
              </div>

              <div>
                <span>
                  Risk Score
                </span>

                <strong>
                  {riskScore}%
                </strong>
              </div>

              <div>
                <span>
                  Status
                </span>

                <strong>
                  {currentStatus}
                </strong>
              </div>

              <div>
                <span>
                  AI Result
                </span>

                <strong>
                  {threat.aiResult || aiResult}
                </strong>
              </div>

              <div>
                <span>
                  Detection Reason
                </span>

                <strong>
                  {threat.riskReason || "Reviewed using threat type, indicator, and severity."}
                </strong>
              </div>

            </div>

            <button
              className="reanalyze-button"
              onClick={handleReanalysis}
              disabled={reanalyzing}
            >

              <FaBrain />

              {reanalyzing
                ? "Analyzing..."
                : "Run AI Re-analysis"}

            </button>

            {analysisMessage && (
              <p
                className="analysis-message"
                role="status"
              >
                {analysisMessage}
              </p>
            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default ThreatAnalysis;