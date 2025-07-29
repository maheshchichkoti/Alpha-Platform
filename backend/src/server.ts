import app from "./app";
import { log } from "./lib/logger";
import { bullMqConnection } from "./lib/redis";

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  log.info(`Server running on http://localhost:${PORT}`);
});

const gracefulShutdown = () => {
  log.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    log.info("HTTP server closed");
    bullMqConnection.quit(); // Close redis connections
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
