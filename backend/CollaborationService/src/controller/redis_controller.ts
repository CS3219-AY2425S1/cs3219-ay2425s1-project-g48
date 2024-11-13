import Redis from "ioredis";
import { ChangeSet, Text } from "@codemirror/state";
import { Update } from "@codemirror/collab";

export async function updateDocument(
  redisClient: Redis,
  roomId: string,
  changes: ChangeSet,
  update: any
) {
  // store updates as json in redis
  let updates = await redisClient.lpush(
    roomId + ":updates",
    JSON.stringify({
      changes,
      clientID: update.clientID,
    })
  );

  if (updates === null) {
    // socket can emit error here?
    return;
  }

  // find hash document
  const docText = await redisClient.hget(roomId + ":doc", "doc");

  if (docText === null) {
    // socket can emit error here?
    return;
  }

  // reconstruct document
  let roomDoc = Text.of(docText.split("\n"));

  // apply changes
  roomDoc = changes.apply(roomDoc);

  // store new document
  await redisClient.hset(roomId, ":doc", roomDoc.toString());
}

export async function retrieveUpdates(
  redisClient: Redis,
  roomId: string,
  version: number
): Promise<Update[]> {
  try {
    let updates = await redisClient.lrange(roomId + ":updates", version, -1);

    return updates.map((update) => JSON.parse(update));
  } catch (error) {
    throw new Error("Error retrieving updates");
  }
}

export async function initRoomStorage(redisClient: Redis, roomId: string) {
  const doc = await redisClient.hget(roomId + ":doc", "doc");

  if (doc == null) {
    await redisClient.hset(roomId + ":doc", {
      doc: "// Start writing your code here \n",
    });
  }
}

export async function updatePendingPulls() {}
