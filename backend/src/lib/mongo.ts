import { MongoClient } from "mongodb";
import { env } from "../config/env.js";

let mongoClient: MongoClient | null = null;
let indexesEnsured = false;

export async function getMongoClient() {
  if (!mongoClient) {
    mongoClient = new MongoClient(env.MONGODB_URI);
    await mongoClient.connect();
  }
  return mongoClient;
}

export async function getSessionsCollection() {
  const client = await getMongoClient();
  const db = client.db(env.MONGODB_DB);
  const collection = db.collection("sessions");

  if (!indexesEnsured) {
    await collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: env.SESSION_TTL_SECONDS });
    await collection.createIndex({ projectId: 1, sessionId: 1, page: 1 }, { unique: true });
    await collection.createIndex({ projectId: 1, sessionId: 1 });
    indexesEnsured = true;
  }

  return collection;
}
