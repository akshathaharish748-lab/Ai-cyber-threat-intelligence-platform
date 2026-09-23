import { useState } from "react";
import "./AIAssistant.css";
import { API_BASE_URL, authHeaders } from "../../config";

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const suggestions = [
    "Analyze recent threats",
    "Explain critical alerts",
    "Generate security summary",
    "Check system risk",
  ];

  const handleSend = async (text = message) => {
    const value = text.trim();

    if (!value || isLoading) return;

    const userMessage = { type: "user", text: value };
    const history = messages;
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ message: value, history }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "The assistant could not respond.");
      }

      setMessages((prev) => [...prev, { type: "ai", text: data.reply }]);
    } catch (error) {
      console.error("AI assistant request error:", error);
      setMessages((prev) => [...prev, { type: "ai", text: "I could not connect to the assistant service. Make sure the backend is running and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-assistant-page">

      {/* Header */}
      <div className="ai-assistant-header">
        <div>
          <h1>Gemini AI Assistant</h1>
          <p>
            Your intelligent cybersecurity analysis assistant
          </p>
        </div>

        <div className="ai-status">
          <span></span>
          AI Online
        </div>
      </div>

      {/* Assistant Card */}
      <div className="assistant-container">

        <div className="assistant-top">

          <div className="assistant-title">
            <div className="assistant-avatar">
              🛡️
            </div>

            <div>
              <h2>Gemini AI Assistant</h2>
              <p>
                Cybersecurity Intelligence Assistant
              </p>
            </div>
          </div>

          <div className="assistant-status">
            ● Ready
          </div>

        </div>

        {/* Chat Area */}
        <div className="chat-area">

          {messages.length === 0 ? (

            <div className="welcome-message">

              <div className="large-ai-icon">
                🛡️
              </div>

              <h2>
                How can I help secure your environment?
              </h2>

              <p>
                I can help analyze threats, alerts,
                vulnerabilities and security reports.
              </p>

              <div className="suggestion-title">
                Suggested questions
              </div>

              <div className="suggestions">

                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                  >
                    {suggestion}
                    <span>→</span>
                  </button>
                ))}

              </div>

            </div>

          ) : (

            <div className="messages">

              {messages.map((item, index) => (

                <div
                  key={index}
                  className={`message-row ${item.type}`}
                >

                  {item.type === "ai" && (
                    <div className="message-avatar">
                      🛡️
                    </div>
                  )}

                  <div className="message-bubble">
                    {item.text}
                  </div>

                </div>

              ))}

              {isLoading && (
                <div className="message-row ai">
                  <div className="message-avatar">🛡️</div>
                  <div className="message-bubble assistant-typing">Assistant is thinking...</div>
                </div>
              )}

            </div>

          )}

        </div>

        {/* Input */}
        <div className="chat-input-area">

          <div className="chat-input">

            <input
              type="text"
              placeholder="Ask about threats, alerts, vulnerabilities..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
            />

            <button
              className="send-button"
              onClick={() => handleSend()}
              disabled={isLoading || !message.trim()}
            >
              ➤
            </button>

          </div>

          <p className="assistant-disclaimer">
            AI-generated responses should be reviewed before
            taking security actions.
          </p>

        </div>

      </div>

    </div>
  );
}

export default AIAssistant;