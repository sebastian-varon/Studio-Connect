const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Register
const registerUser = async (req, res) => {
  try {
    const { username, firstname, lastname, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: "Username already taken" });

    // Create user
    const newUser = new User({ username, firstname, lastname, password });
    await newUser.save();
    
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login 
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check user
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful!", user: { username: user.username, firstname: user.firstname, lastname: user.lastname } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { registerUser, loginUser };