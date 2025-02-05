const { saveMessage } = require("../controllers/chatController");

const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join Room
    socket.on("joinRoom", ({ username, room }) => {
      socket.join(room);
      console.log(`${username} joined room: ${room}`);
      io.to(room).emit("message", { user: "system", message: `${username} has joined the room` });
    });

    // Incoming Messages Handler
    socket.on("sendMessage", async ({ username, room, message }) => {
      io.to(room).emit("message", { user: username, message });

      // Save message to database
      await saveMessage({ from_user: username, room, message });
    });

    // Exit room
    socket.on("leaveRoom", ({ username, room }) => {
      socket.leave(room);
      console.log(`${username} left room: ${room}`);
      io.to(room).emit("message", { user: "system", message: `${username} has left the room` });
    });

    // Disconnect from server
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;