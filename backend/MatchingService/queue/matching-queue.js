import Queue from "bull";

// Initialize the Bull queue with Redis connection
const matchingQueue = new Queue("matching", "redis://127.0.0.1:6379");

// Process the queue
matchingQueue.process(1, async (job) => {
  // Simulate a processing delay (for testing purposes)

  try {
    // Check active jobs count
    // const waitingJobCount = await matchingQueue.getWaiting();
    // const delayedJobCount = await matchingQueue.getDelayed();

    // if (waitingJobCount < 1 && delayedJobCount < 1) {
    //   console.log("Queue is has not enough ppl. Pausing queue...");
    //   await job.moveToFailed({ message: "Not enough users to match" }, true);
    //   // await matchingQueue.pause();
    //   return;
    // }

    // Get delayed jobs first
    const delayedJobs = await matchingQueue.getDelayed();

    if (job.data.matched == true) {
      return "Job matched";
    }

    for (const delayedJob of delayedJobs) {
      // if found match
      if (job.data.topic == delayedJob.data.topic) {
        if (job.data.difficulty == delayedJob.data.difficulty) {
          console.log(
            `Matched users: ${job.data.username} and ${delayedJob.data.username}`
          );
          await delayedJob.promote();
          console.log("Match promoted");
          break;
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
              questionId: waitingJob.data.questionId,
              matched: true,
              matchedUser: job.data.username,
            },
            { lifo: true }
          );

          await waitingJob.remove();

          job.update({
            username: job.data.username,
            topic: job.data.topic,
            difficulty: job.data.difficulty,
            questionId: job.data.questionId,
            matched: true,
            matchedUser: waitingJob.data.username,
          });
          return "Job matched";
        }
      }
    }

    // unable to find match
    throw new Error("No user suitable for match, retrying...");
    // await job.moveToFailed({
    //   message: "No user suitable for match, retrying...",
    // });
  } catch (error) {
    console.error("Error processing job:", job.id, error);
    throw error; // Ensure errors are propagated to be handled by Bull
  }
});

matchingQueue.on("failed", (job, err) => {
  console.log(
    `Job failed attempt ${job.attemptsMade} out of ${job.opts.attempts}. Error: ${err.message}`
  );
});

// matchingQueue.on("waiting", async (job) => {
//   const isPaused = await matchingQueue.isPaused();
//   if (isPaused) {
//     console.log("Queue is paused. Resuming...");
//     await matchingQueue.resume();
//   }

//   return;
// });

export { matchingQueue };
