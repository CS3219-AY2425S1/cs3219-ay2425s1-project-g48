import { matchingQueue } from "../queue/matching-queue.js";

export async function addUserToQueue(userData, socket) {
  try {
    // Check if the matching queue has socket id
    const queue = await matchingQueue.getJobs(["active", "waiting", "delayed"]);

    for (const job of queue) {
      if (job.data.username === userData.username) {
        return { message: "User already in queue" };
      }
    }

    await matchingQueue.add(
      {
        username: userData.username,
        topic: userData.topic,
        difficulty: userData.difficulty,
        // questionId: userData.questionId,
        socketId: socket.id,
        matched: false,
        matchedUser: "",
        matchedUserId: "",
        userNumber: 0,
      },
      {
        attempts: 7,
        backoff: {
          type: "fixed",
          delay: 10000,
        },
      }
    );

    return { message: "Sucessfully been added to queue" };
  } catch (err) {
    console.error("Error adding to queue:", err);
    throw new Error("Failed to add to queue");
  }
}

export async function addUserToQueueReq(req, res) {
  try {
    const userData = req.body;
    await matchingQueue.add(
      {
        username: userData.username,
        topic: userData.topic,
        difficulty: userData.difficulty,
        questionId: userData.questionId,
        matched: false,
        matchedUser: "",
      },
      {
        attempts: 6,
        backoff: {
          type: "fixed",
          delay: 10000,
        },
      }
    );

    return res.status(200).json({ message: "added to queue" });
  } catch (err) {
    console.error("Error adding to queue:", err);
    return res.status(500).json({ error: "Failed to add to queue" });
  }
}

export async function obliberateQueue() {
  try {
    await matchingQueue.obliterate({ force: true });
    return "Queue removed";
  } catch (err) {
    console.error("Error removing queue:", err);
    return "Failed to remove queue";
  }
}
