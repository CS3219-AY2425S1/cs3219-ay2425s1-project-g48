import { matchingQueue } from "../queue/matching-queue.js";

// matchingQueue.process(async (job) => {
//   try {
//     console.log("Processing job:", job.id);

//     const waiting_jobs = await matchingQueue.getWaiting();
//     console.log("Waiting jobs:", waiting_jobs.map(job => job.id));

//     if (waiting_jobs.length >= 2) {
//       const job1 = waiting_jobs[0];
//       const job2 = waiting_jobs[1];

//       // Mark both jobs as completed (they are matched)
//       await matchingQueue.getJob(job1.id).moveToCompleted();
//       await matchingQueue.getJob(job2.id).moveToCompleted();

//       console.log(`Matched users: ${job1.id} and ${job2.id}`);
//     } else {
//       console.log("Not enough users in the waiting queue to match.");
//     }
//   } catch (error) {
//     console.error("Error processing job:", job.id, error);
//     throw error; // Ensure errors are propagated to be handled by Bull
//   }
// });
