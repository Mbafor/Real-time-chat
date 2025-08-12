// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public")); // Serve frontend files from "public" folder

// Store messages in memory
let messages = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle new chat messages
  socket.on("chat message", (data) => {
    const messageData = {
      id: Date.now() + "_" + Math.random().toString(36).slice(2, 9),
      user: data.user,
      text: data.text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent"
    };

    // Save in memory
    messages.push(messageData);

    // Send message to everyone
    io.emit("chat message", messageData);

    // Simulate "delivered" after 500ms
    setTimeout(() => {
      messageData.status = "delivered";
      io.emit("message status", { id: messageData.id, status: "delivered" });
    }, 500);
  });

  // Handle read receipts
  socket.on("read message", (id) => {
    const msg = messages.find(m => m.id === id);
    if (msg) {
      msg.status = "read";
      io.emit("message status", { id, status: "read" });
    }
  });

  // Handle typing indicator
  socket.on("typing", (user) => {
    socket.broadcast.emit("typing", user);
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
