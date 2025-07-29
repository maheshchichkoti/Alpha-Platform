import pino from "pino";

// This setup creates a conditional transport.
// In development (when NODE_ENV is not 'production'), it uses 'pino-pretty'
// to make the logs human-readable in the console.
// In production, it defaults to standard, efficient JSON logging.
const transport =
  process.env.NODE_ENV !== "production"
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname", // Hides unnecessary details for local dev
        },
      }
    : undefined;

// Export the logger instance for use across the application.
export const log = pino({
  // The default log level is 'info'. Can be overridden by an env variable.
  level: process.env.LOG_LEVEL || "info",
  transport,
});
