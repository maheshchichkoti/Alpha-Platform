import { Router } from "express";
// Correctly import the named export 'prisma'
import { prisma } from "../lib/prisma";

export const peopleRouter = Router();

/**
 * @openapi
 * /people:
 *   get:
 *     summary: Retrieve a list of people
 *     tags: [People]
 *     responses:
 *       200:
 *         description: A list of people with their associated company.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PersonWithCompany'
 */
peopleRouter.get("/", async (req, res, next) => {
  try {
    const people = await prisma.person.findMany({
      include: { company: true },
      orderBy: { createdAt: "asc" },
    });
    res.json(people);
  } catch (error) {
    next(error);
  }
});
