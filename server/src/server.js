const connectToDb = require("./db/db");
const startWsServer = require("./ws/ws-server");

// Connect to MongoDB
connectToDb()
  .then(() => console.log("Connected to db"))
  .catch((err) => console.error("Error connecting to db", err));

startWsServer(8080);
