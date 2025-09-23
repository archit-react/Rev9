import { useEffect, useState } from "react";

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
    <div className="flex flex-col min-h-screen">
      {/* Main content wrapper grows to fill space above footer */}
      <main className="flex-1 p-6">
        <h1>Vite + React</h1>

        {/* Show message from backend */}
        <h2 className="text-green-600">
          Backend says: {message || "Loading..."}
        </h2>

        {/* Input + button for POST request */}
        <div className="mt-5">
          <input
            type="text"
            placeholder="Enter your name"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="border rounded px-2 py-1 mr-2"
          />
          <button
            onClick={sendData}
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500"
          >
            Send to Backend
          </button>
        </div>

        {/* Show response */}
        {response && <p className="mt-5 text-blue-600">{response}</p>}

        {/* Vite counter demo */}
        <div className="card mt-10">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            count is {count}
          </button>
        </div>
      </main>

      {/* Footer placeholder (will replace with real footer later) */}
      <footer className="border-t border-gray-200 dark:border-gray-800 p-4 text-center text-sm text-gray-500">
        © 2025 Rev9
      </footer>
    </div>
  );
}

export default App;
