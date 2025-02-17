const mongoose = require("mongoose");

const connectToDb = () => {
  // Return a promise that resolves when the connection is successful
  return mongoose.connect("mongodb://mongodb:27017/video_frames", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = connectToDb;
