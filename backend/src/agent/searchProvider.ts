import { log } from "../lib/logger";

export interface SearchResult {
  url: string;
  snippet: string;
}

export interface SearchProvider {
  search(query: string): Promise<SearchResult[]>;
}

export class MockSearchProvider implements SearchProvider {
  private mockData: Record<string, any> = {
    "acme.com": {
      company_value_prop:
        "Our company value proposition is to deliver excellence and innovation for enterprise clients.",
      pricing_model:
        "Our pricing is subscription-based, with tiers for different business sizes.",
      product_names: ["WidgetPro", "WidgetLite", "SuperWidget"],
      key_competitors: ["Globex Inc", "Stark Industries", "Wayne Enterprises"],
    },
  };

  async search(query: string): Promise<SearchResult[]> {
    log.info({ query }, "Mock search received");
    await new Promise((res) => setTimeout(res, 300)); // Simulate network delay

    const domainMatch = query.match(/site:(\S+)/);
    const domain = domainMatch ? domainMatch[1] : "";

    if (domain === "acme.com") {
      const results: SearchResult[] = [];
      const lowerQuery = query.toLowerCase();

      // Simulate finding different pieces of info based on query keywords
      if (lowerQuery.includes("value prop")) {
        results.push({
          url: "https://acme.com/about",
          snippet: this.mockData[domain].company_value_prop,
        });
      }
      if (lowerQuery.includes("pricing")) {
        results.push({
          url: "https://acme.com/pricing",
          snippet: this.mockData[domain].pricing_model,
        });
      }
      if (lowerQuery.includes("product")) {
        results.push({
          url: "https://acme.com/products",
          snippet: `Our products include ${this.mockData[
            domain
          ].product_names.join(", ")}.`,
        });
      }
      if (lowerQuery.includes("competitors")) {
        results.push({
          url: "https://techcrunch.com/acme-analysis",
          snippet: `Key competitors are ${this.mockData[
            domain
          ].key_competitors.join(", ")}.`,
        });
      }

      // If no specific keywords matched, return a generic result
      if (results.length === 0) {
        results.push({
          url: "https://acme.com",
          snippet: "Acme Corporation is a leading provider of widgets.",
        });
      }
      return results;
    }

    return [
      {
        url: "https://google.com/search",
        snippet: "No relevant information found.",
      },
    ];
  }
}

// In a real app, you would implement this
// export class RealSearchProvider implements SearchProvider { ... }

export function getSearchProvider(): SearchProvider {
  // if (process.env.SEARCH_PROVIDER === 'real') {
  //   return new RealSearchProvider(process.env.SERPAPI_KEY!);
  // }
  return new MockSearchProvider();
}
