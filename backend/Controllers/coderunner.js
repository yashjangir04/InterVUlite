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

  socket.on("join-room", (roomID) => {
    socket.join(roomID);
    console.log(`🛋️ ${socket.id} joined room ${roomID}`);
  });

  socket.on("code-change", ({ roomID, code }) => {
    socket.to(roomID).emit("code-update", code);
  });

  socket.on("input-change", ({ roomID, input }) => {
    socket.to(roomID).emit("input-update", input);
  });

  socket.on("output-change", ({ roomID, output }) => {
    socket.to(roomID).emit("output-update", output);
  });

  socket.on("title-change", ({ roomID, title }) => {
    socket.to(roomID).emit("title-update", title);
  });

  socket.on("desc-change", ({ roomID, desc }) => {
    socket.to(roomID).emit("desc-update", desc );
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("🚀 Socket.io server running on http://localhost:3001");
});
