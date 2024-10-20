import Queue from "bull";
import {
  handleUserMatch,
  notifyUserOfMatchFailed,
} from "../controller/websocket-controller.js";

// Initialize the Bull queue with Redis connection
const matchingQueue = new Queue("matching", {
  redis: {
    host:
      process.env.ENV == "PROD"
        ? process.env.REDIS_URL
        : process.env.REDIS_HOST,
    port: 6379,
    password: process.env.ENV == "PROD" && process.env.REDIS_PASSWORD,
  },
});

// Cleanup jobs from queue
setInterval(async () => {
  await matchingQueue.clean(10000, "completed"); // clear jobs completed for 10 seconds
  await matchingQueue.clean(10000, "failed");
}, 360000);

// Process the queue
matchingQueue.process(1, async (job) => {
  // Simulate a processing delay (for testing purposes)

  try {
    // Get delayed jobs first
    const delayedJobs = await matchingQueue.getDelayed();
    if (job.data.matched == true) {
      return "Job matched";
    }

    for (const delayedJob of delayedJobs) {
      // if found match
      if (job.data.topic == delayedJob.data.topic) {
        if (job.data.difficulty == delayedJob.data.difficulty) {
          await delayedJob.promote();
        }
      }
    }

    // Get the current waiting jobs in the queue
    const waitingJobs = await matchingQueue.getWaiting();

    for (const waitingJob of waitingJobs) {
      // if found match
      if (job.data.topic == waitingJob.data.topic) {
        if (job.data.difficulty == waitingJob.data.difficulty) {
          console.log(
            `Matched users: ${job.data.username} and ${waitingJob.data.username}`
          );

          // remove and add the matched job to the front of the queue
          await matchingQueue.add(
            {
              username: waitingJob.data.username,
              topic: waitingJob.data.topic,
              difficulty: waitingJob.data.difficulty,
              socketId: waitingJob.data.socketId,
              // questionId: waitingJob.data.questionId,
              matched: true,
              matchedUser: job.data.username,
              matchedUserId: job.data.socketId,
              userNumber: 2,
            },
            { lifo: true }
          );

          await waitingJob.remove();

          job.update({
            username: job.data.username,
            topic: job.data.topic,
            difficulty: job.data.difficulty,
            // questionId: job.data.questionId,
            socketId: job.data.socketId,
            matched: true,
            matchedUser: waitingJob.data.username,
            matchedUserId: waitingJob.data.socketId,
            userNumber: 1,
          });
          return "Job matched";
        }
      }
    }

    // unable to find match
    throw new Error("No user suitable for match, retrying...");
  } catch (error) {
    console.error("Error processing job:", job.id, error);
    throw error; // Ensure errors are propagated to be handled by Bull
  }
});

matchingQueue.on("failed", async (job, err) => {
  console.log(
    `Job failed attempt ${job.attemptsMade} out of ${job.opts.attempts}. Error: ${err.message}`
  );
  if (job.attemptsMade >= job.opts.attempts) {
    notifyUserOfMatchFailed(
      job.data.socketId,
      "Failed to find a match after multiple attempts."
    );
  }
});

matchingQueue.on("completed", async (job) => {
  console.log("User matched", job.data.username);
  handleUserMatch(job);
});

export { matchingQueue };
