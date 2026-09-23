import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaShieldAlt,
  FaTachometerAlt,
  FaSearch,
  FaBrain,
  FaBell,
  FaFileAlt,
  FaRobot,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaArrowUp,
  FaExclamationTriangle,
  FaServer,
} from "react-icons/fa";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import "./Dashboard.css";
import { API_BASE_URL } from "../../config";

const threatData7Days = [
  { day: "Mon", threats: 25 },
  { day: "Tue", threats: 42 },
  { day: "Wed", threats: 38 },
  { day: "Thu", threats: 55 },
  { day: "Fri", threats: 68 },
  { day: "Sat", threats: 47 },
  { day: "Sun", threats: 63 },
];

const threatData30Days = [
  { day: "Week 1", threats: 145 },
  { day: "Week 2", threats: 182 },
  { day: "Week 3", threats: 165 },
  { day: "Week 4", threats: 213 },
];

const distributionData7Days = [
  { name: "Malware", value: 35 },
  { name: "Phishing", value: 25 },
  { name: "Intrusion", value: 20 },
  { name: "DDoS", value: 10 },
  { name: "Other", value: 10 },
];

const distributionData30Days = [
  { name: "Malware", value: 28 },
  { name: "Phishing", value: 30 },
  { name: "Intrusion", value: 18 },
  { name: "DDoS", value: 14 },
  { name: "Other", value: 10 },
];

const COLORS = [
  "#168ee8",
  "#19c7b0",
  "#f3b63f",
  "#e85b48",
  "#8d63d2",
];

function Dashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [chartRange, setChartRange] = useState("Last 7 Days");
  const [threatStats, setThreatStats] = useState({
    total: 0,
    active: 0,
    accuracy: 0,
    riskScore: 0,
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/threats`)
      .then((response) => response.json())
      .then((data) => {
        const threats = data.success ? data.threats || [] : [];
        const active = threats.filter((threat) => ["Active", "Investigating"].includes(threat.status || threat.state)).length;
        const resolved = threats.filter((threat) => (threat.status || threat.state) === "Resolved").length;
        const scoredThreats = threats.filter((threat) => Number(threat.riskScore) > 0);
        const averageRisk = scoredThreats.length
          ? Math.round(scoredThreats.reduce((sum, threat) => sum + Number(threat.riskScore), 0) / scoredThreats.length)
          : 0;

        setThreatStats({
          total: threats.length,
          active,
          accuracy: threats.length ? Math.round(((threats.length - resolved) / threats.length) * 100) : 0,
          riskScore: averageRisk,
        });
      })
      .catch((error) => console.error("Dashboard threat stats error:", error));
  }, []);

  // =========================================================
  // GET LOGGED-IN USER
  // =========================================================

  const storedUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userName = storedUser.name || "User";
  const profilePhoto = storedUser.profilePhoto || "";

  const userInitial = userName
    .charAt(0)
    .toUpperCase();

  // =========================================================
  // CHART DATA
  // =========================================================

  const chartData =
    chartRange === "Last 7 Days"
      ? threatData7Days
      : threatData30Days;

  const distributionData =
    chartRange === "Last 7 Days"
      ? distributionData7Days
      : distributionData30Days;

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="dashboard-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`dashboard-sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >

        <div className="sidebar-logo">

          <FaShieldAlt />

          <span>AI CYBER</span>

          <button
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>

        </div>

        <div className="sidebar-menu">

          <Link
            className="menu-item active"
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTachometerAlt />
            <span>Dashboard</span>
          </Link>

          <Link
            className="menu-item"
            to="/threat-detection"
            onClick={() => setSidebarOpen(false)}
          >
            <FaSearch />
            <span>Threat Detection</span>
          </Link>

          <Link
            className="menu-item"
            to="/alerts"
            onClick={() => setSidebarOpen(false)}
          >
            <FaBell />
            <span>Alerts</span>
          </Link>

          <Link
            className="menu-item"
            to="/reports"
            onClick={() => setSidebarOpen(false)}
          >
            <FaFileAlt />
            <span>Reports</span>
          </Link>

          <Link
            className="menu-item"
            to="/ai-assistant"
            onClick={() => setSidebarOpen(false)}
          >
            <FaRobot />
            <span>AI Assistant</span>
          </Link>

          <Link
            className="menu-item"
            to="/settings"
            onClick={() => setSidebarOpen(false)}
          >
            <FaCog />
            <span>Settings</span>
          </Link>

        </div>

        <div className="sidebar-bottom">

          <button
            className="menu-item logout"
            onClick={() => setShowLogoutModal(true)}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="dashboard-main">

        {/* TOP BAR */}

        <header className="dashboard-topbar">

          <button
            className="mobile-menu"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars />
          </button>

          <div>

            <h1>Dashboard</h1>

            <p>
              Overview of your security environment
            </p>

          </div>

          <div className="topbar-user">

            <Link
              to="/notifications"
              className="notification-button"
              title="Notifications"
            >
              <FaBell />
              <span></span>
            </Link>

            <Link
              to="/profile"
              className="user-profile-link"
            >

              <div className="user-avatar">
                {profilePhoto ? <img src={profilePhoto} alt="Profile" /> : userInitial}
              </div>

              <div className="user-info">

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

        {/* =====================================================
            STAT CARDS
        ===================================================== */}

        <section className="stat-grid">

          <div
            className="stat-card blue"
            onClick={() =>
              navigate("/threat-detection")
            }
          >

            <span className="stat-label">
              Total Threats
            </span>

            <h2>{threatStats.total}</h2>

            <p>
              <FaArrowUp />
              12% from last 24h
            </p>

          </div>

          <div
            className="stat-card red"
            onClick={() =>
              navigate("/alerts")
            }
          >

            <span className="stat-label">
              Active Alerts
            </span>

            <h2>{threatStats.active}</h2>

            <p>
              <FaArrowUp />
              8% from last 24h
            </p>

          </div>

          <div
            className="stat-card green"
            onClick={() =>
              navigate("/threat-analysis")
            }
          >

            <span className="stat-label">
              Detection Accuracy
            </span>

            <h2>{threatStats.accuracy}%</h2>

            <p>
              <FaArrowUp />
              5% from last 24h
            </p>

          </div>

          <div
            className="stat-card purple"
            onClick={() =>
              navigate("/threat-analysis")
            }
          >

            <div className="stat-top">

              <span>
                AI Risk Score
              </span>

              <FaBrain />

            </div>

            <h2>{threatStats.riskScore}%</h2>

            <p>
              <FaArrowUp />
              6% from last 24h
            </p>

          </div>

        </section>

        {/* =====================================================
            CHARTS
        ===================================================== */}

        <section className="chart-grid">

          {/* THREAT CHART */}

          <div className="dashboard-card threat-chart-card">

            <div className="card-header">

              <div>

                <h3>
                  Threats Over Time
                </h3>

                <p>
                  Detected threats during the{" "}
                  {chartRange === "Last 7 Days"
                    ? "last 7 days"
                    : "last 30 days"}
                </p>

              </div>

              <select
                value={chartRange}
                onChange={(e) =>
                  setChartRange(e.target.value)
                }
              >

                <option>
                  Last 7 Days
                </option>

                <option>
                  Last 30 Days
                </option>

              </select>

            </div>

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={chartData}
                >

                  <CartesianGrid
                    stroke="#18283a"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    stroke="#63748a"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#63748a"
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#0b1422",
                      border: "1px solid #20344a",
                      color: "#fff",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="threats"
                    stroke="#18b9f5"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#18b9f5",
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* DISTRIBUTION */}

          <div className="dashboard-card distribution-card">

            <div className="card-header">

              <div>

                <h3>
                  Threat Distribution
                </h3>

                <p>
                  Types of detected threats
                </p>

              </div>

            </div>

            <div className="pie-area">

              <ResponsiveContainer
                width="55%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={distributionData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={82}
                    paddingAngle={2}
                  >

                    {distributionData.map(
                      (item, index) => (
                        <Cell
                          key={item.name}
                          fill={
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                        />
                      )
                    )}

                  </Pie>

                </PieChart>

              </ResponsiveContainer>

              <div className="distribution-list">

                {distributionData.map(
                  (item, index) => (

                    <div
                      className="distribution-item"
                      key={item.name}
                    >

                      <span>

                        <i
                          style={{
                            background:
                              COLORS[
                                index %
                                  COLORS.length
                              ],
                          }}
                        ></i>

                        {item.name}

                      </span>

                      <strong>
                        {item.value}%
                      </strong>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            BOTTOM GRID
        ===================================================== */}

        <section className="bottom-grid">

          {/* RECENT ALERTS */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <h3>
                  Recent Alerts
                </h3>

                <p>
                  Latest security incidents
                </p>

              </div>

              <Link to="/alerts">
                View All
              </Link>

            </div>

            <div className="alert-list">

              <div
                className="alert-row"
                onClick={() =>
                  navigate("/alerts")
                }
              >

                <div className="alert-icon critical">

                  <FaExclamationTriangle />

                </div>

                <div>

                  <strong>
                    Malware Detected
                  </strong>

                  <small>
                    Server-01 • 10:24 AM
                  </small>

                </div>

                <span className="severity high">
                  High
                </span>

              </div>

              <div
                className="alert-row"
                onClick={() =>
                  navigate("/alerts")
                }
              >

                <div className="alert-icon critical">

                  <FaExclamationTriangle />

                </div>

                <div>

                  <strong>
                    Unauthorized Access Attempt
                  </strong>

                  <small>
                    Workstation-23 • 10:15 AM
                  </small>

                </div>

                <span className="severity high">
                  High
                </span>

              </div>

              <div
                className="alert-row"
                onClick={() =>
                  navigate("/alerts")
                }
              >

                <div className="alert-icon warning">

                  <FaExclamationTriangle />

                </div>

                <div>

                  <strong>
                    Suspicious Login Detected
                  </strong>

                  <small>
                    User: admin • 09:47 AM
                  </small>

                </div>

                <span className="severity medium">
                  Medium
                </span>

              </div>

            </div>

          </div>

          {/* TOP AFFECTED SYSTEMS */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <h3>
                  Top Affected Systems
                </h3>

                <p>
                  Systems with highest threat activity
                </p>

              </div>

              <Link to="/threat-analysis">
                View All
              </Link>

            </div>

            <div className="systems-list">

              <div
                className="system-row"
                onClick={() =>
                  navigate("/threat-analysis")
                }
              >

                <div className="system-icon">
                  <FaServer />
                </div>

                <div>

                  <strong>
                    Server-01
                  </strong>

                  <small>
                    Critical system
                  </small>

                </div>

                <b>
                  12 Threats
                </b>

              </div>

              <div
                className="system-row"
                onClick={() =>
                  navigate("/threat-analysis")
                }
              >

                <div className="system-icon">
                  <FaServer />
                </div>

                <div>

                  <strong>
                    Workstation-23
                  </strong>

                  <small>
                    High risk
                  </small>

                </div>

                <b>
                  9 Threats
                </b>

              </div>

              <div
                className="system-row"
                onClick={() =>
                  navigate("/threat-analysis")
                }
              >

                <div className="system-icon">
                  <FaServer />
                </div>

                <div>

                  <strong>
                    Server-02
                  </strong>

                  <small>
                    Moderate risk
                  </small>

                </div>

                <b>
                  7 Threats
                </b>

              </div>

            </div>

          </div>

          {/* AI RECOMMENDATION */}

          <div className="dashboard-card ai-card">

            <div className="ai-icon">

              <FaRobot />

            </div>

            <h3>
              AI Recommendation
            </h3>

            <p>
              We recommend updating vulnerable
              software on{" "}
              <strong>
                Server-02
              </strong>{" "}
              to reduce the current security risk.
            </p>

            <button
              onClick={() =>
                navigate("/ai-assistant")
              }
            >
              View Details →
            </button>

          </div>

        </section>

      </main>

      {/* =====================================================
          LOGOUT MODAL
      ===================================================== */}

      {showLogoutModal && (

        <div
          className="logout-overlay"
          onClick={() =>
            setShowLogoutModal(false)
          }
        >

          <div
            className="logout-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="logout-warning">

              <FaSignOutAlt />

            </div>

            <h2>
              Confirm Logout
            </h2>

            <p>
              Are you sure you want to logout
              from{" "}
              <strong>
                AI CYBER
              </strong>
              ?
            </p>

            <div className="logout-actions">

              <button
                className="cancel-btn"
                onClick={() =>
                  setShowLogoutModal(false)
                }
              >
                Cancel
              </button>

              <button
                className="confirm-logout-btn"
                onClick={handleLogout}
              >

                <FaSignOutAlt />

                Confirm Logout

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Dashboard;