import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { enrichmentQueue } from "../../src/jobs/enrich.queue";
import { bullMqConnection } from "../../src/lib/redis";
import { Person, Company, Campaign } from "@prisma/client";

// Utility function to wait for job completion
const waitForJobCompletion = (
  jobId: string,
  timeout = 15000
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(async () => {
      if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error(`Timeout waiting for job ${jobId} to complete`));
        return;
      }

      const job = await enrichmentQueue.getJob(jobId);
      if (!job) return;

      if (await job.isCompleted()) {
        clearInterval(interval);
        resolve();
      } else if (await job.isFailed()) {
        clearInterval(interval);
        reject(new Error(`Job ${jobId} failed. Reason: ${job.failedReason}`));
      }
    }, 500);
  });
};

describe("Enrichment Flow (Integration)", () => {
  let person: Person;
  let company: Company;
  let campaign: Campaign;

  beforeAll(async () => {
    await enrichmentQueue.drain(true);
    await prisma.campaign.deleteMany({});

    campaign = await prisma.campaign.create({
      data: {
        name: "Test Campaign",
        companies: {
          create: {
            name: "Test Corp",
            domain: "https://acme.com",
            people: {
              create: {
                fullName: "Test User",
                email: "test@acme.com",
                title: "Tester",
              },
            },
          },
        },
      },
      include: { companies: { include: { people: true } } },
    });

    company = campaign.companies[0];
    person = company.people[0];
  });

  afterAll(async () => {
    await prisma.campaign.deleteMany({});
    await enrichmentQueue.close();
    await bullMqConnection.quit();
    await prisma.$disconnect();
  });

  it("should run the full enrichment flow and save a context snippet to the database", async () => {
    const res = await request(app).post(`/enrich/${person.id}`).send();
    expect(res.status).toBe(202);
    expect(res.body).toHaveProperty("jobId");
    const { jobId } = res.body;

    await waitForJobCompletion(jobId);

    const snippet = await prisma.contextSnippet.findFirst({
      where: { entityType: "company", entityId: company.id },
      orderBy: { createdAt: "desc" },
    });

    expect(snippet).not.toBeNull();
    expect(snippet?.entityId).toBe(company.id);

    const payload = snippet?.payload as any;
    expect(payload.company_domain).toEqual("https://acme.com");

    // THE FIX: Check for the lowercase versions that the agent correctly extracts.
    expect(payload.product_names).toContain("widgetpro");
    expect(payload.key_competitors).toContain("stark industries");
  }, 20000);
});
