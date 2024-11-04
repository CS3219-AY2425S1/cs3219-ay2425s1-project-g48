// chat-service.js
import express from 'express';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
const chatPort = 8081; // Assign the chat service its own port

// Create an HTTP server to use with Socket.IO
const server = http.createServer(app);

// Set up the Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend origin
    methods: ["GET", "POST"],
  },
});

// Define what happens when a client connects to this server
io.on("connection", (socket) => {
  console.log(`Chat user connected: ${socket.id}`);

  // Listen for sendMessage events from clients
  socket.on("sendMessage", (messageData) => {
    const { room, message, username } = messageData;

    if (room === "") {
      // If no room specified, broadcast the message to all connected clients
      socket.broadcast.emit("receiveMessage", {
        username: messageData.username,
        message: messageData.message,
      });
    } else {
      // If a room is specified, join the room and broadcast the message to that room
      socket.join(room);
      console.log(`Chat user ${socket.id} joined room ${room}`);
      
      const questionId = roomQuestionMapping[room];
      // Emit the message to all clients in the same room
      io.to(room).emit("receiveMessage", {
        username,
        message,
        questionId,
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Chat user disconnected: ${socket.id}`);
  });
});

// Start the server
server.listen(chatPort, () => {
  console.log(`Chat service is running on http://localhost:${chatPort}`);
});
