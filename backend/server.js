const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("../config/db");
const setupSocket = require("./socketHandler");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Setup Socket.io handlers
setupSocket(io);

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", require("../routes/authRoutes"));
app.use("/api/chat", require("../routes/chatRoutes")); // Chat messages API

// Start Server
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));