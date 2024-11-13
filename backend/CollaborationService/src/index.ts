import { Server, Socket } from "socket.io";
import { spawn } from "child_process";
import * as http from "http";
import { ChangeSet, Text } from "@codemirror/state";
import { Update } from "@codemirror/collab";
import express from "express";
import Redis from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";
import "dotenv/config";
import axios from "axios";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World from Collaboration Service!");
});

// using ioredis for socket.io due to problems stated in documentation for socket io adapter
// const redisClient = new Redis(
//   process.env.ENV === "DEV"
//     ? process.env.REDIS_URL || ""
//     : "redis://127.0.0.1:6379"
// );

// redisClient.on("connect", () => {
//   console.log("Connected to Redis:", process.env.REDIS_URL);
// });

// create redis adapter for socket.io for horizontal scaling
// const subClient = redisClient.duplicate();
// const pubClient = redisClient.duplicate();

// functions to update redis storage

let io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
  // adapter: createAdapter(pubClient, subClient),
});

// The updates received so far (updates.length gives the current
// version)
let roomUpdates: { [key: string]: Update[] } = {};

// The current document
let roomDocs: { [key: string]: Text } = {};

// store pull update requests when version is newer than current
let pending: { [key: string]: ((value: any) => void)[] } = {};

// listening for connections from clients
let disconnectedUsers: { [roomId: string]: Set<string> } = {};

io.use(async (socket, next) => {
  const token = socket.handshake.query.token;

  if (!token) {
    return next(new Error("Authentication token is missing"));
  }

  try {
    // Verify the token
    await verifyToken(token); // Wait for the token verification to finish
    next();  // Proceed with the connection
  } catch (error) {
    return next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket: Socket) => {
  const roomId = socket.handshake.query.roomId;

  if (
    roomId === null ||
    roomId === undefined ||
    roomId === "" ||
    typeof roomId !== "string"
  ) {
    socket.disconnect();
    return;
  }

  socket.join(roomId);

  console.log("room size", io.sockets.adapter.rooms.get(roomId)?.size);

  console.log(`New connection: ${socket.id} joined room: ${roomId}`);

  // Notify all users in the room, including the newly connected user
  io.in(roomId).emit("newConnection", { userId: socket.id, roomId });

  if (!roomUpdates[roomId]) {
    roomUpdates[roomId] = [];
  }

  if (!roomDocs[roomId]) {
    roomDocs[roomId] = Text.of(["Start document"]);
  }

  if (!pending[roomId]) {
    pending[roomId] = [];
  }

  socket.on("pullUpdates", (version: number) => {
    if (version < roomUpdates[roomId].length) {
      socket.emit(
        "pullUpdateResponse",
        JSON.stringify(roomUpdates[roomId].slice(version))
      );
    } else {
      pending[roomId].push((updates) => {
        socket.emit(
          "pullUpdateResponse",
          JSON.stringify(updates.slice(version))
        );
      });
    }
  });

  socket.on("pushUpdates", (version, docUpdates) => {
    docUpdates = JSON.parse(docUpdates);

    try {
      if (version != roomUpdates[roomId].length) {
        socket.emit("pushUpdateResponse", false);
      } else {
        for (let update of docUpdates) {
          // Convert the JSON representation to an actual ChangeSet
          // instance
          let changes = ChangeSet.fromJSON(update.changes);
          roomUpdates[roomId].push({ changes, clientID: update.clientID });
          roomDocs[roomId] = changes.apply(roomDocs[roomId]);
        }
        socket.emit("pushUpdateResponse", true);

        while (pending[roomId].length)
          pending[roomId].pop()!(roomUpdates[roomId]);
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("getDocument", () => {
    socket.emit(
      "getDocumentResponse",
      roomUpdates[roomId].length,
      roomDocs[roomId].toString()
    );
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    socket.to(roomId).emit("userDisconnected", { userId: socket.id });

    if (io.sockets.adapter.rooms.get(roomId)?.size === undefined) {
      delete roomUpdates[roomId];
      delete roomDocs[roomId];
      delete pending[roomId];
    }
  });

  // Handle joining a chat room
  socket.on("joinRoom", ({ roomId, username }) => {
    if (roomId) {
      socket.join(roomId);
      socket.to(roomId).emit("userJoined", { username });
      console.log(`User ${username} joined chat room: ${roomId}`);
    }
  });

  // Handle sending a chat message
  socket.on("sendMessage", (messageData) => {
    const { room, message, username } = messageData;
    console.log(
      `Received message from ${username} in room ${
        room || "broadcast"
      }: ${message}`
    );
    if (room) {
      io.to(room).emit("receiveMessage", { username, message });
    } else {
      socket.broadcast.emit("receiveMessage", { username, message });
    }
  });

  // Handle ending a chat session
  socket.on("endSession", (roomId) => {
    console.log(`Session ended in room ${roomId}`);
    io.to(roomId).emit("leaveSession");
  });
});

// Token verification function
export const verifyToken = async (token : string | string[]) => {
  try {
    const user_domain = process.env.USER_SERVICE || "http://localhost:3001";
    
    // Construct the URL for the verify-token endpoint
    const verifyTokenUrl = `${user_domain}/auth/verify-token`;

    // Send a POST request with the token in the Authorization header (Bearer token)
    const response = await axios({
      method: 'get',
      url: verifyTokenUrl,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'  // Set Content-Type
      }
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

const port = process.env.PORT || 8000;
// server.listen(port, () => console.log(`Server listening on port: ${port}`));

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
