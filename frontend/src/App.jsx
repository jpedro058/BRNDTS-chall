import { useState, useEffect } from "react";
import "./styles/index.css";

const WS_SERVER = "ws://localhost:8080";

const App = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]); // Chat messages
  const [frames, setFrames] = useState([]); // Store the frame URLs

  useEffect(() => {
    const wsClient = new WebSocket(WS_SERVER);

    wsClient.onopen = () => {
      console.log("Connected to WebSocket server");
      setWs(wsClient);
    };

    wsClient.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Treat incoming messages
    wsClient.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.error) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: message.error, fromServer: true },
        ]);
      } else if (message.message) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: message.message, fromServer: true },
        ]);
      } else if (message.frames) {
        setFrames(
          message.frames
            .map((frame) => `data:image/png;base64,${frame}`)
            .reverse()
        );
      }
    };

    return () => {
      if (wsClient) {
        wsClient.close();
      }
    };
  }, []);

  const startCapture = () => {
    setIsCapturing(true);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: "startCapture" }));
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Started frame capture.", fromServer: false },
      ]);
    } else {
      console.error("WebSocket connection is not open yet.");
    }
  };

  const stopCapture = () => {
    setIsCapturing(false);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: "stopCapture" }));
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Stopped frame capture.", fromServer: false },
      ]);
    } else {
      console.error("WebSocket connection is not open yet.");
    }
  };

  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: "getFrames" }));
    } else {
      console.error("WebSocket connection is not open yet.");
    }
  };

  console.log(messages);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col items-center justify-center py-8 px-4">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-6 space-y-4">
        <h1 className="text-3xl font-bold text-center text-blue-600">
          Video Frame Capture
        </h1>

        <div className="flex justify-center">
          {!isCapturing ? (
            <button
              type="button"
              onClick={startCapture}
              className="bg-blue-600 text-white py-2 px-6 rounded-full text-lg hover:bg-blue-700 transition"
            >
              Start Capture
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCapture}
              className="bg-red-600 text-white py-2 px-6 rounded-full text-lg hover:bg-red-700 transition"
            >
              Stop Capture
            </button>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-blue-500">Chat</h2>
          <div
            className="bg-gray-50 border border-gray-300 rounded-lg max-h-60 overflow-y-auto p-4 space-y-2"
            style={{ maxHeight: "200px" }}
          >
            {messages.map((msg, index) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={index}
                className={`flex ${
                  msg.fromServer ? "justify-start" : "justify-end"
                }`}
              >
                <p
                  className={`text-sm p-2 rounded-xl ${
                    msg.fromServer ? "bg-gray-200" : "bg-blue-100"
                  }`}
                >
                  {msg.text}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between">
            <button
              type="button"
              onClick={sendMessage}
              className=" bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Get all the frames
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-blue-500">Frames</h2>
          <div className="grid grid-cols-3 gap-4">
            {frames.map((frameUrl, index) => (
              <img
                key={frameUrl}
                src={frameUrl}
                alt={`Frame ${index}`}
                className="w-full h-auto rounded-lg shadow-md"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
