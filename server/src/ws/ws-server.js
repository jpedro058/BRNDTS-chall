const WebSocketServer = require("ws").Server;
const Frame = require("../db/models/frame");

const MESSAGE_RATE_LIMIT = 1000; // 1 message per second
let lastMessageTimestamp = 0;

const isValidFrame = (message) => {
  return Buffer.isBuffer(message);
};

const startWsServer = (port) => {
  const wss = new WebSocketServer({ port });

  wss.on("connection", (ws) => {
    console.log("Client Connected");

    // Handle incoming messages
    ws.on("message", async (message) => {
      const currentTimestamp = Date.now();
      if (currentTimestamp - lastMessageTimestamp < MESSAGE_RATE_LIMIT) {
        console.log("Message rate limit exceeded");
        return;
      }

      // Convert Buffer to string
      const messageString = Buffer.isBuffer(message)
        ? message.toString()
        : message;

      lastMessageTimestamp = currentTimestamp;

      // Check if the message is a 'GET:' command, to see all the frames
      if (messageString.startsWith("getFrames")) {
        console.log("Fetching all frames");

        try {
          // Fetch all frames from the database
          const frames = await Frame.find();

          if (frames.length === 0) {
            console.log("No frames found");
            ws.send("No frames found");
            return;
          }

          // Send each frame data (binary data) back to the client
          for (const frame of frames) {
            ws.send(frame.data);
            console.log("Frame sent");
          }
        } catch (err) {
          console.log("Error fetching frame:", err);
          ws.send("Error fetching frame");
        }
      } else if (isValidFrame(message)) {
        // Handle valid frames -> to be saved in the database
        console.log("Frame received");

        const frameData = new Frame({ data: message });
        await frameData.save();
      } else {
        console.log("Invalid frame");
        return;
      }
    });

    ws.on("close", () => {
      console.log("Client Disconnected");
    });
  });
};

module.exports = startWsServer;
