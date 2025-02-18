const puppeteer = require("puppeteer");
const { createWebSocketClient } = require("./utils/websocketClient");
const { captureFrames } = require("./utils/frameCapture");

const VIDEO_URL =
  "https://brndts-public.s3.eu-west-2.amazonaws.com/technical-challenge.html";
const FRAME_CAPTURE_INTERVAL = 1000; // 1 frame per second

(async () => {
  // Launch the browser and navigate to the video page
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(VIDEO_URL, { waitUntil: "networkidle2" });

  // Check if video element exists
  const videoElement = await page.$("video");
  if (!videoElement) {
    console.error("Video element not found");
    await browser.close();
    return;
  }

  // Get video element dimensions
  const videoBox = await videoElement.boundingBox();

  const ws = await createWebSocketClient();

  const captureInterval = setInterval(async () => {
    const isPlaying = await page.evaluate(() => {
      const video = document.querySelector("video");
      return !video.paused && !video.ended;
    });

    if (isPlaying) {
      // Capture and send the frame
      const frame = await captureFrames(page, videoBox);
      if (frame) {
        ws.send(frame);
        console.log("Frame sent");
      }
    } else {
      console.log("Video paused or ended");
      clearInterval(captureInterval);
      ws.close();
      await browser.close();
    }
  }, FRAME_CAPTURE_INTERVAL);

  // Play the video
  await page.evaluate(() => {
    const video = document.querySelector("video");
    video.play();
  });
})();
