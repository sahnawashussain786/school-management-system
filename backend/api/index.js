import app from "../app.js";
import connectDB from "../config/db.js";

// Lazily connect to MongoDB once per serverless instance. Every request
// awaits this before touching the database, so queries never buffer
// forever if cold-started concurrently.
let readyPromise = null;
const ensureDB = () => {
  if (!readyPromise) {
    readyPromise = connectDB().catch((err) => {
      // Reset so the next request can retry the connection
      readyPromise = null;
      throw err;
    });
  }
  return readyPromise;
};

export default async function handler(req, res) {
  try {
    await ensureDB();
  } catch (err) {
    console.error("Failed to connect to database:", err.message);
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Database unavailable, please retry" }));
    return;
  }
  return app(req, res);
}
