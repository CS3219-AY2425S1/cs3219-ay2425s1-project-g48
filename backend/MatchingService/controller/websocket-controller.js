import { Server } from "socket.io";
import { addUserToQueue } from "./queue-controller.js";
import { matchingQueue } from "../queue/matching-queue.js";
import axios from "axios";
let io;

export const initializeCollaborationService = (server) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
  io = new Server(server, {
    path: "/socket.io",
    cors: {
      origin: FRONTEND_URL,
      methods: ["GET", "POST"],
    },
  });

  // Middleware for token verification
  io.use(async (socket, next) => {
    const token = socket.handshake.query.token;

    if (!token) {
      return next(new Error("Authentication token is missing"));
    }

    try {
      // Verify the token
      await verifyToken(token); // Wait for the token verification to finish
      socket.token = token;
      next(); // Proceed with the connection
    } catch (error) {
      return next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

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

    // Handle message sending and broadcasting to other users
    socket.on("sendMessage", (messageData) => {
      const { room, message, username } = messageData;

      if (room === "") {
        // Broadcast the message to all other connected users
        socket.broadcast.emit("receiveMessage", {
          username: messageData.username,
          message: messageData.message,
        });
      } else {
        console.log(
          `User ${username} is sending a message to room ${room}: ${message}`
        );
        // Include the question ID from the room mapping when emitting the message
        const questionId = roomQuestionMapping[room];
        io.to(room).emit("receiveMessage", {
          username,
          message,
          questionId, // Include the associated question ID in the message
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

  if (!matchedUserSocket) {
    notifyUserOfMatchFailed(
      socketId,
      "Matched user disconnected, please try again",
      {}
    );
    return;
  }
  if (userSocket) {
    notifyUserOfMatchSuccess(socketId, userSocket, job);
  }
};

export const fetchQuestionId = async (topic, difficulty, socketId) => {
  const userSocket = io.sockets.sockets.get(socketId);
  try {
    const question_domain =
      process.env.QUESTION_SERVICE || "http://localhost:3002";
    const question_path = `${question_domain}/questions/matching`;
    const response = await axios.post(
      question_path,
      {
        category: topic,
        complexity: difficulty,
      },
      {
        headers: {
          Authorization: `Bearer ${userSocket.token}`, // Pass the token here
        },
      }
    );

    return response.data.question_id; // Return the fetched question ID
  } catch (error) {
    console.error("Error fetching question ID:", error);
    throw new Error("Failed to fetch question. Please try again."); // Throw an error to handle it at the call site
  }
};

// Token verification function
export const verifyToken = async (token) => {
  try {
    const user_domain = process.env.USER_SERVICE || "http://localhost:3001";

    // Construct the URL for the verify-token endpoint
    const verifyTokenUrl = `${user_domain}/auth/verify-token`;

    // Send a POST request with the token in the Authorization header (Bearer token)
    const response = await axios({
      method: "get",
      url: verifyTokenUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // Set Content-Type
      },
    });

    if (response.status !== 200) {
      throw new Error("Token verification failed");
    }

    return response.data;
  } catch (error) {
    console.error("Error verifying token:", error);
    throw new Error("Failed to verify token. Please try again.");
  }
};

export const notifyUserOfMatchSuccess = (socketId, socket, job) => {
  const { matchedUser, userNumber, matchedUserId, questionId } = job.data;

  const room =
    userNumber === 1
      ? `room-${socketId}-${matchedUserId}`
      : `room-${matchedUserId}-${socketId}`;
  socket.join(room);

  // Emit the matched event with the assigned question ID
  io.to(socketId).emit("matched", {
    message: `You have been matched with user: ${matchedUser}`,
    room,
    questionId, // Include the question ID in the response
  });
};

// Notify users when the match fails or times out
export const notifyUserOfMatchFailed = (socketId, message, data) => {
  io.to(socketId).emit("matchFailed", { error: message, content: data });
};
