import { MongoClient, Db, Collection } from "mongodb";
import { CustomerDoc } from "@/types/customer";
import { DealDoc } from "@/types/deal";
import { TaskDoc } from "@/types/task";

// Local MongoDB server by default — override with MONGODB_URI in .env.local
// if you're pointing at Atlas or a different host.
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const MONGODB_DB = process.env.MONGODB_DB ?? "greentiq_crm";

// Reuse the client/connection across hot-reloads in dev and across
// serverless invocations, instead of opening a new connection per request.
interface MongoCache {
  client: MongoClient | null;
  clientPromise: Promise<MongoClient> | null;
  customersSeeded: boolean;
  dealsIndexed: boolean;
  tasksIndexed: boolean;
}

declare global {
  var __mongoCache: MongoCache | undefined;
}

const cache: MongoCache = global.__mongoCache ?? {
  client: null,
  clientPromise: null,
  customersSeeded: false,
  dealsIndexed: false,
  tasksIndexed: false,
};
global.__mongoCache = cache;

async function getClient(): Promise<MongoClient> {
  if (cache.clientPromise) return cache.clientPromise;

  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 4000,
  });

  cache.clientPromise = client.connect().catch((err) => {
    // Reset so the next request can retry the connection instead of being
    // stuck forever on a rejected promise.
    cache.clientPromise = null;
    throw new Error(
      `Could not connect to MongoDB at ${MONGODB_URI}. Make sure a local MongoDB server is running (e.g. "mongod" or "brew services start mongodb-community"). Original error: ${
        (err as Error).message
      }`
    );
  });

  cache.client = await cache.clientPromise;
  return cache.client;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(MONGODB_DB);
}

export async function getCustomersCollection(): Promise<Collection<CustomerDoc>> {
  const db = await getDb();
  const collection = db.collection<CustomerDoc>("customers");

  if (!cache.customersSeeded) {
    cache.customersSeeded = true; // set eagerly to avoid a seeding race across concurrent requests
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ email: 1 });
    await collection.createIndex({ name: 1 });
    await collection.createIndex({ company: 1 });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ lastContactDate: -1 });
    // No static/mock seed data — the customers collection starts empty and
    // is populated only by real data the user adds or imports.
  }

  return collection;
}

export async function getDealsCollection(): Promise<Collection<DealDoc>> {
  const db = await getDb();
  const collection = db.collection<DealDoc>("deals");

  if (!cache.dealsIndexed) {
    cache.dealsIndexed = true;
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ stage: 1 });
    await collection.createIndex({ customerId: 1 });
    await collection.createIndex({ expectedCloseDate: 1 });
  }

  return collection;
}

export async function getTasksCollection(): Promise<Collection<TaskDoc>> {
  const db = await getDb();
  const collection = db.collection<TaskDoc>("tasks");

  if (!cache.tasksIndexed) {
    cache.tasksIndexed = true;
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ dueDate: 1 });
    await collection.createIndex({ relatedCustomerId: 1 });
  }

  return collection;
}
