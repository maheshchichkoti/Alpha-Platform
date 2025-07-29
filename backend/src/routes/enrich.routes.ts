import { Router } from "express";
import { enrichmentQueue } from "../jobs/enrich.queue";
import { log } from "../lib/logger";
import { prisma } from "../lib/prisma";

export const enrichRouter = Router();

/**
 * @openapi
 * /enrich/{personId}:
 *   post:
 *     summary: Trigger a research agent for a person
 *     tags: [Enrichment]
 *     parameters:
 *       - in: path
 *         name: personId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the person to enrich.
 *     responses:
 *       202:
 *         description: The enrichment job has been enqueued.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobId:
 *                   type: string
 */
enrichRouter.post("/:personId", async (req, res, next) => {
  try {
    const { personId } = req.params;

    // Optional: Validate personId exists
    const person = await prisma.person.findUnique({ where: { id: personId } });
    if (!person) {
      return res.status(404).json({ message: "Person not found" });
    }

    const job = await enrichmentQueue.add("enrich-person", { personId });
    log.info({ jobId: job.id, personId }, "Enrichment job enqueued");

    res.status(202).json({ jobId: job.id });
  } catch (error) {
    next(error);
  }
});
