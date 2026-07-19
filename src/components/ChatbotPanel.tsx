import { useState } from "react";

interface Props {
  onAsk: (question: string) => void;
  onRevertToDefaults?: () => void;
}

export default function ChatbotPanel({ onAsk, onRevertToDefaults }: Props) {
  const [question, setQuestion] = useState("");

  const examples = [
    "what growth do I need to maintain NAV",
    "what does my portfolio value need to be to maintain my drawdowns without significant NAV loss",
    "what is my optimum portfolio allocation before the crash to maximise my end NAV",
    "what drawdown can I afford each year without NAV loss"
  ];

  return (
    <div className="panel-container">
      <h2 className="control-title">Portfolio Chatbot</h2>

      <div style={{ marginBottom: "12px" }}>
        <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px" }}>
          Select an example question:
        </label>
        <select
          onChange={(e) => setQuestion(e.target.value)}
          value={question}
          style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", marginBottom: "10px" }}
        >
          <option value="">-- Select a question --</option>
          {examples.map((ex, idx) => (
            <option key={idx} value={ex}>
              {ex.length > 60 ? ex.substring(0, 60) + "..." : ex}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px" }}>
          Or type your question:
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your portfolio..."
          rows={3}
          style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", resize: "none" }}
        />
      </div>

      <div className="bottom-align" style={{ gap: "10px", flexDirection: "row" }}>
        <button
          className="apply-button"
          onClick={() => {
            if (question.trim()) onAsk(question);
          }}
          disabled={!question.trim()}
          style={{ flex: 1 }}
        >
          Ask Chatbot
        </button>
        {onRevertToDefaults && (
          <button
            className="apply-button"
            onClick={onRevertToDefaults}
            style={{ flex: 1, backgroundColor: "#6b7280" }}
          >
            Revert to Defaults
          </button>
        )}
      </div>
    </div>
  );
}