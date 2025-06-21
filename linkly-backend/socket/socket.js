const http = require("http");
const { Server } = require("socket.io");
const express = require("express");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});

const getReceiverSocketId = (recipientId) => {
  return userSocketMap[recipientId];
};

const userSocketMap = {}; // TODO: add logic to get socket id from db

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }
  
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle new message events
  socket.on("sendMessage", (data) => {
    const { receiverId, message } = data;
    const receiverSocketId = getReceiverSocketId(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }
  });

  // Test event handler
  socket.on("test", (data) => {
    socket.emit("test", { message: "Test response from server", timestamp: new Date() });
  });

  socket.on("disconnect", (reason) => {
    if (userId && userId !== "undefined") {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

module.exports = { io, server, app, getReceiverSocketId };
