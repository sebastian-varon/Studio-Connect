const GroupMessage = require("../models/Message");

// Store chats in MongoDB
const saveMessage = async ({ from_user, room, message }) => {
  try {
    const newMessage = new GroupMessage({ from_user, room, message });
    await newMessage.save();
  } catch (error) {
    console.error("Error saving message:", error.message);
  }
};

// Get room chat history
const getRoomMessages = async (req, res) => {
  try {
    const { room } = req.params;
    const messages = await GroupMessage.find({ room }).sort({ date_sent: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving messages", error: error.message });
  }
};

module.exports = { saveMessage, getRoomMessages };