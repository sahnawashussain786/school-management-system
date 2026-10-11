import mongoose from "mongoose";

const connectDB = async () => {
  // Read MONGO_URI here, not at module scope: this module is imported before
  // dotenv.config() runs (ES module imports are hoisted), so a module-level
  // `const uri` would permanently lock in the localhost fallback in dev.
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/schoolms";
  mongoose.set("strictQuery", true);

  // In serverless environments, try to reuse connection
  if (process.env.VERCEL && globalThis.__mongooseConn) {
    console.log("✅ MongoDB reused connection");
    return globalThis.__mongooseConn;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      maxPoolSize: 10,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    if (process.env.VERCEL) {
      globalThis.__mongooseConn = conn;
    }
    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
};

export default connectDB;
