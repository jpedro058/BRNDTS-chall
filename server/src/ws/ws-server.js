const WebSocketServer = require("ws").Server;
const {
  startPuppeteerCapture,
  stopPuppeteerCapture,
} = require("../puppeteer/puppeteer-capture");
const Frame = require("../db/models/frame");

const startWsServer = (port) => {
  const wss = new WebSocketServer({ port });

  wss.on("connection", (ws) => {
    console.log("Client Connected");

    ws.on("message", async (message) => {
      try {
        const msg = JSON.parse(message);
        if (msg.action === "startCapture") {
          console.log("Starting capture");
          await startPuppeteerCapture();
        } else if (msg.action === "stopCapture") {
          console.log("Stopping capture");
          await stopPuppeteerCapture();
          ws.send(JSON.stringify({ message: "Capture stopped" }));
        } else if (msg.action === "getFrames") {
          console.log("Fetching all frames");
          const frames = await Frame.find();

          if (!frames || frames.length === 0) {
            ws.send(JSON.stringify({ message: "No frames available" }));
            return;
          }

          ws.send(
            JSON.stringify({
              frames: frames.map((f) => f.data.toString("base64")),
            })
          );
        }
      } catch (err) {
        console.log("Error handling WebSocket message:", err);
        ws.send(JSON.stringify({ error: "Invalid request" }));
      }
    });

    ws.on("close", () => {
      console.log("Client Disconnected");
      stopPuppeteerCapture();
    });
  });
};

module.exports = startWsServer;
