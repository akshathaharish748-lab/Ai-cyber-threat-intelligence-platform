import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">
      <header className="home-navbar">
        <Link to="/" className="home-logo">
          <span className="logo-shield">🛡</span>
          <span>AI CYBER</span>
        </Link>
        <nav className="home-nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
        </nav>
        <div className="home-nav-buttons">
          <Link to="/login" className="login-button">Login</Link>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-badge"><span className="status-dot" />AI-POWERED CYBERSECURITY</div>
          <h1>AI-Powered<br /><span>Cyber Threat</span><br />Intelligence</h1>
          <p>Detect, analyze, and respond to cyber threats using intelligent artificial intelligence. AI Cyber helps security teams identify risks before they become serious security incidents.</p>
          <div className="hero-buttons">
            <Link to="/login" className="primary-button">Get Started <span>→</span></Link>
            <a href="#about" className="outline-button">Learn More</a>
          </div>
        </div>

        <div className="hero-security">
          <div className="security-glow" />
          <div className="security-ring ring-one" />
          <div className="security-ring ring-two" />
          <div className="security-ring ring-three" />
          <div className="main-shield"><span>🛡</span></div>
          <div className="threat-card threat-card-one"><div className="threat-icon red">🔔</div><div><strong>Threat Detected</strong><small>High Risk</small></div></div>
          <div className="threat-card threat-card-two"><div className="threat-icon purple">🧠</div><div><strong>AI Analysis</strong><small>98% Confidence</small></div></div>
          <div className="threat-card threat-card-three"><div className="threat-icon green">✓</div><div><strong>System Protected</strong><small>Secure</small></div></div>
        </div>
      </section>

      <section className="about" id="about">
        <div className="section-heading"><span>ABOUT OUR PLATFORM</span><h2>Everything You Need to<br /><strong>Stay Protected</strong></h2><p>AI Cyber is a centralized cyber threat intelligence platform designed to detect, analyze, monitor and manage security threats from one place.</p></div>
        <div className="about-content">
          <div className="about-card"><div className="about-icon">🔍</div><h3>Threat Detection</h3><p>Identify suspicious IP addresses, malware, phishing attempts, unauthorized access and other potential cyber threats in real time.</p></div>
          <div className="about-card"><div className="about-icon">🤖</div><h3>AI-Powered Analysis</h3><p>Artificial intelligence analyzes security information and helps determine the severity and potential impact of detected threats.</p></div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="section-heading"><span>POWERFUL FEATURES</span><h2>Intelligent Security<br /><strong>For Modern Threats</strong></h2><p>Monitor your security environment with powerful tools designed for detection, analysis and response.</p></div>
        <div className="feature-grid">
          <div className="feature-card"><div className="feature-icon blue">🔍</div><h3>Real-Time Threat Detection</h3><p>Monitor security events and detect suspicious activity as it happens.</p></div>
          <div className="feature-card"><div className="feature-icon purple">🧠</div><h3>AI-Powered Threat Analysis</h3><p>Analyze threats using intelligent models and calculate potential risk levels.</p></div>
          <div className="feature-card"><div className="feature-icon red">🔔</div><h3>Smart Alerts</h3><p>Receive important notifications when critical security threats are identified.</p></div>
          <div className="feature-card"><div className="feature-icon green">📊</div><h3>Detailed Reports</h3><p>Generate security reports containing threats, risk levels and security activity.</p></div>
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <div className="section-heading"><span>HOW IT WORKS</span><h2>From Detection to<br /><strong>Protection</strong></h2><p>AI Cyber follows a simple security workflow to help organizations understand and respond to cyber threats.</p></div>
        <div className="steps">
          <div className="step"><div className="step-number">STEP 01</div><div className="step-icon">🔍</div><h3>Detect</h3><p>Continuously monitor systems and identify suspicious security activity.</p></div>
          <div className="step-line" />
          <div className="step"><div className="step-number">STEP 02</div><div className="step-icon">🧠</div><h3>Analyze</h3><p>AI analyzes detected activity and determines threat severity and risk.</p></div>
          <div className="step-line" />
          <div className="step"><div className="step-number">STEP 03</div><div className="step-icon">⚠️</div><h3>Alert</h3><p>Security teams receive alerts about important and critical threats.</p></div>
          <div className="step-line" />
          <div className="step"><div className="step-number">STEP 04</div><div className="step-icon">🛡️</div><h3>Protect</h3><p>Take recommended actions to reduce risk and protect affected systems.</p></div>
        </div>
      </section>
    </div>
  );
}

export default Home;
