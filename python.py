from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route("/")
def home():
    return jsonify({
        "message": "AI Threat Detection Service is running!"
    })


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    threat_data = data.get("data", "")

    # Temporary AI detection logic
    # We will replace this with your actual ML model later.
    suspicious_words = [
        "malware",
        "phishing",
        "attack",
        "trojan",
        "ransomware",
        "suspicious",
        "unauthorized"
    ]

    text = threat_data.lower()

    failed_logins = any(
        phrase in text for phrase in ["failed login", "brute force", "password spray"]
    )
    suspicious_url = any(
        phrase in text for phrase in ["http://", "login", "verify", "secure-account"]
    )
    network_attack = any(
        phrase in text for phrase in ["port 445", ": 445", "port 3389", "connections", "ddos"]
    )
    detected = any(word in text for word in suspicious_words) or failed_logins or suspicious_url or network_attack

    if detected:
        result = "Threat Detected"
        severity = "High" if failed_logins or network_attack or "phishing" in text else "Medium"
    else:
        result = "No Threat"
        severity = "Low"

    return jsonify({
        "result": result,
        "severity": severity,
        "input": threat_data
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)