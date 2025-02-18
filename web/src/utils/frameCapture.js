const path = require("node:path");
const fs = require("node:fs");

const FRAMES_DIR = path.join(__dirname, "../frames");

// Create frames directory if it doesn't exist
if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR);
}

/**
 * Capture a frame from the video on the page
 * @param {object} page - Puppeteer page object
 * @param {object} videoBox - Bounding box of the video element
 * @returns {Buffer} - Captured frame as a binary buffer
 */
async function captureFrames(page, videoBox) {
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

    // Save the frame locally
    const timestamp = Date.now();
    const framePath = path.join(FRAMES_DIR, `frame_${timestamp}.png`);
    fs.writeFileSync(framePath, frame);

    console.log(`Frame saved: ${framePath}`);
    return frame;
  } catch (error) {
    console.error("Error capturing frame:", error);
  }
}

module.exports = { captureFrames };
