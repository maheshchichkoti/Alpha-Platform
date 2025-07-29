import { Router } from "express";
import { prisma } from "../lib/prisma";
import { bullMqConnection } from "../lib/redis";

export const healthzRouter = Router();

/**
 * @openapi
 * /healthz:
 *   get:
 *     summary: Check the health of the service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy.
 *       503:
 *         description: Service is unhealthy.
 */
healthzRouter.get("/", async (req, res) => {
  try {
    // Check database connectivity
    const dbStatus = await prisma.$queryRaw`SELECT 1`.then(() => "ok");

    // Check Redis connectivity
    const redisStatus = await bullMqConnection
      .ping()
      .then((r) => (r === "PONG" ? "ok" : "error"));

    const checks = { db: dbStatus, redis: redisStatus };
    const isHealthy = Object.values(checks).every((status) => status === "ok");

    if (isHealthy) {
      res.status(200).json({ status: "ok", checks });
    } else {
      res.status(503).json({ status: "unhealthy", checks });
    }
  } catch (e: any) {
    res.status(503).json({ status: "unhealthy", error: e.message });
  }
});
