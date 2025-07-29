# Entity-Relationship Diagram

This diagram illustrates the relationships between the core database models in the application.

```mermaid
erDiagram
    CAMPAIGNS ||--o{ COMPANIES : "has one or more"
    COMPANIES ||--o{ PEOPLE : "employs one or more"
    COMPANIES ||--o{ CONTEXT_SNIPPETS : "can have many"

    CONTEXT_SNIPPETS ||--o{ SEARCH_LOGS : "is generated from"

    CAMPAIGNS {
        string id PK "UUID"
        string name
        string status
        datetime created_at
    }

    COMPANIES {
        string id PK "UUID"
        string campaign_id FK "References CAMPAIGNS"
        string name
        string domain
        datetime created_at
    }

    PEOPLE {
        string id PK "UUID"
        string company_id FK "References COMPANIES"
        string full_name
        string email
        string title
        datetime created_at
    }

    CONTEXT_SNIPPETS {
        string id PK "UUID"
        string entity_type "'company' or 'person'"
        string entity_id FK "References COMPANIES"
        string snippet_type
        json payload "Agent's structured output"
        json source_urls
        datetime created_at
    }

    SEARCH_LOGS {
        string id PK "UUID"
        string context_snippet_id FK "References CONTEXT_SNIPPETS"
        int iteration
        string query
        json top_results "URLs and snippets"
        datetime created_at
    }
```
