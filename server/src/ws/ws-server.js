const WebSocketServer = require("ws").Server;
const Frame = require("../db/models/frame");

const MESSAGE_RATE_LIMIT = 1000; // 1 segundo
let lastMessageTimestamp = 0;

const isValidFrame = (message) => {
  return (
    Buffer.isBuffer(message) ||
    (typeof message === "string" && message.startsWith("data:image"))
  );
};

const startWsServer = (port) => {
  const wss = new WebSocketServer({ port });

  wss.on("connection", (ws) => {
    console.log("Client Connected ");

    ws.on("message", async (message) => {
      // Verify if the message rate limit has been exceeded
      const currentTimestamp = Date.now();
      if (currentTimestamp - lastMessageTimestamp < MESSAGE_RATE_LIMIT) {
        console.log("Mensage rate limit exceeded");
        return;
      }

      // Verify if the message is a valid frame
      if (!isValidFrame(message)) {
        console.log("Invalid frame");
        return;
      }

      console.log("Frame received");

      // Update the last message timestamp
      lastMessageTimestamp = currentTimestamp;

      const frameData = new Frame({ data: message });
      await frameData.save();
    });

    ws.on("close", () => {
      console.log("Client Disconnected");
    });
  });
};

module.exports = startWsServer;
