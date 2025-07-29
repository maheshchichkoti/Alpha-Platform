import { z } from "zod";

export const researchResultSchema = z.object({
  company_value_prop: z
    .string()
    .min(1, "Company value proposition is required."),
  product_names: z
    .array(z.string())
    .min(1, "At least one product name is required."),
  pricing_model: z.string().min(1, "Pricing model is required."),
  key_competitors: z
    .array(z.string())
    .min(1, "At least one competitor is required."),
  company_domain: z.string().url("A valid company domain URL is required."),
});

export type ResearchResult = z.infer<typeof researchResultSchema>;
