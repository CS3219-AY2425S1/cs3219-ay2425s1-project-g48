import { Server } from "socket.io";
import { addUserToQueue } from "./queue-controller.js";
import { matchingQueue } from "../queue/matching-queue.js";
import axios from 'axios';
let io;

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

    
      try {
        const resp = await addUserToQueue(userData, socket);
        socket.emit("queueEntered", resp);
      } catch (err) {
        console.error("Error adding user to queue:", err.message);
        socket.emit("joinQueueFailed", {
          error: "Failed to join the queue, please try again",
        });
      }
    
    });

    // // Handle message sending and broadcasting to other users
   
    // socket.on("sendMessage", (messageData) => {
    //   const { room, message, username } = messageData;

    //   if (room === "") {
    //     // Broadcast the message to all other connected users
    //     socket.broadcast.emit("receiveMessage", {
    //       username: messageData.username,
    //       message: messageData.message,
    //     });
    //   } else {
    //     socket.join(room); //The issue is here, solution is need join room 
        
    //     console.log(`User ${socket.id} joined room ${room}`);

    //     console.log(
    //       `User ${username} is sending a message to room ${room}: ${message}`
    //     );
    //     // Include the question ID from the room mapping when emitting the message
          //const questionId = roomQuestionMapping[room];
    //     io.to(room).emit("receiveMessage", {
    //       username,
    //       message,
            //questionId,
    
    //     });

    //   }
    // });

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

  if (!matchedUserSocket) {
    notifyUserOfMatchFailed(socketId, "Matched user disconnected, please try again");
    return;
  }

  
  if (userSocket) {
    notifyUserOfMatchSuccess(socketId, userSocket, job);
  }
};

export const fetchQuestionId = async (topic, difficulty) => {
  try {
    const response = await axios.post('http://question_service:3002/questions/matching', {
      category: topic,
      complexity: difficulty,
    });

    return response.data.question_id; // Return the fetched question ID
  } catch (error) {
    console.error("Error fetching question ID:", error);
    throw new Error("Failed to fetch question. Please try again."); // Throw an error to handle it at the call site
  }
};


export const notifyUserOfMatchSuccess = (socketId, socket, job) => {
  const { matchedUser, userNumber, matchedUserId, questionId} = job.data;

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
