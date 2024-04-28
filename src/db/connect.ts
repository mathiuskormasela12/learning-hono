import mongoose from "mongoose";

export default async function dbConnect() {
  await mongoose.connect(String(Bun.env.MONGODB_URI), {
    dbName: 'test-hono'
  });
  console.info("MongoDB Connected Successfully");
}