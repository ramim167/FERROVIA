import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";
import { api } from "../lib/api";

const starterMessages = [
  {
    role: "assistant",
    text:
      "Ask me about routes, off days, fares, seats, live status, or the best train for a journey.",
  },
];

const suggestions = [
  "Rangpur Express ekhon koi?",
  "Parjotak Express off day?",
  "Dhaka to Chattogram tomorrow",
];

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(starterMessages);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open, loading]);

  const ask = async (text = draft) => {
    const message = text.trim();
    if (!message || loading) return;
    setDraft("");
    setMessages((items) => [...items, { role: "user", text: message }]);
    setLoading(true);
    try {
      const data = await api("/chat", {
        method: "POST",
        token: "",
        body: { message },
      });
      setMessages((items) => [
        ...items,
        { role: "assistant", text: data.message || "I could not prepare a response." },
      ]);
    } catch (err) {
      setMessages((items) => [
        ...items,
        {
          role: "assistant",
          text: err.message || "The assistant is temporarily unavailable.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`ai-assistant ${open ? "open" : ""}`}>
      {open && (
        <section className="ai-panel" aria-label="AI travel assistant">
          <header className="ai-head">
            <span>
              <Icon name="bot" size={20} />
            </span>
            <div>
              <b>Conduttore</b>
              <small>Instant answers from FERROVIA data</small>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant">
              <Icon name="close" size={18} />
            </button>
          </header>

          <div className="ai-messages" ref={listRef}>
            {messages.map((item, index) => (
              <div className={`ai-message ${item.role}`} key={`${item.role}-${index}`}>
                {item.role === "assistant" && (
                  <span className="ai-message-icon">
                    <Icon name="bot" size={14} />
                  </span>
                )}
                {item.text}
              </div>
            ))}
            {loading && (
              <div className="ai-message assistant loading">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>

          <div className="ai-suggestions">
            {suggestions.map((item) => (
              <button type="button" key={item} onClick={() => ask(item)}>
                {item}
              </button>
            ))}
          </div>

          <form
            className="ai-compose"
            onSubmit={(event) => {
              event.preventDefault();
              ask();
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask Conduttore..."
              maxLength={1000}
            />
            <button type="submit" disabled={loading || !draft.trim()} aria-label="Send message">
              <Icon name="arrow" size={18} />
            </button>
          </form>
        </section>
      )}

      <button
        className="ai-fab"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open AI travel assistant"
      >
        <span className="ai-tooltip">
          Ask <strong>Conduttore</strong>
        </span>
        <Icon name={open ? "close" : "bot"} size={open ? 22 : 27} />
      </button>
    </div>
  );
}
