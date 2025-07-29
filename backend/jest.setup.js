const dotenv = require("dotenv");
const path = require("path");

console.log("[Jest Setup] Starting setup...");
console.log("[Jest Setup] Current working directory:", process.cwd());

// Resolve .env path explicitly
const envPath = path.resolve(process.cwd(), ".env");
console.log("[Jest Setup] Loading environment variables from:", envPath);

// Load environment variables
dotenv.config({ path: envPath });

// Verify critical variables
console.log(
  "[Jest Setup] DATABASE_URL:",
  process.env.DATABASE_URL ? "*****" : "NOT FOUND!"
);
console.log(
  "[Jest Setup] REDIS_URL:",
  process.env.REDIS_URL ? "*****" : "NOT FOUND!"
);
console.log("[Jest Setup] NODE_ENV:", process.env.NODE_ENV);

// Add any other global test setup here
console.log("[Jest Setup] Completed successfully");
