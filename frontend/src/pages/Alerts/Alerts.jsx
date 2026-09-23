import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Alerts.css";
import { API_BASE_URL, authHeaders } from "../../config";

function Alerts() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  // =========================================================
  // GET THREATS FROM BACKEND
  // =========================================================

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/threats`,
        { headers: authHeaders() }
      );

      const data = await response.json();

      console.log("Alerts API response:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch alerts"
        );
      }

      setAlerts(data.threats || []);
    } catch (error) {
      console.error("Alerts error:", error);

      setError(
        "Unable to load alerts. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD ALERTS WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => fetchAlerts(), 0);
    return () => clearTimeout(timer);
  }, []);

  // =========================================================
  // FILTER ALERTS
  // =========================================================

  const filteredAlerts =
    filter === "All"
      ? alerts
      : alerts.filter((alert) => {
          const alertSeverity =
            alert.severity ||
            alert.riskLevel ||
            "Low";

          return (
            alertSeverity.toLowerCase() ===
            filter.toLowerCase()
          );
        });

  // =========================================================
  // SUMMARY COUNTS
  // =========================================================

  const totalAlerts = alerts.length;

  const highPriority = alerts.filter((alert) => {
    const severity =
      alert.severity ||
      alert.riskLevel ||
      "";

    return (
      severity.toLowerCase() === "high" ||
      severity.toLowerCase() === "critical"
    );
  }).length;

  // =========================================================
  // VIEW THREAT
  // =========================================================

  const handleViewThreat = (threat) => {
    // MongoDB ID
    const mongoId =
      threat._id ||
      threat.id;

    // Check ID
    if (!mongoId) {
      console.error(
        "Threat ID is missing:",
        threat
      );

      alert(
        "Threat ID is missing. Cannot open Threat Analysis."
      );

      return;
    }

    // =======================================================
    // FORMAT THREAT FOR THREAT ANALYSIS PAGE
    // =======================================================

    const formattedThreat = {
      ...threat,

      // MongoDB ID
      id: String(mongoId),
      _id: String(mongoId),

      // Threat name
      threatName:
        threat.threatName ||
        threat.threatType ||
        threat.type ||
        "Unknown Threat",

      // Threat type
      threatType:
        threat.threatType ||
        threat.type ||
        "Unknown",

      // Indicator
      indicator:
        threat.indicator ||
        threat.ip ||
        threat.url ||
        threat.hash ||
        threat.threatName ||
        threat.description ||
        "N/A",

      // Source
      source:
        threat.source ||
        threat.sourceSystem ||
        "AI Threat Detection System",

      // Detection date
      detected:
        threat.detectedOn ||
        threat.detectedAt ||
        threat.detected ||
        threat.createdAt ||
        "N/A",

      // Severity
      severity:
        threat.severity ||
        threat.riskLevel ||
        "Low",

      // Status
      status:
        threat.status ||
        threat.state ||
        "Active",
    };

    console.log(
      "Opening alert in Threat Analysis:",
      formattedThreat
    );

    // =======================================================
    // GO TO THREAT ANALYSIS
    // =======================================================

    navigate("/threat-analysis", {
      state: {
        threat: formattedThreat,
      },
    });
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleString();
  };

  // =========================================================
  // SEVERITY ICON
  // =========================================================

  const getSeverityIcon = (severity) => {
    const value =
      severity?.toLowerCase() || "low";

    if (value === "critical") {
      return "🔴";
    }

    if (value === "high") {
      return "🔴";
    }

    if (value === "medium") {
      return "🟠";
    }

    return "🟢";
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="alerts-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="alerts-header">

        <div>

          <h1>
            Alerts
          </h1>

          <p>
            View and manage security alerts detected by AI.
          </p>

        </div>

        {/* SUMMARY */}

        <div className="alert-summary">

          {/* TOTAL */}

          <div>

            <strong>
              {totalAlerts}
            </strong>

            <span>
              Total Alerts
            </span>

          </div>

          {/* HIGH PRIORITY */}

          <div>

            <strong>
              {highPriority}
            </strong>

            <span>
              High Priority
            </span>

          </div>

        </div>

      </div>


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="alerts-filter">

        {[
          "All",
          "Critical",
          "High",
          "Medium",
          "Low",
        ].map((item) => (

          <button
            key={item}
            className={
              filter === item
                ? "active-filter"
                : ""
            }
            onClick={() =>
              setFilter(item)
            }
          >
            {item}
          </button>

        ))}

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="alerts-error">
          {error}
        </div>

      )}


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (

        <div className="alerts-container">

          <div className="alerts-empty">

            Loading security alerts...

          </div>

        </div>

      ) : (

        <div className="alerts-container">

          {/* =================================================
              EMPTY
          ================================================= */}

          {filteredAlerts.length === 0 ? (

            <div className="alerts-empty">

              {alerts.length === 0
                ? "No threats have been detected yet."
                : "No threats match your current filter."}

            </div>

          ) : (

            /* ===============================================
               ALERT LIST
               =============================================== */

            filteredAlerts.map((alert) => {

              // MongoDB ID
              const threatId =
                alert._id ||
                alert.id;

              // Threat name
              const threatName =
                alert.threatName ||
                alert.threatType ||
                alert.type ||
                "Unknown Threat";

              // Threat type
              const threatType =
                alert.threatType ||
                alert.type ||
                "Unknown";

              // Source
              const source =
                alert.source ||
                alert.sourceSystem ||
                "AI Threat Detection System";

              // Severity
              const threatSeverity =
                alert.severity ||
                alert.riskLevel ||
                "Low";

              // Date
              const detectedDate =
                alert.detectedOn ||
                alert.detectedAt ||
                alert.detected ||
                alert.createdAt;

              return (

                <div
                  className="alert-row"
                  key={String(
                    threatId ||
                    threatName
                  )}
                >

                  {/* =================================================
                      LEFT SIDE
                  ================================================= */}

                  <div className="alert-left">

                    <div className="alert-icon">

                      {getSeverityIcon(
                        threatSeverity
                      )}

                    </div>

                    <div className="alert-information">

                      <h3>
                        {threatName}
                      </h3>

                      <p>
                        {threatType}
                        {" • "}
                        {source}
                      </p>

                    </div>

                  </div>


                  {/* =================================================
                      TIME
                  ================================================= */}

                  <div className="alert-time">

                    {formatDate(
                      detectedDate
                    )}

                  </div>


                  {/* =================================================
                      SEVERITY
                  ================================================= */}

                  <div
                    className={`severity-badge ${String(
                      threatSeverity
                    ).toLowerCase()}`}
                  >

                    {threatSeverity}

                  </div>


                  {/* =================================================
                      VIEW BUTTON
                  ================================================= */}

                  <button
                    className="view-alert"
                    onClick={() =>
                      handleViewThreat(
                        alert
                      )
                    }
                  >

                    View

                  </button>

                </div>

              );
            })

          )}

        </div>

      )}

    </div>
  );
}

export default Alerts;