import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaBell,
  FaBrain,
  FaChartLine,
  FaCheckCircle,
  FaCog,
  FaFileAlt,
  FaRobot,
  FaSearch,
  FaShieldAlt,
  FaSignOutAlt,
  FaTachometerAlt,
  FaBars,
  FaTimes,
  FaSyncAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

import "./ThreatDetection.css";
import { API_BASE_URL, authHeaders } from "../../config";

const getRiskAssessment = (threat) => {
  const text = [
    threat.threatName,
    threat.threatType,
    threat.description,
    threat.indicator,
    threat.ip,
    threat.url,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const storedSeverity = threat.severity || threat.riskLevel;
  const explicitThreat = /phishing|scam|malware|ransomware|brute.?force|credential|exploit|botnet|ddos|intrusion|suspicious|malicious/.test(text);

  if (storedSeverity) {
    const normalizedSeverity = String(storedSeverity).toLowerCase();
    const reason = explicitThreat
      ? "Threat indicators match a known attack pattern"
      : "Risk level supplied by the threat analysis service";
    return {
      level: String(storedSeverity),
      reason,
      score: normalizedSeverity === "critical" ? 95 : normalizedSeverity === "high" ? 85 : normalizedSeverity === "medium" ? 60 : 25,
    };
  }

  if (/failed logins?|password.?spray|brute.?force/.test(text)) {
    return { level: "High", reason: "Repeated authentication failures indicate a brute-force risk", score: 85 };
  }
  if (/phishing|scam|click here|verify your account|credential/.test(text)) {
    return { level: "High", reason: "Message contains phishing or credential-harvesting signals", score: 85 };
  }
  if (/malicious url|phishing url|http:\/\/|shortened url/.test(text)) {
    return { level: "Medium", reason: "URL should be verified before it is opened", score: 60 };
  }
  if (/network|port|connection|traffic|ip address/.test(text)) {
    return { level: "Medium", reason: "Network activity requires connection and reputation review", score: 60 };
  }

  return { level: "Low", reason: "No high-confidence attack pattern was identified", score: 25 };
};

const quickCheckTypes = {
  message: "Suspicious message / email",
  url: "URL",
  ip: "IP address",
  login: "Login activity",
  network: "Network activity",
};

const analyzeQuickIndicator = (type, value) => {
  const text = value.toLowerCase();

  if (type === "message") {
    const urgency = /urgent|blocked|suspended|immediately|expire/.test(text);
    const credentialRequest = /password|verify|login|credential|account/.test(text);
    const link = /https?:\/\/|click here/.test(text);
    if (urgency && (credentialRequest || link)) return { level: "High", score: 90, threat: "Phishing or scam", reason: "Urgency combined with a credential request or link", source: "local-rules" };
    if (urgency || credentialRequest || link) return { level: "Medium", score: 60, threat: "Suspicious message", reason: "The message contains a social-engineering signal", source: "local-rules" };
    return { level: "Low", score: 20, threat: "No clear message threat", reason: "No common phishing signal was found", source: "local-rules" };
  }

  if (type === "url") {
    const suspiciousHost = /@|\.zip|\.top|\.click|\.xyz|\d{1,3}(?:\.\d{1,3}){3}/.test(text);
    const loginPath = /login|signin|verify|account|wallet|secure/.test(text);
    if (suspiciousHost || (/^http:\/\//.test(text) && loginPath)) return { level: "High", score: 88, threat: "Malicious or phishing URL", reason: "The URL combines a risky host or insecure login path", source: "local-rules" };
    if (loginPath || /^http:\/\//.test(text)) return { level: "Medium", score: 58, threat: "URL needs verification", reason: "The destination contains a login or insecure HTTP pattern", source: "local-rules" };
    return { level: "Low", score: 18, threat: "No clear URL threat", reason: "No common malicious URL pattern was found", source: "local-rules" };
  }

  if (type === "ip") {
    const parts = text.split(".").map(Number);
    const valid = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(text) && parts.length === 4 && parts.every((part) => part >= 0 && part <= 255);
    const privateAddress = valid && (parts[0] === 10 || parts[0] === 127 || (parts[0] === 192 && parts[1] === 168) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31));
    if (!valid) return { level: "Low", score: 0, threat: "Invalid IP address", reason: "Enter a valid IPv4 address for reputation checking", source: "local-rules" };
    if (privateAddress) return { level: "Low", score: 12, threat: "Private IP address", reason: "This address is local and cannot be judged by public reputation", source: "local-rules" };
    return { level: "Medium", score: 55, threat: "Suspicious public IP", reason: "Public IP reputation and related activity should be reviewed", source: "local-rules" };
  }

  if (type === "login") {
    const attempts = Number(text.match(/(\d+)\s+(?:failed\s+)?logins?/)?.[1] || 0);
    const minutes = Number(text.match(/(\d+)\s+minutes?/)?.[1] || 0);
    if (/brute.?force|password.?spray|credential.?stuff/.test(text) || attempts >= 10 && minutes > 0 && minutes <= 10) return { level: "High", score: 92, threat: "Brute-force attack", reason: "Repeated failed logins were detected in a short period", source: "local-rules" };
    if (attempts >= 5 || text.includes("failed")) return { level: "Medium", score: 62, threat: "Suspicious login activity", reason: "Authentication failures require account and source-IP review", source: "local-rules" };
    return { level: "Low", score: 15, threat: "Normal login activity", reason: "No repeated-failure pattern was found", source: "local-rules" };
  }

  const connections = Number(text.match(/(\d+)\s+connections?/)?.[1] || 0);
  const port = Number(text.match(/(?:port|:)\s*(\d{1,5})/)?.[1] || 0);
  if ([23, 445, 3389].includes(port) || connections >= 100) return { level: "High", score: 90, threat: "Network attack", reason: "A risky port or unusually high connection volume was detected", source: "local-rules" };
  if (connections >= 20 || /scan|flood|unknown/.test(text)) return { level: "Medium", score: 64, threat: "Abnormal network activity", reason: "Traffic volume or wording indicates further investigation is needed", source: "local-rules" };
  return { level: "Low", score: 18, threat: "Normal network activity", reason: "No risky port or high-volume pattern was found", source: "local-rules" };
};

const normalizeIntelSnapshot = (payload, fallbackSource = "local-rules") => {
  const result = payload || {};
  const risk = String(result.risk || result.level || "Low");
  const score = Number(result.score || 0);
  const message = result.reason || result.message || "No provider result available.";

  return {
    available: Boolean(result.available),
    provider: result.provider || result.source || fallbackSource,
    source: result.source || result.provider || fallbackSource,
    risk: risk,
    level: risk,
    score,
    reason: message,
    checkedAt: new Date().toLocaleTimeString(),
  };
};

const getUnifiedIndicatorAssessment = async (type, value) => {
  const requestType = type === "url" || type === "ip" ? type : "ip";
  const lookupValue = value?.trim() || "8.8.8.8";

  try {
    const response = await fetch(`${API_BASE_URL}/api/intel/check?type=${requestType}&value=${encodeURIComponent(lookupValue)}`, {
      headers: authHeaders(),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return normalizeIntelSnapshot({
        ...data,
        source: data.provider || "intel-provider",
      }, "intel-provider");
    }
  } catch (error) {
    console.warn("Intel provider unavailable, using local fallback:", error);
  }

  const localAssessment = analyzeQuickIndicator(type, value);
  return normalizeIntelSnapshot({
    available: false,
    provider: "local-rules",
    source: "local-rules",
    risk: localAssessment.level,
    score: localAssessment.score,
    reason: localAssessment.reason,
  }, "local-rules");
};

function ThreatDetection() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [severity, setSeverity] = useState("All severities");
  const [quickType, setQuickType] = useState("ip");
  const [quickValue, setQuickValue] = useState("");
  const [quickResult, setQuickResult] = useState(null);
  const [checking, setChecking] = useState(false);

  const [scanMessage, setScanMessage] = useState("");

  const [threatList, setThreatList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [intelStatus, setIntelStatus] = useState({
    available: false,
    provider: "checking",
    risk: "Low",
    score: 0,
    reason: "Checking live intel providers...",
    checkedAt: null,
  });

  // =========================================================
  // GET THREATS FROM MONGODB
  // =========================================================

  const fetchThreats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/threats`,
        { headers: authHeaders() }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch threats");
      }

      const data = await response.json();

      console.log("Threat API response:", data);

      if (data.success) {
        setThreatList(data.threats || []);
      } else {
        throw new Error(
          data.message || "Unable to load threats"
        );
      }
    } catch (err) {
      console.error("Threat fetch error:", err);

      setError(
        "Unable to load threats. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshIntelStatus = async () => {
    const snapshot = await getUnifiedIndicatorAssessment("ip", "8.8.8.8");
    setIntelStatus(snapshot);
  };

  const saveThreatToReports = async (threat) => {
    const normalizedThreat = threat || {};
    const threatName = normalizedThreat.threatName || normalizedThreat.threatType || normalizedThreat.type || "Threat";
    const indicator = normalizedThreat.indicator || normalizedThreat.ip || normalizedThreat.url || normalizedThreat.hash || normalizedThreat.threatName || normalizedThreat.description || "N/A";
    const threatAssessment = getRiskAssessment(normalizedThreat);
    const report = {
      name: `${threatName} Report`,
      type: normalizedThreat.threatType || normalizedThreat.type || "Threat Detection",
      indicator,
      risk: normalizedThreat.severity || normalizedThreat.riskLevel || threatAssessment.level,
      score: threatAssessment.score,
      reason: threatAssessment.reason,
      description: normalizedThreat.description || `${threatName} was found during a threat search.`,
      status: "Completed",
      threatId: normalizedThreat._id || normalizedThreat.id || null,
    };

    try {
      const savedReports = JSON.parse(localStorage.getItem("generatedReports") || "[]");
      const alreadyExists = savedReports.some(
        (item) => item.name === report.name && item.indicator === report.indicator
      );

      if (alreadyExists) {
        return;
      }

      localStorage.setItem("generatedReports", JSON.stringify([report, ...savedReports]));

      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error("Unable to persist report");
      }
    } catch (error) {
      console.error("Failed to save report:", error);
    }
  };

  // =========================================================
  // LOAD THREATS WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => fetchThreats(), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    refreshIntelStatus();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim() || filteredThreats.length === 0) {
      return;
    }

    filteredThreats.slice(0, 4).forEach((threat) => saveThreatToReports(threat));
  }, [searchTerm, severity, threatList]);

  // =========================================================
  // LOGGED-IN USER
  // =========================================================

  let storedUser = {};

  try {
    storedUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch (err) {
    console.error("User data error:", err);
  }

  const userName = storedUser.name || "User";

  const userInitial = userName
    .charAt(0)
    .toUpperCase();

  // =========================================================
  // SEARCH + SEVERITY FILTER
  // =========================================================

  const filteredThreats = threatList.filter(
    (threat) => {
      const searchableText = [
        threat._id,
        threat.threatName,
        threat.threatType,
        threat.description,
        threat.source,
        threat.status,
        threat.severity,
        threat.indicator,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchableText.includes(
          searchTerm.toLowerCase()
        );

      const threatSeverity =
        threat.severity ||
        threat.riskLevel ||
        "";

      const matchesSeverity =
        severity === "All severities" ||
        threatSeverity === severity;

      return (
        matchesSearch &&
        matchesSeverity
      );
    }
  );

  // =========================================================
  // RUN SCAN
  // =========================================================

  const startScan = async () => {
    setScanMessage(
      "Scanning your environment..."
    );

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      await fetchThreats();

      setScanMessage(
        "Scan completed. Threat data has been refreshed."
      );
    } catch (err) {
      console.error("Scan error:", err);

      setScanMessage(
        "Scan failed. Please try again."
      );
    }
  };

  const checkQuickIndicator = async (event) => {
    event.preventDefault();
    if (!quickValue.trim()) return;

    const indicator = quickValue.trim();
    const assessment = analyzeQuickIndicator(quickType, indicator);
    setChecking(true);

    try {
      const unified = await getUnifiedIndicatorAssessment(quickType, indicator);
      const result = {
        ...assessment,
        ...unified,
        threat: assessment.threat,
        saving: true,
      };

      setQuickResult(result);
      setIntelStatus(unified);

      const response = await fetch(`${API_BASE_URL}/api/threats`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          threatName: result.threat,
          threatType: quickCheckTypes[quickType],
          severity: result.level,
          riskScore: result.score,
          riskReason: result.reason,
          indicator,
          description: `${result.reason}. Submitted indicator: ${indicator}`,
          status: result.level === "Low" ? "Investigating" : "Active",
          source: `Quick Threat Check (${result.provider || result.source || "local-rules"})`,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save threat");
      }

      setQuickResult({ ...result, saved: true });
      const report = {
        id: `RPT-${Date.now()}`,
        name: `${result.threat} Report`,
        type: quickCheckTypes[quickType],
        date: new Date().toLocaleDateString(),
        status: "Completed",
        indicator,
        risk: result.level,
        score: result.score,
        reason: result.reason,
      };
      const savedReports = JSON.parse(localStorage.getItem("generatedReports") || "[]");
      localStorage.setItem("generatedReports", JSON.stringify([report, ...savedReports]));
      await fetchThreats();
    } catch (saveError) {
      console.error("Threat save error:", saveError);
      setQuickResult({
        ...assessment,
        saveError: "Calculated, but could not save. Make sure the backend and MongoDB are running.",
      });
    } finally {
      setChecking(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =========================================================
  // OPEN THREAT ANALYSIS
  // =========================================================

  const handleThreatClick = (threat) => {
    /*
     * IMPORTANT:
     * MongoDB uses _id.
     * We keep the original _id and also create id.
     */

    const mongoId =
      threat._id || threat.id;

    if (!mongoId) {
      console.error(
        "Threat ID is missing:",
        threat
      );

      alert(
        "This threat does not have a valid MongoDB ID."
      );

      return;
    }

    const formattedThreat = {
      ...threat,

      // MongoDB ID
      id: String(mongoId),
      _id: String(mongoId),

      // ThreatAnalysis fields
      type:
        threat.threatType ||
        threat.type ||
        threat.threatName ||
        "Unknown Threat",

      indicator:
        threat.indicator ||
        threat.ip ||
        threat.url ||
        threat.hash ||
        threat.threatName ||
        threat.description ||
        "N/A",

      source:
        threat.source ||
        threat.sourceSystem ||
        "AI Threat Detection System",

      detected:
        threat.detectedOn ||
        threat.detectedAt ||
        threat.detected ||
        threat.createdAt ||
        "N/A",

      severity:
        threat.severity ||
        threat.riskLevel ||
        "Low",

      status:
        threat.status ||
        threat.state ||
        "Active",
    };

    console.log(
      "Opening threat analysis:",
      formattedThreat
    );

    navigate("/threat-analysis", {
      state: {
        threat: formattedThreat,
      },
    });
  };

  // =========================================================
  // SUMMARY COUNTS
  // =========================================================

  const criticalCount =
    threatList.filter(
      (threat) =>
        (
          threat.severity ||
          threat.riskLevel ||
          ""
        ).toLowerCase() === "critical"
    ).length;

  const openCount =
    threatList.filter(
      (threat) => {
        const status =
          threat.status ||
          threat.state ||
          "";

        return [
          "Open",
          "Active",
          "Investigating",
        ].includes(status);
      }
    ).length;

  const resolvedCount =
    threatList.filter(
      (threat) => {
        const status =
          threat.status ||
          threat.state ||
          "";

        return (
          status.toLowerCase() ===
          "resolved"
        );
      }
    ).length;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="threat-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`threat-sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >

        <div className="threat-sidebar-logo">

          <FaShieldAlt />

          <span>AI CYBER</span>

          <button
            className="threat-close-sidebar"
            onClick={() =>
              setSidebarOpen(false)
            }
            aria-label="Close navigation"
          >
            <FaTimes />
          </button>

        </div>

        <nav className="threat-sidebar-menu">

          <Link
            className="threat-menu-item"
            to="/dashboard"
          >
            <FaTachometerAlt />
            <span>Dashboard</span>
          </Link>

          <Link
            className="threat-menu-item active"
            to="/threat-detection"
          >
            <FaSearch />
            <span>Threat Detection</span>
          </Link>

          <Link
            className="threat-menu-item"
            to="/alerts"
          >
            <FaBell />
            <span>Alerts</span>
          </Link>

          <Link
            className="threat-menu-item"
            to="/reports"
          >
            <FaFileAlt />
            <span>Reports</span>
          </Link>

          <Link
            className="threat-menu-item"
            to="/ai-assistant"
          >
            <FaRobot />
            <span>AI Assistant</span>
          </Link>

          <Link
            className="threat-menu-item"
            to="/settings"
          >
            <FaCog />
            <span>Settings</span>
          </Link>

        </nav>

        {/* LOGOUT */}

        <div className="threat-sidebar-bottom">

          <button
            className="threat-menu-item"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="threat-main">

        {/* ===================================================
            TOP BAR
        =================================================== */}

        <header className="threat-topbar">

          <button
            className="threat-mobile-menu"
            onClick={() =>
              setSidebarOpen(true)
            }
            aria-label="Open navigation"
          >
            <FaBars />
          </button>

          <div>

            <h1>Threat Detection</h1>

            <p>
              Find and monitor suspicious activity
              across your environment
            </p>

          </div>

          <div className="threat-user">

            {/* NOTIFICATIONS */}

            <Link
              to="/notifications"
              className="threat-notification"
              aria-label="View notifications"
            >
              <FaBell />
              <span />
            </Link>

            {/* PROFILE */}

            <Link
              to="/profile"
              className="threat-user-profile"
            >

              <div className="threat-avatar">
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

        {/* ===================================================
            TOOLBAR
        =================================================== */}

        <section className="detection-toolbar">

          <div className="detection-search">

            <FaSearch />

            <input
              type="search"
              placeholder="Search indicators, systems, or threat IDs"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

          </div>

          <select
            value={severity}
            onChange={(event) =>
              setSeverity(
                event.target.value
              )
            }
          >

            <option>
              All severities
            </option>

            <option>
              Critical
            </option>

            <option>
              High
            </option>

            <option>
              Medium
            </option>

            <option>
              Low
            </option>

          </select>

          <button
            className="scan-button"
            onClick={startScan}
            disabled={loading}
          >

            <FaSyncAlt />

            {loading
              ? "Loading..."
              : "Run scan"}

          </button>

        </section>

        <section className="quick-threat-check">
          <div className="quick-check-heading">
            <span>QUICK THREAT CHECK</span>
            <h2>Analyze an indicator now</h2>
            <p>Check an IP address, URL, message, login event, or network activity.</p>
          </div>

          <div className="intel-status-widget">
            <div className="intel-status-header">
              <div>
                <span className="intel-label">LIVE INTEL STATUS</span>
                <strong>{intelStatus.available ? "Connected" : "Offline"}</strong>
              </div>
              <button type="button" onClick={refreshIntelStatus}>Refresh</button>
            </div>
            <div className="intel-status-row">
              <span>Provider</span>
              <strong>{intelStatus.provider}</strong>
            </div>
            <div className="intel-status-row">
              <span>Risk</span>
              <strong className={`intel-risk ${String(intelStatus.risk || "Low").toLowerCase()}`}>{intelStatus.risk}</strong>
            </div>
            <div className="intel-status-row">
              <span>Confidence</span>
              <strong>{intelStatus.score}%</strong>
            </div>
            <p>{intelStatus.reason}</p>
            <small>Last checked: {intelStatus.checkedAt || "waiting"}</small>
          </div>

          <form className="quick-check-form" onSubmit={checkQuickIndicator}>
            <select
              value={quickType}
              onChange={(event) => {
                setQuickType(event.target.value);
                setQuickResult(null);
              }}
            >
              {Object.entries(quickCheckTypes).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {quickType === "message" ? (
              <textarea
                value={quickValue}
                onChange={(event) => setQuickValue(event.target.value)}
                placeholder="Paste suspicious message or email..."
                rows="2"
              />
            ) : (
              <input
                type={quickType === "url" ? "url" : quickType === "ip" ? "text" : "text"}
                value={quickValue}
                onChange={(event) => setQuickValue(event.target.value)}
                placeholder={quickType === "ip" ? "185.10.20.30" : quickType === "url" ? "http://example.com/login" : quickType === "login" ? "20 failed logins in 5 minutes" : "IP : 445 | TCP | 280 connections"}
              />
            )}

            <button type="submit" disabled={!quickValue.trim() || checking}>
              <FaSearch /> {checking ? "Checking..." : "Check risk"}
            </button>
          </form>

          {quickResult && (
            <div className={`quick-check-result ${quickResult.level.toLowerCase()}`} role="status">
              <strong>{quickResult.threat}</strong>
              <span>{quickResult.level} risk ({quickResult.score}%)</span>
              <small>{quickResult.reason}</small>
              {quickResult.saving && <small>Saving to Detected threats...</small>}
              {quickResult.saved && <small>Saved to Detected threats.</small>}
              {quickResult.saveError && <small>{quickResult.saveError}</small>}
            </div>
          )}
        </section>

        {/* ===================================================
            SCAN MESSAGE
        =================================================== */}

        {scanMessage && (

          <p
            className="scan-message"
            role="status"
          >
            {scanMessage}
          </p>

        )}

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (

          <p
            className="scan-message"
            role="alert"
          >
            {error}
          </p>

        )}

        {/* ===================================================
            SUMMARY
        =================================================== */}

        <section className="detection-summary">

          {/* CRITICAL */}

          <div>

            <span className="summary-icon critical">
              <FaExclamationTriangle />
            </span>

            <p>
              Critical threats

              <strong>
                {criticalCount}
              </strong>
            </p>

          </div>

          {/* OPEN */}

          <div>

            <span className="summary-icon high">
              <FaChartLine />
            </span>

            <p>
              Open investigations

              <strong>
                {openCount}
              </strong>
            </p>

          </div>

          {/* RESOLVED */}

          <div>

            <span className="summary-icon safe">
              <FaCheckCircle />
            </span>

            <p>
              Resolved today

              <strong>
                {resolvedCount}
              </strong>
            </p>

          </div>

          {/* AI */}

          <div>

            <span className="summary-icon ai">
              <FaBrain />
            </span>

            <p>
              AI confidence

              <strong>
                94%
              </strong>
            </p>

          </div>

        </section>

        {/* ===================================================
            THREAT TABLE
        =================================================== */}

        <section className="threat-table-card">

          <div className="threat-card-header">

            <div>

              <h2>
                Detected threats
              </h2>

              <p>
                {loading
                  ? "Loading threats..."
                  : `${filteredThreats.length} results from the latest security scan`}
              </p>

            </div>

            <span className="live-status">

              <i />

              Monitoring active

            </span>

          </div>

          <div className="table-wrap">

            {loading ? (

              <div className="empty-threats">
                Loading threats from MongoDB...
              </div>

            ) : (

              <table>

                <thead>

                  <tr>

                    <th>
                      Threat
                    </th>

                    <th>
                      Indicator
                    </th>

                    <th>
                      Source
                    </th>

                    <th>
                      Detected
                    </th>

                    <th>
                      Severity
                    </th>

                    <th>
                      Risk assessment
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredThreats.map(
                    (threat, index) => {

                      // =====================================
                      // MONGODB ID
                      // =====================================

                      const threatId =
                        threat._id ||
                        threat.id ||
                        `THR-${index + 1}`;

                      // =====================================
                      // THREAT NAME
                      // =====================================

                      const threatType =
                        threat.threatName ||
                        threat.threatType ||
                        threat.type ||
                        "Unknown Threat";

                      // =====================================
                      // INDICATOR
                      // =====================================

                      const indicator =
                        threat.indicator ||
                        threat.ip ||
                        threat.url ||
                        threat.hash ||
                        threat.threatName ||
                        threat.description ||
                        "N/A";

                      // =====================================
                      // SOURCE
                      // =====================================

                      const source =
                        threat.source ||
                        threat.sourceSystem ||
                        "AI Threat Detection System";

                      // =====================================
                      // DETECTED DATE
                      // =====================================

                      const rawDate =
                        threat.detectedOn ||
                        threat.detectedAt ||
                        threat.detected ||
                        threat.createdAt;

                      let detected =
                        "N/A";

                      if (rawDate) {
                        const date =
                          new Date(rawDate);

                        if (
                          !isNaN(
                            date.getTime()
                          )
                        ) {
                          detected =
                            date.toLocaleString();
                        } else {
                          detected =
                            String(rawDate);
                        }
                      }

                      // =====================================
                      // SEVERITY
                      // =====================================

                      const threatSeverity =
                        threat.severity ||
                        threat.riskLevel ||
                        "Unknown";

                      const riskAssessment =
                        getRiskAssessment(threat);

                      // =====================================
                      // STATUS
                      // =====================================

                      const threatStatus =
                        threat.status ||
                        threat.state ||
                        "Active";

                      return (

                        <tr
                          key={String(
                            threatId
                          )}
                          onClick={() =>
                            handleThreatClick(
                              threat
                            )
                          }
                          style={{
                            cursor:
                              "pointer",
                          }}
                        >

                          {/* THREAT */}

                          <td>

                            <strong>
                              {String(
                                threatType
                              )}
                            </strong>

                            <small>
                              {String(
                                threatId
                              )}
                            </small>

                          </td>

                          {/* INDICATOR */}

                          <td className="indicator">

                            {String(
                              indicator
                            )}

                          </td>

                          {/* SOURCE */}

                          <td>

                            {String(
                              source
                            )}

                          </td>

                          {/* DETECTED */}

                          <td>

                            {detected}

                          </td>

                          {/* SEVERITY */}

                          <td>

                            <span
                              className={`threat-severity ${String(
                                threatSeverity
                              ).toLowerCase()}`}
                            >

                              {String(
                                threatSeverity
                              )}

                            </span>

                          </td>

                          {/* RISK ASSESSMENT */}

                          <td className="risk-assessment-cell">

                            <strong className={`risk-score ${riskAssessment.level.toLowerCase()}`}>
                              {riskAssessment.level} risk ({riskAssessment.score}%)
                            </strong>

                            <small>
                              {riskAssessment.reason}
                            </small>

                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={`threat-status ${String(
                                threatStatus
                              )
                                .toLowerCase()
                                .replace(
                                  /\s+/g,
                                  "-"
                                )}`}
                            >

                              {String(
                                threatStatus
                              )}

                            </span>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            )}

            {/* EMPTY */}

            {!loading &&
              filteredThreats.length ===
                0 && (

                <div className="empty-threats">

                  {searchTerm ||
                  severity !==
                    "All severities"
                    ? "No threats match your current filters."
                    : "No threats found in MongoDB."}

                </div>

              )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default ThreatDetection;