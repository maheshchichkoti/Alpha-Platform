import { enrichWorker } from "./jobs/enrich.worker";
import { log } from "./lib/logger";

// This log confirms the worker process itself has started.
log.info("Worker process started and is listening for jobs on the queue.");

/**
 * Sets up a graceful shutdown mechanism.
 * When the process receives a termination signal (e.g., from Docker),
 * it tells the BullMQ worker to stop accepting new jobs and wait for
 * the current active job to finish before exiting.
 */
const gracefulShutdown = async () => {
  log.info("SIGTERM signal received: closing worker gracefully...");
  try {
    // This is a BullMQ function that ensures a clean shutdown.
    await enrichWorker.close();
    log.info("Worker has been closed.");
  } catch (error) {
    log.error({ err: error }, "Error during worker shutdown.");
  }
  process.exit(0);
};

// Listen for signals that are commonly used to stop processes (e.g., by Docker or Ctrl+C)
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
