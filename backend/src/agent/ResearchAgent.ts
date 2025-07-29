import { prisma } from "../lib/prisma";
import { log } from "../lib/logger";
import {
  researchResultSchema,
  ResearchResult,
} from "../schemas/researchResult.schema";
import { SearchProvider, SearchResult } from "./searchProvider";
import { getSearchProvider } from "./searchProvider";

type ProgressPublisher = (data: {
  step: string;
  message: string;
  [key: string]: any;
}) => void;

type ResearchFields = Partial<ResearchResult>;

export class ResearchAgent {
  private provider: SearchProvider;
  // THIS IS THE FIX: Increase maxIterations to allow for more searches.
  private maxIterations = 5;
  private requiredFields: (keyof ResearchResult)[] = [
    "company_value_prop",
    "product_names",
    "pricing_model",
    "key_competitors",
    "company_domain",
  ];

  constructor(
    private personId: string,
    private publishProgress: ProgressPublisher
  ) {
    this.provider = getSearchProvider();
  }

  async run(): Promise<void> {
    this.publishProgress({
      step: "start",
      message: "Fetching initial data...",
    });

    const person = await prisma.person.findUnique({
      where: { id: this.personId },
      include: { company: true },
    });

    if (!person) {
      const message = "Person not found.";
      this.publishProgress({ step: "error", message });
      throw new Error(message);
    }

    if (!person.company) {
      const message = "Person has no associated company.";
      this.publishProgress({ step: "error", message });
      throw new Error(message);
    }

    const { company } = person;
    const companyName = company.name || "Unknown Company";
    const companyDomain = company.domain || "";

    if (!companyDomain) {
      const message = "Company domain is required for research.";
      this.publishProgress({ step: "error", message });
      throw new Error(message);
    }

    let fields: ResearchFields = { company_domain: companyDomain };
    const allSourceUrls = new Set<string>();
    const allQueries: { iteration: number; query: string; topResults: any }[] =
      [];

    for (let i = 0; i < this.maxIterations; i++) {
      const missing = this.getMissingFields(fields);
      if (missing.length === 0) {
        this.publishProgress({
          step: "info",
          message: "All required fields found.",
        });
        break;
      }

      const query = this.buildQuery(companyName, companyDomain, missing);
      this.publishProgress({
        step: "search",
        message: `Searching for: ${missing.join(", ")}`,
        query,
        iteration: i + 1,
      });

      const results = await this.provider.search(query);
      results.forEach((r) => allSourceUrls.add(r.url));
      allQueries.push({
        iteration: i + 1,
        query,
        topResults: results.map((r) => r.url),
      });

      fields = this.extractFields(results, fields);
    }

    this.publishProgress({
      step: "validation",
      message: "Validating final payload...",
    });

    const finalPayload = this.cleanPayload(fields);
    const validation = researchResultSchema.safeParse(finalPayload);

    if (!validation.success) {
      const message = "Payload validation failed after research.";
      this.publishProgress({
        step: "error",
        message,
        errors: validation.error.flatten(),
      });
      // Use the full error message for better logging
      throw new Error(
        `${message}: ${JSON.stringify(validation.error.flatten(), null, 2)}`
      );
    }

    const snippet = await prisma.contextSnippet.create({
      data: {
        entityType: "company",
        entityId: company.id,
        payload: validation.data as any,
        sourceUrls: { urls: Array.from(allSourceUrls) },
        searchLogs: { create: allQueries },
      },
    });

    this.publishProgress({
      step: "complete",
      message: "Enrichment complete!",
      snippetId: snippet.id,
    });

    log.info(
      { personId: this.personId, snippetId: snippet.id },
      "Agent run completed successfully."
    );
  }

  private getMissingFields(fields: ResearchFields): (keyof ResearchResult)[] {
    return this.requiredFields.filter((f) => {
      const value = fields[f];
      return (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      );
    });
  }

  private buildQuery(
    companyName: string,
    domain: string,
    missing: string[]
  ): string {
    const keyword = missing[0].replace(/_/g, " ");
    // THIS IS THE FIX: Strip the protocol and www. for a cleaner search query.
    const searchDomain = domain
      .replace(/^(?:https|http):\/\/(?:www\.)?/, "")
      .split("/")[0];
    return `"${companyName}" ${keyword} site:${searchDomain}`;
  }

  private extractFields(
    results: SearchResult[],
    fields: ResearchFields
  ): ResearchFields {
    const textCorpus = results.map((r) => r.snippet.toLowerCase()).join(" \n ");
    const newFields = { ...fields };

    if (!newFields.company_value_prop) {
      const propSnippet = results.find((r) =>
        r.snippet.toLowerCase().includes("value proposition")
      )?.snippet;
      if (propSnippet) newFields.company_value_prop = propSnippet;
    }

    if (!newFields.pricing_model) {
      const pricingSnippet = results.find((r) =>
        r.snippet.toLowerCase().includes("pricing")
      )?.snippet;
      if (pricingSnippet) newFields.pricing_model = pricingSnippet;
    }

    if (!newFields.product_names || newFields.product_names.length === 0) {
      const productsMatch = textCorpus.match(/products include (.*?)\./);
      if (productsMatch && productsMatch[1]) {
        newFields.product_names = productsMatch[1]
          .split(",")
          .map((s) => s.trim());
      }
    }

    if (!newFields.key_competitors || newFields.key_competitors.length === 0) {
      const competitorsMatch = textCorpus.match(/competitors are (.*?)\./);
      if (competitorsMatch && competitorsMatch[1]) {
        newFields.key_competitors = competitorsMatch[1]
          .split(",")
          .map((s) => s.trim());
      }
    }

    return newFields;
  }

  private cleanPayload(fields: ResearchFields): ResearchResult {
    return {
      company_value_prop: fields.company_value_prop?.trim() || "",
      product_names: Array.from(new Set(fields.product_names || [])),
      pricing_model: fields.pricing_model?.trim() || "",
      key_competitors: Array.from(new Set(fields.key_competitors || [])),
      company_domain: fields.company_domain?.trim() || "",
    };
  }
}
