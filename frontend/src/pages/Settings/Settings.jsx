import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";
import { API_BASE_URL } from "../../config";

function Settings() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("General");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const savedSettings = JSON.parse(localStorage.getItem("platformSettings") || "{}");

  const [platformName, setPlatformName] = useState(savedSettings.platformName || "AI Cyber Threat Intelligence");
  const [defaultDashboard, setDefaultDashboard] = useState(savedSettings.defaultDashboard || "Dashboard");
  const [timeZone, setTimeZone] = useState(savedSettings.timeZone || "IST");
  const [fullName, setFullName] = useState(storedUser.name || "Akshatha");
  const [email, setEmail] = useState(storedUser.email || "");
  const [profilePhoto, setProfilePhoto] = useState(storedUser.profilePhoto || "");
  const [theme, setTheme] = useState(savedSettings.theme || "dark");
  const [saveMessage, setSaveMessage] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [sessionsOpen, setSessionsOpen] = useState(false);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  const [settings, setSettings] = useState({
    emailAlerts: savedSettings.emailAlerts ?? true,
    criticalAlerts: savedSettings.criticalAlerts ?? true,
    weeklyReports: savedSettings.weeklyReports ?? true,
    loginNotifications: savedSettings.loginNotifications ?? true,
    twoFactor: savedSettings.twoFactor || false,
  });

  const toggleSetting = (name) => {
    setSettings((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
    const nextSettings = { ...settings, [name]: !settings[name] };
    localStorage.setItem("platformSettings", JSON.stringify({ ...savedSettings, ...nextSettings }));
  };

  const saveGeneralSettings = () => {
    localStorage.setItem("platformSettings", JSON.stringify({ ...savedSettings, platformName, defaultDashboard, timeZone, theme, ...settings }));
    setSaveMessage("General settings saved.");
  };

  const saveAccountSettings = () => {
    const user = { ...storedUser, name: fullName.trim() || "User", email: email.trim(), profilePhoto };
    localStorage.setItem("user", JSON.stringify(user));
    setSaveMessage("Account changes saved.");
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSaveMessage("Please choose an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const photo = reader.result;
      setProfilePhoto(photo);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...user, profilePhoto: photo }));
      setSaveMessage("Profile photo updated.");
    };
    reader.readAsDataURL(file);
  };

  const changeTheme = (nextTheme) => {
    setTheme(nextTheme);
    localStorage.setItem("platformSettings", JSON.stringify({ ...savedSettings, theme: nextTheme }));
    document.body.dataset.theme = nextTheme;
    setSaveMessage(`${nextTheme === "dark" ? "Dark" : "Light"} theme selected.`);
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to change password");
      }

      setPasswordMessage(data.message);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordMessage(error.message);
    }
  };

  const handleSignOutCurrentDevice = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const sections = [
    { name: "General", icon: "⚙️" },
    { name: "Account", icon: "👤" },
    { name: "Notifications", icon: "🔔" },
    { name: "Security", icon: "🔐" },
    { name: "Appearance", icon: "🎨" },
  ];

  return (
    <div className="settings-page">

      {/* Header */}
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>
            Manage your platform preferences and security settings
          </p>
        </div>
      </div>

      <div className="settings-layout">

        {/* Settings Navigation */}
        <div className="settings-sidebar">

          {sections.map((section) => (
            <button
              key={section.name}
              className={`settings-nav-item ${
                activeSection === section.name ? "active" : ""
              }`}
              onClick={() => setActiveSection(section.name)}
            >
              <span>{section.icon}</span>
              {section.name}
            </button>
          ))}

        </div>

        {/* Settings Content */}
        <div className="settings-content">

          {/* GENERAL */}
          {activeSection === "General" && (
            <>
              <div className="settings-section-header">
                <h2>General Settings</h2>
                <p>
                  Configure general preferences for your platform.
                </p>
              </div>

              <div className="setting-card">

                <div className="setting-row">
                  <div>
                    <h3>Platform Name</h3>
                    <p>
                      Name displayed throughout the platform.
                    </p>
                  </div>

                  <input
                    className="settings-input"
                    value={platformName}
                    onChange={(event) => setPlatformName(event.target.value)}
                  />
                </div>

                <div className="setting-row">
                  <div>
                    <h3>Default Dashboard</h3>
                    <p>
                      Page displayed after successful login.
                    </p>
                  </div>

                  <select className="settings-select" value={defaultDashboard} onChange={(event) => setDefaultDashboard(event.target.value)}>
                    <option>Dashboard</option>
                    <option>Threat Detection</option>
                    <option>Threat Analysis</option>
                  </select>
                </div>

                <div className="setting-row">
                  <div>
                    <h3>Time Zone</h3>
                    <p>
                      Time zone used for alerts and reports.
                    </p>
                  </div>

                  <select className="settings-select" value={timeZone} onChange={(event) => setTimeZone(event.target.value)}>
                    <option value="IST">
                      India Standard Time (IST)
                    </option>
                    <option>UTC</option>
                    <option>GMT</option>
                  </select>
                </div>

              </div>

              <div className="save-area">
                <button className="save-button" onClick={saveGeneralSettings}>Save Settings</button>
              </div>
            </>
          )}

          {/* ACCOUNT */}
          {activeSection === "Account" && (
            <>
              <div className="settings-section-header">
                <h2>Account Settings</h2>
                <p>
                  Manage your account information.
                </p>
              </div>

              <div className="setting-card">

                <div className="profile-preview">
                  <div className="profile-avatar">
                    {profilePhoto ? <img src={profilePhoto} alt="Profile" /> : fullName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h3>{fullName || "User"}</h3>
                    <p>Security Analyst</p>
                  </div>

                    <input className="profile-photo-input" id="profile-photo" type="file" accept="image/*" onChange={handlePhotoChange} />
                    <label className="secondary-button" htmlFor="profile-photo">
                    Change Photo
                    </label>
                </div>

                <div className="form-grid">

                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      className="settings-input full"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      className="settings-input full"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>

                </div>

                <div className="save-area">
                  <button className="save-button" onClick={saveAccountSettings}>
                    Save Changes
                  </button>
                </div>

              </div>
            </>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === "Notifications" && (
            <>
              <div className="settings-section-header">
                <h2>Notification Settings</h2>
                <p>
                  Choose which security notifications you want to receive.
                </p>
              </div>

              <div className="setting-card">

                <ToggleRow
                  title="Email Alerts"
                  description="Receive important security alerts by email."
                  enabled={settings.emailAlerts}
                  onToggle={() => toggleSetting("emailAlerts")}
                />

                <ToggleRow
                  title="Critical Threat Alerts"
                  description="Immediately notify me when a critical threat is detected."
                  enabled={settings.criticalAlerts}
                  onToggle={() => toggleSetting("criticalAlerts")}
                />

                <ToggleRow
                  title="Weekly Reports"
                  description="Receive a weekly cybersecurity summary."
                  enabled={settings.weeklyReports}
                  onToggle={() => toggleSetting("weeklyReports")}
                />

                <ToggleRow
                  title="Login Notifications"
                  description="Notify me when a new login is detected."
                  enabled={settings.loginNotifications}
                  onToggle={() => toggleSetting("loginNotifications")}
                />

              </div>
            </>
          )}

          {/* SECURITY */}
          {activeSection === "Security" && (
            <>
              <div className="settings-section-header">
                <h2>Security Settings</h2>
                <p>
                  Manage authentication and account security.
                </p>
              </div>

              <div className="setting-card">

                <div className="security-item">

                  <div className="security-icon">
                    🔐
                  </div>

                  <div>
                    <h3>Two-Factor Authentication</h3>
                    <p>
                      Add an additional layer of protection to your account.
                    </p>
                  </div>

                  <Toggle
                    enabled={settings.twoFactor}
                    onToggle={() => toggleSetting("twoFactor")}
                  />

                </div>

                <div className="security-item">

                  <div className="security-icon">
                    🔑
                  </div>

                  <div>
                    <h3>Password</h3>
                    <p>
                      Last changed recently.
                    </p>
                  </div>

                  <button className="secondary-button" onClick={() => { setPasswordOpen(true); setPasswordMessage(""); }}>
                    Change Password
                  </button>

                </div>

                <div className="security-item">

                  <div className="security-icon">
                    💻
                  </div>

                  <div>
                    <h3>Active Sessions</h3>
                    <p>
                      Manage devices currently signed in to your account.
                    </p>
                  </div>

                  <button className="secondary-button" onClick={() => setSessionsOpen(true)}>
                    Manage
                  </button>

                </div>

              </div>
            </>
          )}

          {/* APPEARANCE */}
          {activeSection === "Appearance" && (
            <>
              <div className="settings-section-header">
                <h2>Appearance</h2>
                <p>
                  Customize how the platform looks.
                </p>
              </div>

              <div className="setting-card">

                <div className="appearance-option">

                  <div>
                    <h3>Theme</h3>
                    <p>
                      Select the visual theme for the platform.
                    </p>
                  </div>

                  <div className="theme-options">

                    <button className={`theme-card ${theme === "dark" ? "active" : ""}`} onClick={() => changeTheme("dark")}>
                      <div className="theme-preview dark-preview">
                        🌙
                      </div>
                      <span>Dark</span>
                    </button>

                    <button className={`theme-card ${theme === "light" ? "active" : ""}`} onClick={() => changeTheme("light")}>
                      <div className="theme-preview light-preview">
                        ☀️
                      </div>
                      <span>Light</span>
                    </button>

                  </div>

                </div>

              </div>
            </>
          )}

          {saveMessage && <p className="settings-save-message" role="status">{saveMessage}</p>}

        </div>

      </div>

      {passwordOpen && (
        <div className="password-modal-backdrop" onClick={() => setPasswordOpen(false)}>
          <form className="password-modal" onSubmit={handlePasswordChange} onClick={(event) => event.stopPropagation()}>
            <div className="password-modal-header">
              <div><span>ACCOUNT SECURITY</span><h2>Change password</h2></div>
              <button type="button" className="password-close" onClick={() => setPasswordOpen(false)} aria-label="Close">×</button>
            </div>
            <label>Current password<input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} required /></label>
            <label>New password<input type="password" minLength="8" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} required /></label>
            <label>Confirm new password<input type="password" minLength="8" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} required /></label>
            {passwordMessage && <p className="password-message" role="status">{passwordMessage}</p>}
            <button className="save-button" type="submit">Update Password</button>
          </form>
        </div>
      )}

      {sessionsOpen && (
        <div className="password-modal-backdrop" onClick={() => setSessionsOpen(false)}>
          <section className="password-modal sessions-modal" role="dialog" aria-modal="true" aria-labelledby="sessions-title" onClick={(event) => event.stopPropagation()}>
            <div className="password-modal-header">
              <div><span>ACCOUNT SECURITY</span><h2 id="sessions-title">Active sessions</h2></div>
              <button type="button" className="password-close" onClick={() => setSessionsOpen(false)} aria-label="Close">×</button>
            </div>
            <div className="session-row">
              <div className="session-device">▣</div>
              <div><strong>This browser</strong><p>Current session · {navigator.platform || "Unknown device"}</p></div>
              <span className="session-current">Active</span>
            </div>
            <p className="session-note">Signing out removes this device’s local session and returns you to the login page.</p>
            <button className="secondary-button session-signout" onClick={handleSignOutCurrentDevice}>Sign out this device</button>
          </section>
        </div>
      )}

    </div>
  );
}


/* Toggle row */

function ToggleRow({
  title,
  description,
  enabled,
  onToggle,
}) {
  return (
    <div className="setting-row">

      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <Toggle
        enabled={enabled}
        onToggle={onToggle}
      />

    </div>
  );
}


/* Toggle */

function Toggle({
  enabled,
  onToggle,
}) {
  return (
    <button
      className={`toggle ${enabled ? "enabled" : ""}`}
      onClick={onToggle}
      type="button"
    >
      <span></span>
    </button>
  );
}

export default Settings;