import { Router } from "express";
import { createRedisClient } from "../lib/redis";
import { log } from "../lib/logger";

export const progressRouter = Router();

/**
 * @openapi
 * /progress/{jobId}:
 *   get:
 *     summary: Stream live progress for an enrichment job
 *     tags: [Enrichment]
 *     description: Establishes a Server-Sent Events (SSE) connection.
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job returned by the POST /enrich endpoint.
 *     responses:
 *       200:
 *         description: An event stream of progress updates.
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 */
progressRouter.get("/:jobId", (req, res) => {
  const { jobId } = req.params;
  const redisSubscriber = createRedisClient();
  const channel = `job-progress:${jobId}`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  redisSubscriber.subscribe(channel, (err) => {
    if (err) {
      log.error({ channel, err }, "Error subscribing to Redis channel");
      res.status(500).end();
      return;
    }
    log.info({ channel }, "Client subscribed to progress stream");
  });

  redisSubscriber.on("message", (ch, message) => {
    if (ch === channel) {
      res.write(`data: ${message}\n\n`);
    }
  });

  req.on("close", () => {
    log.info({ channel }, "Client disconnected, unsubscribing");
    redisSubscriber.unsubscribe(channel);
    redisSubscriber.quit();
    res.end();
  });
});
