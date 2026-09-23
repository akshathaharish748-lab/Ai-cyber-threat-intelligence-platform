const axios = require("axios");

const fallbackResponse = (message, history = []) => {
  const text = message.toLowerCase();
  const previousUserMessage = [...history].reverse().find((item) => item.type === "user")?.text || "";

  if (/^(hi|hello|hey|good morning|good afternoon)\b/.test(text)) {
    return "Hello! I’m Gemini, your cybersecurity analyst. I can investigate phishing, suspicious URLs, IP reputation, login anomalies, malware, and alert triage. What would you like me to assess?";
  }

  if (/how (do i|to|can i) detect|detect a threat|find threats|identify threats/.test(text)) {
    return "I’d approach it like this: validate the indicator, check reputation and context, correlate it with logs and identity data, assess blast radius, then recommend containment and evidence capture. You can also use the Threat Detection page to evaluate a message, URL, IP, login event, or network activity.";
  }

  if (/^(ok|okay|yes|sure|thanks|thank you)\b/.test(text) && previousUserMessage) {
    return `Understood. I’ll continue from your earlier question about "${previousUserMessage}". Share the indicator, timeframe, affected asset, and any observed behavior, and I’ll help assess the risk and response steps.`;
  }

  if (/what is|explain|meaning of/.test(text) && /cyber|security|threat|attack|malware|phishing|firewall|mfa/.test(text)) {
    return "In cybersecurity terms, a threat is any event or action that may compromise confidentiality, integrity, or availability. I assess it by identifying the asset, indicator, tactic, likely impact, evidence, and the best containment or recovery plan.";
  }

  if (/phishing|email|scam|message/.test(text)) {
    return "Treat it as suspicious until verified. Do not click links or open attachments, inspect the sender domain, report the message, and reset credentials if any password was entered.";
  }

  if (/ip address|\bip\b|network|port|traffic/.test(text)) {
    return "For an IP or network event, I’d review reputation, source and destination ports, protocol usage, connection volume, and firewall logs. Only block the indicator after confirming it is not part of a trusted service.";
  }

  if (/login|password|account|brute|authentication/.test(text)) {
    return "I’d review failed and successful logins, source IPs, locations, and affected accounts. Enable MFA, rate-limit attempts, reset exposed credentials, revoke sessions, and investigate any lateral movement.";
  }

  if (/malware|ransomware|virus|infected/.test(text)) {
    return "Isolate the endpoint, preserve forensic evidence, collect process and file hashes, run an updated endpoint scan, apply patches, and restore only from a trusted backup after containment.";
  }

  if (/report|summary|threat|alert|risk|security/.test(text)) {
    return "I can help triage events, explain alerts, review indicators, and suggest response steps. Include the indicator, timestamp, affected asset, and observed behavior for a more specific assessment.";
  }

  return "I’m Gemini, a cybersecurity-focused AI. I can explain technical concepts, review security events, suggest defensive steps, and help structure an investigation. Share the details of your question or incident so I can help with a sharper assessment.";
};

const getGeminiReply = async (message, history = []) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const hasConfiguredGeminiKey = apiKey
    && apiKey.startsWith("AIza")
    && !/your[-_ ]?(api[-_ ]?key|real|gemini)|replace|placeholder/i.test(apiKey);

  if (!hasConfiguredGeminiKey) {
    return null;
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const contents = [
    ...history.slice(-10).map((item) => ({
      role: item.type === "user" ? "user" : "model",
      parts: [{ text: item.text }],
    })),
    { role: "user", parts: [{ text: message.trim() }] },
  ];

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      system_instruction: {
        parts: [{
          text: "You are Gemini, a concise and highly capable cybersecurity assistant. Give practical, defensive, and authorized guidance, clearly state assumptions, and ask for more context when needed.",
        }],
      },
      contents,
      generationConfig: {
        temperature: 0.3,
        topP: 0.9,
      },
    },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    }
  );

  const reply = response.data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .join("")
    .trim();

  return reply || null;
};

const chat = async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: "A message is required." });
  }

  try {
    const geminiReply = await getGeminiReply(message, history);
    if (geminiReply) {
      return res.json({ success: true, reply: geminiReply, provider: "gemini" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const hasConfiguredOpenAIKey = apiKey
      && apiKey.startsWith("sk-")
      && !/your[-_ ]?(api[-_ ]?key|real|openai)|replace|placeholder/i.test(apiKey);

    if (hasConfiguredOpenAIKey) {
      const response = await axios.post(
        process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions",
        {
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are Gemini-inspired, a concise and highly capable cybersecurity assistant. Provide practical, defensive, and authorized guidance and ask for more context when needed.",
            },
            ...history.slice(-10).map((item) => ({
              role: item.type === "user" ? "user" : "assistant",
              content: item.text,
            })),
            { role: "user", content: message.trim() },
          ],
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      return res.json({
        success: true,
        reply: response.data.choices?.[0]?.message?.content || fallbackResponse(message, history),
        provider: "llm",
      });
    }

    return res.json({ success: true, reply: fallbackResponse(message, history), provider: "cybersecurity-fallback" });
  } catch (error) {
    console.error("AI assistant error:", error.response?.data || error.message);
    return res.json({
      success: true,
      reply: `${fallbackResponse(message, history)}\n\nThe configured AI provider was unavailable, so I provided local security guidance instead.`,
      provider: "cybersecurity-fallback",
    });
  }
};

module.exports = { chat, fallbackResponse };
