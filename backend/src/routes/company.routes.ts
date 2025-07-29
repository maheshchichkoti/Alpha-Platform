import { Router } from "express";
import { prisma } from "../lib/prisma";

export const companyRouter = Router();

/**
 * @openapi
 * /company/{companyId}/snippets:
 *   get:
 *     summary: Retrieve all context snippets for a company
 *     tags: [Snippets]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the company.
 *     responses:
 *       200:
 *         description: A list of context snippets.
 */
companyRouter.get("/:companyId/snippets", async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const snippets = await prisma.contextSnippet.findMany({
      where: { entityType: "company", entityId: companyId },
      orderBy: { createdAt: "desc" },
    });
    res.json(snippets);
  } catch (error) {
    next(error);
  }
});
