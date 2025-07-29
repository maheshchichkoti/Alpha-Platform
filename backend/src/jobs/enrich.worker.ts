import { Worker } from "bullmq";
import { bullMqConnection, createRedisClient } from "../lib/redis";
import { ENRICHMENT_QUEUE_NAME } from "./enrich.queue";
import { log } from "../lib/logger";
import { ResearchAgent } from "../agent/ResearchAgent";

const processor = async (job: any) => {
  const { personId } = job.data;
  log.info({ jobId: job.id, personId }, "Starting enrichment job");
  const redisPublisher = createRedisClient();

  try {
    const publisher = (data: any) => {
      const channel = `job-progress:${job.id}`;
      redisPublisher.publish(channel, JSON.stringify(data));
    };

    const agent = new ResearchAgent(personId, publisher);
    await agent.run();
  } finally {
    redisPublisher.quit();
  }
};

export const enrichWorker = new Worker(ENRICHMENT_QUEUE_NAME, processor, {
  connection: bullMqConnection,
  concurrency: 5, // Process up to 5 jobs concurrently
});

enrichWorker.on("completed", (job) => {
  log.info({ jobId: job.id }, "Job completed successfully");
});

enrichWorker.on("failed", (job, err) => {
  log.error({ jobId: job?.id, error: err.message }, "Job failed");
});
