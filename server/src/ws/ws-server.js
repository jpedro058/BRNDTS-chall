const WebSocketServer = require("ws").Server;
const puppeteer = require("puppeteer");
const Frame = require("../db/models/frame");

const VIDEO_URL =
  "https://brndts-public.s3.eu-west-2.amazonaws.com/technical-challenge.html";
const FRAME_CAPTURE_INTERVAL = 1000; // 1 frame por segundo
let browser = null;
let page = null;
let captureInterval = null;
let isCapturing = false;

const startPuppeteerCapture = async (ws) => {
  if (isCapturing) {
    console.log("Capture already in progress.");
    return; // Impede que a captura comece novamente
  }

  isCapturing = true;

  try {
    // Launch Puppeteer browser instance and navigate to the video page
    browser = await puppeteer.launch({
      headless: true,
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    page = await browser.newPage();
    await page.goto(VIDEO_URL, { waitUntil: "networkidle2" });

    const videoElement = await page.$("video");
    if (!videoElement) {
      console.error("Video element not found");
      return;
    }

    const videoBox = await videoElement.boundingBox();

    captureInterval = setInterval(async () => {
      try {
        const isPlaying = await page.evaluate(() => {
          const video = document.querySelector("video");
          return !video.paused && !video.ended;
        });

        if (isPlaying) {
          const frame = await captureFrame(page, videoBox);
        } else {
          console.log("Video paused or ended");
          clearInterval(captureInterval);
          stopPuppeteerCapture();
        }
      } catch (error) {
        console.error("Error capturing frame:", error);
        clearInterval(captureInterval);
        stopPuppeteerCapture();
      }
    }, FRAME_CAPTURE_INTERVAL);

    // Play the video
    await page.evaluate(() => {
      const video = document.querySelector("video");
      video.play();
    });
  } catch (error) {
    console.error("Error starting Puppeteer capture:", error);
    isCapturing = false; // Em caso de erro, garante que o estado de captura seja resetado
  }
};

const stopPuppeteerCapture = async () => {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
  }
  clearInterval(captureInterval);
  isCapturing = false;
};

const captureFrame = async (page, videoBox) => {
  try {
    const frame = await page.screenshot({
      encoding: "binary", // 'binary' retorna um Uint8Array
      clip: {
        x: videoBox.x,
        y: videoBox.y,
        width: videoBox.width,
        height: videoBox.height,
      },
    });

    // Converter o Uint8Array para Buffer
    const frameBuffer = Buffer.from(frame);

    // Salvar o frame como Buffer no banco de dados
    const frameData = new Frame({ data: frameBuffer });
    await frameData.save();
    console.log("Frame saved to database");

    return frameBuffer; // Enviar como Buffer
  } catch (error) {
    console.error("Error capturing frame:", error);
  }
};

const startWsServer = (port) => {
  const wss = new WebSocketServer({
    port,
    clientTracking: true,
    handleProtocols: (protocols, request) => true,
  });

  wss.on("connection", (ws) => {
    console.log("Client Connected");

    ws.on("message", async (message) => {
      const msg = JSON.parse(message);
      if (msg.action === "startCapture") {
        console.log("Starting capture");
        await startPuppeteerCapture(ws);
      } else if (msg.action === "stopCapture") {
        console.log("Stopping capture");
        await stopPuppeteerCapture();
        ws.send("Capture stopped");
      } else if (msg.action === "getFrames") {
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
          console.log("Error fetching frames:", err);
          ws.send("Error fetching frames");
        }
      }
    });

    ws.on("close", () => {
      console.log("Client Disconnected");
      stopPuppeteerCapture();
    });
  });
};

module.exports = startWsServer;
