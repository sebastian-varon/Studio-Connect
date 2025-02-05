const socket = io("http://localhost:5050"); // Connect to backend
const rooms = ["drummachines", "synths&modular", "daw-wars", "groovemachines", "mixing&mastering", "fx&processing", "kickdesign", "acid&303", "samples&textures", "live&dj"];

const roomList = document.getElementById("roomList");
const messageInput = document.getElementById("messageInput");
const messagesDiv = document.getElementById("messages");
const sendMessageBtn = document.getElementById("sendMessage");
const leaveRoomBtn = document.getElementById("leaveRoom");
const roomTitle = document.getElementById("room-title");

const typingIndicator = document.createElement("div"); // Create typing indicator dynamically
typingIndicator.id = "typingIndicator";
typingIndicator.style.fontStyle = "italic";
typingIndicator.style.color = "#ff0000";

let currentRoom = null;
let user = JSON.parse(localStorage.getItem("user"));

let typingTimer;
let isTyping = false;

if (!user) {
    window.location.href = "login.html"; // Redirect if not logged in
}

// Populate Room List
rooms.forEach(room => {
    const li = document.createElement("li");
    li.textContent = room;
    li.onclick = () => joinRoom(room);
    roomList.appendChild(li);
});

// Join a Room
function joinRoom(room) {
    if (currentRoom) {
        socket.emit("leaveRoom", { username: user.username, room: currentRoom });
    }

    currentRoom = room;
    messagesDiv.innerHTML = ""; // Clear previous messages
    roomTitle.textContent = `Room: ${room}`;
    socket.emit("joinRoom", { username: user.username, room });

    fetchMessages(room);
}

// Fetch Chat History
async function fetchMessages(room) {
    const res = await fetch(`http://localhost:5050/api/chat/${room}`);
    const messages = await res.json();

    messages.forEach(({ from_user, message }) => {
        displayMessage(from_user, message);
    });
}

// Send Message (Fixed)
sendMessageBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevents line break
        sendMessage();
    }
});

function sendMessage() {
    if (messageInput.value.trim() === "" || !currentRoom) return;

    const messageData = {
        username: user.username,
        room: currentRoom,
        message: messageInput.value
    };

    socket.emit("sendMessage", messageData); // Send message to backend
    messageInput.value = "";
}

// Receive Messages in Real-Time (Fixed)
socket.on("message", ({ user, message }) => {
    displayMessage(user, message);
});

// Display Message Function (Auto-scroll fix)
function displayMessage(sender, message) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<strong>${sender}:</strong> ${message}`;
    messagesDiv.appendChild(div);

    // Move Typing Indicator Below Last Message
    messagesDiv.appendChild(typingIndicator);

    // Auto-scroll to the latest message
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Leave Room
leaveRoomBtn.addEventListener("click", () => {
    if (currentRoom) {
        socket.emit("leaveRoom", { username: user.username, room: currentRoom });
        currentRoom = null;
        roomTitle.textContent = "Select a Room";
        messagesDiv.innerHTML = "";
    }
});

// Typing Indicator Logic
messageInput.addEventListener("input", () => {
    if (!isTyping && currentRoom) {
        socket.emit("typing", { username: user.username, room: currentRoom });
        isTyping = true;
    }

    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        socket.emit("stopTyping", { room: currentRoom });
        isTyping = false;
    }, 2000);
});

// Show Typing Indicator Below Last Message
socket.on("userTyping", (username) => {
    typingIndicator.textContent = `${username} is typing...`;
    messagesDiv.appendChild(typingIndicator);
});

// Hide Typing Indicator When User Stops
socket.on("userStoppedTyping", () => {
    typingIndicator.textContent = "";
});