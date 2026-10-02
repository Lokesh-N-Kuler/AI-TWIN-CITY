import { useEffect, useState } from "react";

function ChatBox({ selectedQuestion, onQuestionUsed }) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am City Pilot AI. Ask me anything about traffic, floods, pollution or emergencies.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedQuestion) {
      setInput(selectedQuestion);
      onQuestionUsed();
    }
  }, [selectedQuestion, onQuestionUsed]);

  async function handleSend() {
    const question = input.trim();

    if (!question || loading) {
      return;
    }

    const userMessage = {
      sender: "user",
      text: question,
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: question,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "AI request failed"
        );
      }

      const aiMessage = {
        sender: "ai",
        text:
          data.response ||
          "I could not generate a response from the current city data.",
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        aiMessage,
      ]);
    } catch (error) {
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "ai",
          text:
            "I could not connect to the City Pilot AI backend. Please make sure the FastAPI backend and Gemini configuration are running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chat-card">

      <div className="chat-header">
        <div className="chat-ai-icon">
          AI
        </div>

        <div>
          <h2>City Pilot AI</h2>
          <span>
            {loading
              ? "Analyzing live city data..."
              : "Online and ready to help"}
          </span>
        </div>
      </div>

      <div className="chat-messages">

        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.sender === "user"
                ? "message user-message"
                : "message ai-message"
            }
          >
            {message.text}
          </div>
        ))}

        {loading && (
          <div className="message ai-message">
            Analyzing current CityTwin data...
          </div>
        )}

      </div>

      <div className="chat-input-area">

        <input
          type="text"
          placeholder="Ask City Pilot AI..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />

        <button
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>

      </div>

    </div>
  );
}

export default ChatBox;