import { Server } from "socket.io";
import { addUserToQueue } from "./queue-controller.js";
import { matchingQueue } from "../queue/matching-queue.js";
import axios from 'axios';
let io;

// Set up socket.io and handle user interactions
export const initializeCollaborationService = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.emit("testMessage", { message: "Hello from backend!" });

   


    // Handle user joining the queue
    socket.on("joinQueue", async (userData) => {
      socket.emit("assignSocketId", { socketId: socket.id });

      // Add the user to the matching queue with socketId for later communication
      try {
        console.log(userData)
        const resp = await addUserToQueue(userData, socket);
        socket.emit("queueEntered", resp);
      } catch (err) {
        console.error("Error adding user to queue:", err.message);
        socket.emit("joinQueueFailed", {
          error: "Failed to join the queue, please try again",
        });
      }
      // Notify the user they've joined the queue
    });

    // Handle message sending and broadcasting to other users
    // Handle sending a message to a room
    socket.on("sendMessage", (messageData) => {
      const { room, message, username } = messageData;

      if (room == "") {
        // Broadcast the message to all other connected users
        socket.broadcast.emit("receiveMessage", {
          username: messageData.username,
          message: messageData.message,
        });
      } else {
        socket.join(room); //The issue is here, solution is need join room 
        
        console.log(`User ${socket.id} joined room ${room}`);

        console.log(
          `User ${username} is sending a message to room ${room}: ${message}`
        );
        // Send the message to all users in the same room
        io.to(room).emit("receiveMessage", {
          username,
          message,
        });

      }
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      const currentJobs = await matchingQueue.getJobs([
        "active",
        "waiting",
        "delayed",
      ]);

      for (const job of currentJobs) {
        if (job.data.socketId === socket.id) {
          await job.remove();
          console.log(`User ${socket.id} removed from queue`);
        }
      }

      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export const handleUserMatch = async (job) => {
  const { socketId, matchedUserId } = job.data;
  const userSocket = io.sockets.sockets.get(socketId);
  const matchedUserSocket = io.sockets.sockets.get(matchedUserId);

  // Check if matched user socket is available
  if (matchedUserSocket === undefined) {
    notifyUserOfMatchFailed(
      socketId,
      "Matched user disconnected, please try again"
    );
    
    return;
  }

  // Proceed if user socket is valid
  if (userSocket) {
    // Call the question service to assign a question
    try {
      const response = await axios.post('http://question_service:3002/questions/matching', {
        category: job.data.topic,
        complexity: job.data.difficulty,
      });
      console.log(response.data); // Handle the response

      // Notify user of match success and provide the assigned question ID
      notifyUserOfMatchSuccess(socketId, userSocket, job, response.data.question_id);
    } catch (error) {
      console.error("Error assigning question:", error);
      notifyUserOfMatchFailed(socketId, "Error assigning question. Please try again.");
    }
  }
};


// Update the notifyUserOfMatchSuccess to also accept the question ID
export const notifyUserOfMatchSuccess = (socketId, socket, job, questionId) => {
  const { matchedUser, userNumber, matchedUserId } = job.data;

  const room =
    userNumber === 1
      ? `room-${socketId}-${matchedUserId}`
      : `room-${matchedUserId}-${socketId}`;
      
  

  // Emit the matched event with the assigned question ID
  io.to(socketId).emit("matched", {
    message: `You have been matched with user: ${matchedUser}`,
    room,
    questionId, // Include the question ID in the response
  });

  socket.join(room);
  console.log(`User ${socket.id} joined room ${room}`);
};

// Notify users when the match fails or times out
export const notifyUserOfMatchFailed = (socketId, message) => {
  io.to(socketId).emit("matchFailed", { error: message });
};
