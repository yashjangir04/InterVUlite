// server.js (or wherever your socket.io server is)
const io = require("socket.io")(3001, {
  cors: {
    origin: "*", // adjust for your frontend origin
  },
});

const rooms = {}; // key: roomID, value: { hostId: socketId, clients: Set<socketId> }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomID) => {
    socket.join(roomID);

    if (!rooms[roomID]) {
      // First user in the room is the host
      rooms[roomID] = { hostId: socket.id, clients: new Set() };
      console.log(`Room ${roomID} created, host is ${socket.id}`);
    }

    rooms[roomID].clients.add(socket.id);

    // Notify the new client if they are the host or not
    const isHost = rooms[roomID].hostId === socket.id;
    socket.emit("host-status", isHost);

    // Optionally broadcast to others who is the host (if needed)
  });

  socket.on("title-change", ({ roomID, title }) => {
    if (rooms[roomID]?.hostId === socket.id) {
      // Only accept title changes from host
      socket.to(roomID).emit("title-update", title);
    }
  });

  socket.on("desc-change", ({ roomID, desc }) => {
    if (rooms[roomID]?.hostId === socket.id) {
      socket.to(roomID).emit("desc-update", desc);
    }
  });

  socket.on("code-change", ({ roomID, code }) => {
    socket.to(roomID).emit("code-update", code);
  });

  socket.on("input-change", ({ roomID, input }) => {
    socket.to(roomID).emit("input-update", input);
  });

  socket.on("disconnect", () => {
    // Remove from all rooms
    for (const roomID in rooms) {
      rooms[roomID].clients.delete(socket.id);
      if (rooms[roomID].hostId === socket.id) {
        // Host left, assign new host if possible
        const clients = Array.from(rooms[roomID].clients);
        if (clients.length > 0) {
          rooms[roomID].hostId = clients[0];
          io.to(clients[0]).emit("host-status", true); // notify new host
          console.log(`Host left. New host of room ${roomID} is ${clients[0]}`);
        } else {
          // No clients left, delete room
          delete rooms[roomID];
          console.log(`Room ${roomID} deleted as no clients left.`);
        }
      }
    }
    console.log("User disconnected:", socket.id);
  });
});
