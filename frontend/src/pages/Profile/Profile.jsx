import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const savedSettings = JSON.parse(localStorage.getItem("platformSettings") || "{}");
  const [user, setUser] = useState({
    name: storedUser.name || "Akshatha",
    email: storedUser.email || "your@email.com",
    profilePhoto: storedUser.profilePhoto || "",
  });
  const [editOpen, setEditOpen] = useState(false);
  const [draftUser, setDraftUser] = useState(user);
  const [twoFactor, setTwoFactor] = useState(savedSettings.twoFactor || false);

  const openEditor = () => {
    setDraftUser(user);
    setEditOpen(true);
  };

  const saveProfile = (event) => {
    event.preventDefault();
    const nextUser = { ...storedUser, ...draftUser, name: draftUser.name.trim() || "User" };
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser({ ...draftUser, name: nextUser.name });
    setEditOpen(false);
  };

  const toggleTwoFactor = () => {
    const nextValue = !twoFactor;
    setTwoFactor(nextValue);
    localStorage.setItem("platformSettings", JSON.stringify({ ...savedSettings, twoFactor: nextValue }));
  };
  return (
    <div className="profile-page">

      {/* Header */}
      <div className="profile-header">
        <div>
          <h1>Profile</h1>
          <p>Manage your account and security information</p>
        </div>

        <span className="profile-online">
          <span></span>
          Online
        </span>
      </div>

      <div className="profile-grid">

        {/* Profile Card */}
        <div className="profile-main-card">

          <div className="profile-cover"></div>

          <div className="profile-main-content">

            <div className="profile-large-avatar">
              {user.profilePhoto ? <img src={user.profilePhoto} alt="Profile" /> : user.name.charAt(0).toUpperCase()}
            </div>

            <div className="profile-name-area">
              <h2>{user.name}</h2>
              <p>Security Analyst</p>

              <span className="role-badge">
                🛡 Security Analyst
              </span>
            </div>

          </div>

          <div className="profile-info">

            <div className="info-item">
              <span className="info-label">EMAIL</span>
              <strong>{user.email}</strong>
            </div>

            <div className="info-item">
              <span className="info-label">ACCOUNT STATUS</span>
              <strong className="status-active">
                ● Active
              </strong>
            </div>

            <div className="info-item">
              <span className="info-label">LAST LOGIN</span>
              <strong>Today • 09:15 AM</strong>
            </div>

            <div className="info-item">
              <span className="info-label">MEMBER SINCE</span>
              <strong>August 2026</strong>
            </div>

          </div>

          <div className="profile-actions">
            <button className="edit-profile-btn" onClick={openEditor}>
              Edit Profile
            </button>
          </div>

        </div>


        {/* Security Card */}
        <div className="profile-security-card">

          <div className="card-heading">
            <div>
              <h2>Security</h2>
              <p>Account security overview</p>
            </div>

            <div className="security-shield">
              🔐
            </div>
          </div>


          <div className="security-status">

            <div className="security-score">
              <div className="score-circle">
                <span>85%</span>
              </div>

              <div>
                <strong>Good Security</strong>
                <p>Your account is well protected.</p>
              </div>
            </div>

          </div>


          <div className="security-list">

            <div className="security-list-item">
              <div className="security-list-icon">
                🔑
              </div>

              <div>
                <strong>Password</strong>
                <p>Last changed recently</p>
              </div>

              <button onClick={() => navigate("/settings")}>Change</button>
            </div>


            <div className="security-list-item">
              <div className="security-list-icon">
                🛡️
              </div>

              <div>
                <strong>Two-Factor Authentication</strong>
                <p>{twoFactor ? "Enabled" : "Not enabled"}</p>
              </div>

              <button onClick={toggleTwoFactor}>{twoFactor ? "Disable" : "Enable"}</button>
            </div>


            <div className="security-list-item">
              <div className="security-list-icon">
                💻
              </div>

              <div>
                <strong>Active Sessions</strong>
                <p>1 active session</p>
              </div>

              <button onClick={() => navigate("/settings")}>Manage</button>
            </div>

          </div>

        </div>


        {/* Activity Card */}
        <div className="profile-activity-card">

          <div className="card-heading">
            <div>
              <h2>Recent Activity</h2>
              <p>Your latest account activity</p>
            </div>
          </div>

          <div className="activity-list">

            <div className="activity-item">
              <div className="activity-icon">
                🔐
              </div>

              <div>
                <strong>Successful login</strong>
                <p>Today • 09:15 AM</p>
              </div>

              <span className="activity-success">
                Success
              </span>
            </div>


            <div className="activity-item">
              <div className="activity-icon">
                📊
              </div>

              <div>
                <strong>Viewed threat analysis</strong>
                <p>Today • 08:52 AM</p>
              </div>

              <span className="activity-view">
                Viewed
              </span>
            </div>


            <div className="activity-item">
              <div className="activity-icon">
                📄
              </div>

              <div>
                <strong>Generated security report</strong>
                <p>Yesterday • 04:30 PM</p>
              </div>

              <span className="activity-view">
                Report
              </span>
            </div>

          </div>

        </div>


        {/* Permissions Card */}
        <div className="profile-permissions-card">

          <div className="card-heading">
            <div>
              <h2>Permissions</h2>
              <p>Your current platform access</p>
            </div>
          </div>

          <div className="permission-list">

            <div>
              <span>Threat Detection</span>
              <b>Allowed</b>
            </div>

            <div>
              <span>Threat Analysis</span>
              <b>Allowed</b>
            </div>

            <div>
              <span>Security Reports</span>
              <b>Allowed</b>
            </div>

            <div>
              <span>AI Assistant</span>
              <b>Allowed</b>
            </div>

          </div>

        </div>

      </div>

      {editOpen && (
        <div className="profile-modal-backdrop" onClick={() => setEditOpen(false)}>
          <form className="profile-modal" onSubmit={saveProfile} onClick={(event) => event.stopPropagation()}>
            <div className="profile-modal-header"><div><span>ACCOUNT PROFILE</span><h2>Edit profile</h2></div><button type="button" onClick={() => setEditOpen(false)} aria-label="Close">×</button></div>
            <label>Full name<input value={draftUser.name} onChange={(event) => setDraftUser({ ...draftUser, name: event.target.value })} required /></label>
            <label>Email address<input type="email" value={draftUser.email} onChange={(event) => setDraftUser({ ...draftUser, email: event.target.value })} required /></label>
            <label>Profile photo<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setDraftUser({ ...draftUser, profilePhoto: reader.result }); reader.readAsDataURL(file); }} /></label>
            <button className="profile-save-button" type="submit">Save Profile</button>
          </form>
        </div>
      )}

    </div>
  );
}

export default Profile;