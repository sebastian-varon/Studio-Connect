const { saveMessage } = require("../controllers/chatController");

const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Join Room
    socket.on("joinRoom", ({ username, room }) => {
      if (!username || !room) return;

      socket.join(room);
      console.log(`📢 ${username} joined room: ${room}`);

      // Notify others in the room
      socket.to(room).emit("message", { user: "system", message: `${username} has joined the room` });

      // Confirm to the sender they have joined
      socket.emit("message", { user: "system", message: `You joined ${room}` });
    });

    // Handle Typing Event
    socket.on("typing", ({ username, room }) => {
      if (room) {
        console.log(`✍️ ${username} is typing in ${room}`);
        socket.to(room).emit("userTyping", username);
      }
    });

    // Handle Stop Typing Event
    socket.on("stopTyping", ({ room }) => {
      if (room) {
        console.log(`🛑 Typing stopped in ${room}`);
        socket.to(room).emit("userStoppedTyping");
      }
    });

    // Handle Incoming Messages
    socket.on("sendMessage", async ({ username, room, message }) => {
      if (!username || !room || !message.trim()) return;

      console.log(`💬 ${username} sent a message in ${room}: "${message}"`);

      // Broadcast message to all users in the room EXCEPT the sender
      socket.to(room).emit("message", { user: username, message });

      // Send message only once to the sender
      socket.emit("message", { user: username, message });

      // Save message to database
      try {
        await saveMessage({ from_user: username, room, message });
      } catch (error) {
        console.error(`❌ Error saving message: ${error.message}`);
      }
    });

    // Handle Leaving Room
    socket.on("leaveRoom", ({ username, room }) => {
      if (room) {
        socket.leave(room);
        console.log(`🚪 ${username} left room: ${room}`);
        socket.to(room).emit("message", { user: "system", message: `${username} has left the room` });

        // Notify the user that they left the room
        socket.emit("message", { user: "system", message: `You left ${room}` });
      }
    });

    // Handle Disconnection
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;