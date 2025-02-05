const express = require("express");
const { getRoomMessages } = require("../controllers/chatController");
const GroupMessage = require("../models/Message");

const router = express.Router();

router.get("/:room", getRoomMessages);

// Temporary route for testing message creation via Postman
router.post("/send", async (req, res) => {
    try {
      console.log("Received Data:", req.body);
  
      const { from_user, room, message } = req.body;
  
      if (!from_user || !room || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const newMessage = new GroupMessage({ from_user, room, message });
      await newMessage.save();
  
      console.log("Message saved to DB:", newMessage);
  
      res.status(201).json({ message: "Message stored successfully" });
    } catch (error) {
      console.error("Error saving message:", error.message);
      res.status(500).json({ message: "Error saving message", error: error.message });
    }
  });  
  

module.exports = router;