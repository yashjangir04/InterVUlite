const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Change this to your frontend origin for security
  },
});

// In-memory store for rooms
const rooms = {};

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join room event
  socket.on("join-room", (roomID) => {
    const clientsInRoom = io.sockets.adapter.rooms.get(roomID);

    // Limit room to 2 users
    if (clientsInRoom && clientsInRoom.size >= 2) {
      console.log(`Room ${roomID} is full`);
      socket.emit("room-full");
      return;
    }

    socket.join(roomID);
    console.log(`Socket ${socket.id} joined room ${roomID}`);

    // Initialize room if not exist
    if (!rooms[roomID]) {
      rooms[roomID] = {
        code: "// Write your code in C++",
        input: "",
        output: "",
        title: "",
        desc: "",
        examples: [],
        hostId: socket.id,
      };
    }

    // Inform the joining socket if it is host
    const isHost = rooms[roomID].hostId === socket.id;
    socket.emit("host-status", isHost);

    // Send current room data to the joining socket
    socket.emit("code-update", rooms[roomID].code);
    socket.emit("input-update", rooms[roomID].input);
    socket.emit("output-update", rooms[roomID].output);
    socket.emit("title-update", rooms[roomID].title);
    socket.emit("desc-update", rooms[roomID].desc);
    socket.emit("examples-update", rooms[roomID].examples);
  });

  socket.on("code-change", ({ roomID, code }) => {
    if (rooms[roomID]) {
      rooms[roomID].code = code;
      socket.to(roomID).emit("code-update", code);
    }
  });

  socket.on("input-change", ({ roomID, input }) => {
    if (rooms[roomID]) {
      rooms[roomID].input = input;
      socket.to(roomID).emit("input-update", input);
    }
  });

  socket.on("output-change", ({ roomID, output }) => {
    if (rooms[roomID]) {
      rooms[roomID].output = output;
      socket.to(roomID).emit("output-update", output);
    }
  });

  socket.on("title-change", ({ roomID, title }) => {
    if (rooms[roomID]) {
      rooms[roomID].title = title;
      socket.to(roomID).emit("title-update", title);
    }
  });

  socket.on("desc-change", ({ roomID, desc }) => {
    if (rooms[roomID]) {
      rooms[roomID].desc = desc;
      socket.to(roomID).emit("desc-update", desc);
    }
  });

  socket.on("add-example", ({ roomID, examples }) => {
    if (rooms[roomID]) {
      rooms[roomID].examples = examples;
      io.in(roomID).emit("example-added", examples);
    }
  });

  socket.on("example-change", ({ roomID, index, field, value }) => {
    if (rooms[roomID] && rooms[roomID].examples[index]) {
      rooms[roomID].examples[index][field] = value;
      socket.to(roomID).emit("example-changed", { index, field, value });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);

    for (const roomID in rooms) {
      if (rooms[roomID].hostId === socket.id) {
        const clients = io.sockets.adapter.rooms.get(roomID);
        if (clients && clients.size > 0) {
          const newHostId = [...clients][0];
          rooms[roomID].hostId = newHostId;
          io.to(newHostId).emit("host-status", true);
        } else {
          delete rooms[roomID];
        }
      }
    }
  });
});

server.listen(3001, () => {
  console.log("Socket.io server running on port 3001");
});
