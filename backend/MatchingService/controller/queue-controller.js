import { matchingQueue } from "../queue/matching-queue.js";

export async function addUserToQueue(req, res) {
  try {
    const { username, topic, difficulty, questionId } = req.body;
    await matchingQueue.add(
      {
        username,
        topic,
        difficulty,
        questionId,
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
