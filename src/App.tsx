// src/App.tsx
import { useEffect, useState } from "react";

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("");
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  useEffect(() => {
    fetch("http://localhost:5001/api/message")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

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
      {/* Main content wrapper grows to fill space */}
      <main className="flex-1 p-6">
        <h1>Vite + React</h1>
        <h2 className="text-green-600">
          Backend says: {message || "Loading..."}
        </h2>

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

        {response && <p className="mt-5 text-blue-600">{response}</p>}

        <div className="card mt-10">
          <button
            onClick={() => setCount((c) => c + 1)}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            count is {count}
          </button>
        </div>
      </main>


    </div>
  );
}

export default App;
