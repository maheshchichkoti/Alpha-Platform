import { Queue } from "bullmq";
import { bullMqConnection } from "../lib/redis";

export const ENRICHMENT_QUEUE_NAME = "enrichment";

export const enrichmentQueue = new Queue(ENRICHMENT_QUEUE_NAME, {
  connection: bullMqConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});
