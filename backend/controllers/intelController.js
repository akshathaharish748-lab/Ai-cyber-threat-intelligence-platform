const axios = require("axios");

const normalizeScore = (value, fallback = 50) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(100, Math.max(0, numeric));
};

const getAbuseIpCheck = async (ipValue) => {
  const apiKey = process.env.ABUSEIPDB_KEY;
  if (!apiKey) {
    return { available: false, message: "ABUSEIPDB_KEY not configured." };
  }

  const response = await axios.get("https://api.abuseipdb.com/api/v2/check", {
    params: {
      ipAddress: ipValue,
      maxAgeInDays: 90,
    },
    headers: {
      Key: apiKey,
      Accept: "application/json",
    },
    timeout: 20000,
  });

  const data = response.data?.data || {};
  const score = normalizeScore(data.abuseConfidenceScore ?? 0, 0);

  return {
    available: true,
    provider: "abuseipdb",
    score,
    risk: score >= 80 ? "High" : score >= 50 ? "Medium" : "Low",
    reason: data.countryName ? `AbuseIPDB reported ${score}% confidence and flagged the source as originating from ${data.countryName}.` : `AbuseIPDB reported ${score}% confidence for the IP address.`,
  };
};

const getUrlIntel = async (urlValue) => {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) {
    return { available: false, message: "VIRUSTOTAL_API_KEY not configured." };
  }

  const response = await axios.get("https://www.virustotal.com/api/v3/urls", {
    params: {
      url: urlValue,
    },
    headers: {
      "x-apikey": apiKey,
    },
    timeout: 20000,
  });

  const data = response.data?.data || {};
  const verdict = data.attributes?.last_analysis_stats || {};
  const malicious = Number(verdict.malicious || 0);
  const suspicious = Number(verdict.suspicious || 0);
  const total = malicious + suspicious;

  return {
    available: true,
    provider: "virustotal",
    score: normalizeScore(total * 20 + malicious * 10, 0),
    risk: total > 0 ? "High" : "Low",
    reason: total > 0
      ? `VirusTotal returned ${malicious} malicious and ${suspicious} suspicious findings for this URL.`
      : "VirusTotal did not identify malicious behavior for this URL.",
  };
};

const checkIntel = async (req, res) => {
  try {
    const { type, value } = req.query;

    if (!type || !value) {
      return res.status(400).json({ success: false, message: "Type and value are required." });
    }

    if (type === "ip") {
      const intel = await getAbuseIpCheck(value);
      return res.json({ success: true, ...intel });
    }

    if (type === "url") {
      const intel = await getUrlIntel(value);
      return res.json({ success: true, ...intel });
    }

    return res.json({
      success: true,
      available: false,
      provider: "local-only",
      score: 0,
      risk: "Low",
      reason: "Live intelligence lookup is only configured for IP and URL indicators.",
    });
  } catch (error) {
    console.error("Threat intel lookup failed:", error.message);
    return res.status(502).json({
      success: false,
      available: false,
      message: "Live intelligence provider is temporarily unavailable.",
    });
  }
};

module.exports = { checkIntel };
