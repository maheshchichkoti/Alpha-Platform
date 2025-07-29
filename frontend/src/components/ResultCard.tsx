import React from "react";

type ResearchResult = {
  company_value_prop: string;
  product_names: string[];
  pricing_model: string;
  key_competitors: string[];
  company_domain: string;
};

type Result = {
  id: string;
  payload: ResearchResult;
  sourceUrls: { urls?: string[] }; // Make urls optional
  createdAt: string;
};

type Props = {
  result: Result | null;
};

export default function ResultCard({ result }: Props) {
  if (!result) return null;

  const { payload, sourceUrls, createdAt } = result;

  const formattedDate = new Date(createdAt).toLocaleString();

  return (
    <div className="result-card">
      <div className="card-header">
        <h3>Enrichment Details</h3>
        <small>Generated on: {formattedDate}</small>
      </div>
      <div className="result-grid">
        <div className="result-item">
          <h4>Value Proposition</h4>
          <p>{payload.company_value_prop || "N/A"}</p>
        </div>

        <div className="result-item">
          <h4>Products</h4>
          <ul>
            {payload.product_names?.map((product, i) => (
              <li key={i}>{product}</li>
            )) || <li>N/A</li>}
          </ul>
        </div>

        <div className="result-item">
          <h4>Pricing Model</h4>
          <p>{payload.pricing_model || "N/A"}</p>
        </div>

        <div className="result-item">
          <h4>Key Competitors</h4>
          <ul>
            {payload.key_competitors?.map((competitor, i) => (
              <li key={i}>{competitor}</li>
            )) || <li>N/A</li>}
          </ul>
        </div>
      </div>

      {sourceUrls?.urls && sourceUrls.urls.length > 0 && (
        <div className="sources">
          <h4>Sources</h4>
          <ul>
            {sourceUrls.urls.map((url, i) => (
              <li key={i}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {new URL(url).hostname}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
