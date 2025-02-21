const puppeteer = require("puppeteer");
const Frame = require("../db/models/frame");

const VIDEO_URL =
  "https://brndts-public.s3.eu-west-2.amazonaws.com/technical-challenge.html";
const FRAME_CAPTURE_INTERVAL = 1000; // 1 frame per second

let browser = null;
let page = null;
let captureInterval = null;
let isCapturing = false;

const startPuppeteerCapture = async () => {
  if (isCapturing) {
    console.log("Capture already in progress.");
    return;
  }

  isCapturing = true;

  try {
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

    // Capture a frame every second
    captureInterval = setInterval(async () => {
      try {
        if (!page || page.isClosed()) {
          console.log("Page is closed. Stopping capture.");
          stopPuppeteerCapture();
          return;
        }

        // Check if the video is playing
        const isPlaying = await page.evaluate(() => {
          const video = document.querySelector("video");
          return video && !video.paused && !video.ended;
        });

        if (isPlaying) {
          await captureFrame(page, videoBox);
        } else {
          console.log("Video paused or ended.");
          stopPuppeteerCapture();
        }
      } catch (error) {
        console.error("Error capturing frame:", error);
        stopPuppeteerCapture();
      }
    }, FRAME_CAPTURE_INTERVAL);

    await page.evaluate(() => {
      const video = document.querySelector("video");
      if (video) video.play();
    });
  } catch (error) {
    console.error("Error starting Puppeteer capture:", error);
    isCapturing = false;
  }
};

const stopPuppeteerCapture = async () => {
  if (captureInterval) {
    clearInterval(captureInterval);
    captureInterval = null;
  }

  if (browser) {
    try {
      await browser.close();
      console.log("Browser closed.");
    } catch (error) {
      console.error("Error closing browser:", error);
    }
  }

  browser = null;
  page = null;
  isCapturing = false;
};

const captureFrame = async (page, videoBox) => {
  try {
    const frame = await page.screenshot({
      encoding: "binary",
      clip: {
        x: videoBox.x,
        y: videoBox.y,
        width: videoBox.width,
        height: videoBox.height,
      },
    });

    // Convert the frame to a Buffer and save it to the database
    const frameBuffer = Buffer.from(frame);
    await new Frame({ data: frameBuffer }).save();
    console.log("Frame saved to database");
  } catch (error) {
    console.error("Error capturing frame:", error);
  }
};

module.exports = { startPuppeteerCapture, stopPuppeteerCapture };
