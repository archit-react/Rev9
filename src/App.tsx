import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("");
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  // Fetch backend GET message
  useEffect(() => {
    fetch("http://localhost:5001/api/message")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  // Send POST request to backend
  const sendData = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: input }),
      });
      const data = await res.json();
      setResponse(data.reply);
    } catch (err) {
      console.error("Error sending data:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Vite + React</h1>

      {/* Show message from backend */}
      <h2 style={{ color: "green" }}>
        Backend says: {message || "Loading..."}
      </h2>

      {/* Input + button for POST request */}
      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Enter your name"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ marginRight: "10px", padding: "6px" }}
        />
        <button onClick={sendData}>Send to Backend</button>
      </div>

      {/* Show response */}
      {response && (
        <p style={{ marginTop: "20px", color: "blue" }}>{response}</p>
      )}

      {/* Vite counter demo (still works) */}
      <div className="card" style={{ marginTop: "40px" }}>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </div>
  );
}

export default App;
