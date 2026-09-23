import { useState } from "react";
import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "critical",
      icon: "🚨",
      title: "Critical Threat Detected",
      message:
        "A high-severity threat has been detected in your monitored environment.",
      time: "5 minutes ago",
      unread: true,
    },
    {
      id: 2,
      type: "warning",
      icon: "⚠️",
      title: "Suspicious IP Address",
      message:
        "Suspicious activity was detected from an external IP address.",
      time: "32 minutes ago",
      unread: true,
    },
    {
      id: 3,
      type: "info",
      icon: "🤖",
      title: "AI Threat Analysis Completed",
      message:
        "The latest threat analysis has been completed successfully.",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 4,
      type: "success",
      icon: "📄",
      title: "Security Report Generated",
      message:
        "Weekly Threat Intelligence Report is ready to view.",
      time: "3 hours ago",
      unread: false,
    },
    {
      id: 5,
      type: "warning",
      icon: "🔐",
      title: "Security Alert",
      message:
        "Multiple failed login attempts were detected.",
      time: "Yesterday",
      unread: false,
    },
    {
      id: 6,
      type: "info",
      icon: "📊",
      title: "Threat Detection Updated",
      message:
        "Threat detection data has been updated with new intelligence.",
      time: "Yesterday",
      unread: false,
    },
  ]);

  const [filter, setFilter] = useState("All");

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "Unread") {
      return notification.unread;
    }

    if (filter === "Critical") {
      return notification.type === "critical";
    }

    if (filter === "Warnings") {
      return notification.type === "warning";
    }

    return true;
  });

  return (
    <div className="notifications-page">

      {/* Header */}
      <div className="notifications-header">

        <div>
          <h1>Notifications</h1>

          <p>
            Stay updated with security events and platform activity
          </p>
        </div>

        <button
          className="mark-all-button"
          onClick={markAllAsRead}
        >
          ✓ Mark all as read
        </button>

      </div>


      {/* Summary Cards */}
      <div className="notification-summary">

        <div className="notification-summary-card">
          <div className="summary-icon blue">🔔</div>

          <div>
            <span>Total Notifications</span>
            <strong>{notifications.length}</strong>
          </div>
        </div>


        <div className="notification-summary-card">
          <div className="summary-icon red">🚨</div>

          <div>
            <span>Critical Alerts</span>
            <strong>
              {
                notifications.filter(
                  (n) => n.type === "critical"
                ).length
              }
            </strong>
          </div>
        </div>


        <div className="notification-summary-card">
          <div className="summary-icon orange">⚠️</div>

          <div>
            <span>Warnings</span>
            <strong>
              {
                notifications.filter(
                  (n) => n.type === "warning"
                ).length
              }
            </strong>
          </div>
        </div>


        <div className="notification-summary-card">
          <div className="summary-icon purple">●</div>

          <div>
            <span>Unread</span>
            <strong>{unreadCount}</strong>
          </div>
        </div>

      </div>


      {/* Notifications Section */}
      <div className="notifications-container">

        <div className="notifications-toolbar">

          <div>
            <h2>Recent Notifications</h2>
            <p>
              Security events and important platform updates
            </p>
          </div>


          <div className="notification-filters">

            {["All", "Unread", "Critical", "Warnings"].map(
              (item) => (
                <button
                  key={item}
                  className={
                    filter === item ? "active" : ""
                  }
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              )
            )}

          </div>

        </div>


        {/* Notification List */}
        <div className="notification-list">

          {filteredNotifications.length > 0 ? (

            filteredNotifications.map((notification) => (

              <div
                key={notification.id}
                className={`notification-item ${
                  notification.unread ? "unread" : ""
                }`}
              >

                <div
                  className={`notification-icon ${notification.type}`}
                >
                  {notification.icon}
                </div>


                <div className="notification-content">

                  <div className="notification-title-row">

                    <h3>{notification.title}</h3>

                    {notification.unread && (
                      <span className="unread-badge">
                        NEW
                      </span>
                    )}

                  </div>

                  <p>{notification.message}</p>

                  <span className="notification-time">
                    {notification.time}
                  </span>

                </div>


                <div className="notification-action">

                  {notification.unread ? (
                    <button
                      onClick={() =>
                        markAsRead(notification.id)
                      }
                    >
                      Mark as read
                    </button>
                  ) : (
                    <span className="read-label">
                      ✓ Read
                    </span>
                  )}

                </div>

              </div>

            ))

          ) : (

            <div className="no-notifications">
              <div>🔔</div>
              <h3>No notifications</h3>
              <p>
                There are no notifications matching your filter.
              </p>
            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Notifications;