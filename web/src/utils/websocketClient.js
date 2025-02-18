const WebSocket = require("ws");

const WS_SERVER = "ws://localhost:8080";

/**
 * Create and return a WebSocket client connected to the server
 * @returns {WebSocket} - WebSocket client
 */
function createWebSocketClient() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_SERVER);

    ws.on("open", () => {
      console.log("Connected to WebSocket server");
      resolve(ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      reject(error);
    });
  });
}

module.exports = { createWebSocketClient };
