import { researchResultSchema } from "../../src/schemas/researchResult.schema";

describe("ResearchResult Schema", () => {
  it("should validate a correct payload", () => {
    const validPayload = {
      company_value_prop: "Delivering excellence.",
      product_names: ["WidgetPro"],
      pricing_model: "Subscription",
      key_competitors: ["Globex Corp"],
      company_domain: "https://acme.com",
    };
    const result = researchResultSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("should fail validation if a required string field is missing", () => {
    const invalidPayload = {
      // company_value_prop is missing
      product_names: ["WidgetPro"],
      pricing_model: "Subscription",
      key_competitors: ["Globex Corp"],
      company_domain: "https://acme.com",
    };
    const result = researchResultSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it("should fail validation if a required array field is empty", () => {
    const invalidPayload = {
      company_value_prop: "Delivering excellence.",
      product_names: [], // Empty array
      pricing_model: "Subscription",
      key_competitors: ["Globex Corp"],
      company_domain: "https://acme.com",
    };
    const result = researchResultSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
