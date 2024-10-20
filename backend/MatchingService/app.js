import { createClient } from "redis";
import express from "express";
import { createBullBoard } from "@bull-board/api";
import { ExpressAdapter } from "@bull-board/express";
import { BullAdapter } from "@bull-board/api/bullAdapter.js";
import "dotenv/config";

import { matchingQueue } from "./queue/matching-queue.js";
import {
  addUserToQueue,
  addUserToQueueReq,
  obliberateQueue,
} from "./controller/queue-controller.js";
import http from "http";
import cors from "cors";
import { initializeCollaborationService } from "./controller/websocket-controller.js"; // Adjusted path

const app = express();
const port = 3000;

// Set up bull dashboard for monitoring queue
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullAdapter(matchingQueue)],
  serverAdapter: serverAdapter,
});

// Uncomment and configure the Redis client if needed
// const client = createClient({
//   password: "Wn0eVNObgsDyQkJVKcTJfpHogb7VDZ5s",
//   socket: {
//     host: "redis-18807.c337.australia-southeast1-1.gce.redns.redis-cloud.com",
//     port: 18807,
//   },
// });

// client.on("error", (err) => console.log("Redis Client Error", err));

// await client.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/admin/queues", serverAdapter.getRouter());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/queue", addUserToQueueReq);

app.get("/remove", obliberateQueue);

// Create an HTTP server to use with Socket.IO
const server = http.createServer(app);

// Enable CORS for your API
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true, // Set to true if you are using credentials (cookies, etc.)
  })
);

// Initialize the collaboration service
initializeCollaborationService(server);

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
