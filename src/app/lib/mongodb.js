import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGODB_URI; // Replace with your MongoDB URI

let client;
let clientPromise;

if (process.env.NODE_ENV === "production") {
  client = new MongoClient(MONGO_URI);
  clientPromise = client.connect();
} else {
  // In development, use a global client so the client is reused in hot reloading
  const globalForMongo = global;
  if (!globalForMongo._mongoClientPromise) {
    client = new MongoClient(MONGO_URI);
    globalForMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalForMongo._mongoClientPromise;
}

export async function connectToMongo() {
  const clientConnection = await clientPromise;
  return clientConnection.db("test");
}
