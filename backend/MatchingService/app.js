import { createClient } from "redis";
import express from "express";
import { createBullBoard } from "@bull-board/api";
import { ExpressAdapter } from "@bull-board/express";
import { BullAdapter } from "@bull-board/api/bullAdapter.js";

import { matchingQueue } from "./queue/matching-queue.js";
import {
  addUserToQueue,
  obliberateQueue,
} from "./controller/queue-controller.js";

const app = express();
const port = 3000;

// Set up bull dashboard for monitoring queue
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullAdapter(matchingQueue)],
  serverAdapter: serverAdapter,
});

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

app.post("/queue", addUserToQueue);

app.get("/remove", obliberateQueue);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// create api route to user to the queue

// create api route to check when user is done
