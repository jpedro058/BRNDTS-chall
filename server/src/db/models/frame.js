const mongoose = require("mongoose");

const frameSchema = new mongoose.Schema({
  data: Buffer, // Store the frame data as a buffer
  timestamp: { type: Date, default: Date.now },
});

const Frame = mongoose.model("Frame", frameSchema);

module.exports = Frame;
