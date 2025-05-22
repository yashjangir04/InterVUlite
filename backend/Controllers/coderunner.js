const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"],
  },
});

const roomCodeMap = {}; // Store latest code per room

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`🛋️ ${socket.id} joined room ${roomId}`);
  });

  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-update", code);
  });

  socket.on("input-change", ({ roomId, input }) => {
    socket.to(roomId).emit("input-update", input);
  });

  socket.on("output-change", ({ roomId, output }) => {
    socket.to(roomId).emit("output-update", output);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("🚀 Socket.io server running on http://localhost:3001");
});
