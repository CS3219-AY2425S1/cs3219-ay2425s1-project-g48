import { Server, Socket } from "socket.io";
import { spawn } from "child_process";
import * as http from "http";
import { ChangeSet, Text } from "@codemirror/state";
import { Update } from "@codemirror/collab";
import express from "express";
import Redis from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";
import "dotenv/config";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World from Collaboration Service!");
});

// using ioredis for socket.io due to problems stated in documentation for socket io adapter
const redisClient = new Redis(
  process.env.ENV === "DEV"
    ? process.env.REDIS_URL || ""
    : "redis://127.0.0.1:6379"
);

redisClient.on("connect", () => {
  console.log("Connected to Redis:", process.env.REDIS_URL);
});

// create redis adapter for socket.io for horizontal scaling
const subClient = redisClient.duplicate();
const pubClient = redisClient.duplicate();

// functions to update redis storage

let io = new Server(server, {
  path: "/api",
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
  adapter: createAdapter(pubClient, subClient),
});

// The updates received so far (updates.length gives the current
// version)
let roomUpdates: { [key: string]: Update[] } = {};

// The current document
let roomDocs: { [key: string]: Text } = {};

// store pull update requests when version is newer than current
let pending: { [key: string]: ((value: any) => void)[] } = {};

// listening for connections from clients
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

  if (!roomUpdates[roomId]) {
    roomUpdates[roomId] = [];
  }

  if (!roomDocs[roomId]) {
    roomDocs[roomId] = Text.of(["Start document"]);
  }

  if(!pending[roomId]) {
    pending[roomId] = [];
  }

  console.log("roomUpdates", roomDocs[roomId].toString());

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

        while (pending[roomId].length) pending[roomId].pop()!(roomUpdates[roomId]);
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
});

const port = process.env.PORT || 8000;
// server.listen(port, () => console.log(`Server listening on port: ${port}`));

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});